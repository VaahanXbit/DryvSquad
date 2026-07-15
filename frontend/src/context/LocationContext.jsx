// src/context/LocationContext.jsx
/*
================================================================================
File Name : LocationContext.jsx
Description : Single global location used by every page (Home, Car Detail,
              Compare Cars, Search, AI Advisor, EMI Calculator, ...).
              Selected once, persisted to localStorage (and to the user's
              MongoDB profile when logged in), and restored automatically
              on every future visit — no page ever asks for it twice.

              PERMISSION FLOW (refactored):
              On first load, this never opens the custom LocationModal by
              itself. Instead it silently attempts the browser's NATIVE
              geolocation permission first — exactly like Swiggy/Zomato/
              Amazon, the OS-level "Allow this time / Allow while visiting
              / Never allow" dialog is the first thing the user sees, not
              our own UI. If the browser already remembers a "denied"
              decision (checked via the Permissions API where supported),
              we never re-ask.

              The custom LocationModal is now purely on-demand: any
              feature that actually needs a location calls
              ensureLocationForFeature(), which opens the modal only if a
              location genuinely isn't available yet. Today that's
              Compare Cars; the same call is meant to be reused by future
              features (AI Car Finder, Loan Calculator, Insurance, ...)
              without any new location logic.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../services/api'

const LOCATION_STORAGE_KEY = 'locationContext'
// Fallback-only flag for browsers without the Permissions API (e.g. older
// Safari), so we still only ever attempt the silent native prompt once,
// even though we can't directly read the browser's remembered decision.
// Browsers that DO support navigator.permissions are trusted as the
// source of truth instead (they already remember "denied" forever) — see
// the auto-detect effect below.
const PERMISSION_ATTEMPTED_KEY = 'dsLocationPermissionAttempted'

const LocationContext = createContext(undefined)

const readStoredLocation = () => {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.city || !parsed.state) return null
    return parsed
  } catch {
    return null
  }
}

const writeStoredLocation = (location) => {
  try {
    if (location) {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location))
    } else {
      localStorage.removeItem(LOCATION_STORAGE_KEY)
    }
  } catch {
    // localStorage can throw in private-browsing/quota-exceeded cases —
    // the in-memory context state still works for this tab.
  }
}

export const LocationProvider = ({ children }) => {
  const [location, setLocationState] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRestoring, setIsRestoring] = useState(true)
  // True while the silent, app-wide native-geolocation attempt (below) is
  // in flight. Feature pages (Compare Cars, etc.) should wait for this to
  // go false before deciding "no location exists, open the modal" — that
  // way they don't flash the modal while the browser's own dialog is
  // still about to appear.
  const [isAutoDetecting, setIsAutoDetecting] = useState(true)
  const [outsideIndiaMessage, setOutsideIndiaMessage] = useState(null)
  const autoDetectAttemptedRef = useRef(false)

  // Restore location once on app load: localStorage first (instant, works
  // logged-out), then reconcile with the MongoDB profile if logged in and
  // no local copy exists yet (e.g. same account, new device).
  useEffect(() => {
    let cancelled = false

    const restore = async () => {
      const stored = readStoredLocation()
      if (stored) {
        if (!cancelled) setLocationState(stored)
      }

      const token = localStorage.getItem('token')
      if (token) {
        try {
          const result = await api.getCurrentUser(token)
          if (!cancelled && result.success && result.user?.savedLocation?.city) {
            const profileLocation = result.user.savedLocation
            // Only adopt the profile's saved location if we didn't already
            // restore one locally — a location picked on this device very
            // recently should win over a possibly-older profile copy.
            if (!stored) {
              setLocationState(profileLocation)
              writeStoredLocation(profileLocation)
            }
          }
        } catch {
          // Non-fatal — localStorage (if any) already applied above.
        }
      }

      if (!cancelled) setIsRestoring(false)
    }

    restore()
    return () => { cancelled = true }
  }, [])

  const persistLocation = useCallback(async (loc) => {
    setLocationState(loc)
    writeStoredLocation(loc)

    const token = localStorage.getItem('token')
    if (token) {
      try {
        await api.saveLocationToProfile(token, loc)
      } catch {
        // Best-effort — localStorage copy is already the source of truth
        // for this device even if the profile sync fails.
      }
    }
  }, [])

  const setLocation = useCallback((loc) => {
    if (!loc || !loc.city || !loc.state) return
    setOutsideIndiaMessage(null)
    persistLocation(loc)
    setIsModalOpen(false)
  }, [persistLocation])

  const clearLocation = useCallback(() => {
    setLocationState(null)
    writeStoredLocation(null)
  }, [])

  const openLocationModal = useCallback(() => setIsModalOpen(true), [])
  const closeLocationModal = useCallback(() => setIsModalOpen(false), [])

  // "Use My Current Location" — browser geolocation -> backend reverse
  // geocode (OpenCage) -> India-only enforcement. Used both by the modal's
  // explicit button AND by the silent auto-detect effect below (calling
  // this directly is what makes the browser's native dialog appear,
  // without any custom UI of ours in front of it).
  const detectCurrentLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ success: false, message: 'Geolocation is not supported by this browser.' })
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const result = await api.getCurrentLocation(latitude, longitude)
            if (result.outsideIndia) {
              setOutsideIndiaMessage('This feature is currently available only in India.')
              resolve({ success: false, outsideIndia: true, message: result.message })
              return
            }
            if (result.success && result.data?.city) {
              setLocation(result.data)
              resolve({ success: true, data: result.data })
            } else {
              resolve({ success: false, message: result.message || 'Could not determine your location.' })
            }
          } catch (error) {
            resolve({ success: false, message: 'Network error while detecting location.' })
          }
        },
        (error) => {
          const message =
            error.code === error.PERMISSION_DENIED
              ? 'Location permission denied. Please search for your city instead.'
              : 'Could not access your location. Please search for your city instead.'
          resolve({ success: false, message })
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
      )
    })
  }, [setLocation])

  // ----------------------------------------------------------------------
  // Silent, app-wide, native-geolocation-first attempt.
  //
  // Runs once, after restore, only if no location was already found.
  // Never opens the custom modal. Sequence:
  //   1. If the Permissions API is available, read the browser's own
  //      remembered decision for this origin:
  //        - 'denied'  -> stop. The browser already remembers "no" —
  //                       asking again would violate "do not repeatedly
  //                       ask" and browsers won't show the dialog anyway.
  //        - 'granted' -> detectCurrentLocation() resolves silently, no
  //                       dialog shown (permission already given).
  //        - 'prompt'  -> detectCurrentLocation() triggers the browser's
  //                       native "Allow this time / Allow while visiting /
  //                       Never allow" dialog — the first thing the user
  //                       sees, exactly as required.
  //   2. If the Permissions API isn't available (older Safari), we can't
  //      read the browser's memory directly, so we fall back to our own
  //      one-time localStorage flag purely to avoid nagging on every
  //      reload; the browser itself still won't re-show a dialog it
  //      already has a permanent answer for.
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (isRestoring) return
    if (location) { setIsAutoDetecting(false); return }
    if (autoDetectAttemptedRef.current) return
    autoDetectAttemptedRef.current = true

    let cancelled = false

    const run = async () => {
      try {
        if (!navigator.geolocation) return

        let permissionState = 'unknown'
        if (navigator.permissions?.query) {
          try {
            const status = await navigator.permissions.query({ name: 'geolocation' })
            permissionState = status.state // 'granted' | 'prompt' | 'denied'
          } catch {
            permissionState = 'unknown'
          }
        }
        if (cancelled) return

        if (permissionState === 'denied') return // browser already remembers "no"

        if (permissionState === 'unknown') {
          // Permissions API unsupported — use our own one-time guard so we
          // don't silently re-trigger geolocation on every page load.
          let alreadyAttempted = false
          try {
            alreadyAttempted = localStorage.getItem(PERMISSION_ATTEMPTED_KEY) === 'true'
          } catch { /* ignore */ }
          if (alreadyAttempted) return
          try { localStorage.setItem(PERMISSION_ATTEMPTED_KEY, 'true') } catch { /* ignore */ }
        }

        // 'granted' or 'prompt' (or unknown-but-not-yet-attempted): this is
        // the call that surfaces the native browser dialog when needed.
        await detectCurrentLocation()
      } finally {
        if (!cancelled) setIsAutoDetecting(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [isRestoring, location, detectCurrentLocation])

  // ----------------------------------------------------------------------
  // Reusable, on-demand hook for any feature that needs a location.
  // Compare Cars uses this today; AI Car Finder / Loan Calculator /
  // Insurance / any future feature should call the exact same function —
  // no new location logic needed anywhere else.
  //
  // Opens the EXISTING LocationModal only if a location genuinely isn't
  // available. Returns true if a location was already present (caller can
  // proceed immediately), false if it just opened the modal (caller
  // should wait for `location` to become truthy before proceeding).
  // ----------------------------------------------------------------------
  const ensureLocationForFeature = useCallback(() => {
    if (location) return true
    openLocationModal()
    return false
  }, [location, openLocationModal])

  const value = useMemo(() => ({
    location,
    isModalOpen,
    isRestoring,
    isAutoDetecting,
    outsideIndiaMessage,
    setLocation,
    clearLocation,
    openLocationModal,
    closeLocationModal,
    detectCurrentLocation,
    ensureLocationForFeature,
  }), [
    location,
    isModalOpen,
    isRestoring,
    isAutoDetecting,
    outsideIndiaMessage,
    setLocation,
    clearLocation,
    openLocationModal,
    closeLocationModal,
    detectCurrentLocation,
    ensureLocationForFeature,
  ])

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export const useDsLocation = () => {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useDsLocation must be used within a LocationProvider')
  }
  return context
}

export default LocationContext
