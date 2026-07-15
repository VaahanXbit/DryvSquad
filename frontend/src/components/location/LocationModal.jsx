// src/components/location/LocationModal.jsx
/*
================================================================================
File Name : LocationModal.jsx
Description : "Choose your location" modal — shown on first visit, and any
              time the user taps the 📍 city button in the navbar. Two
              paths: auto-detect via browser geolocation + OpenCage reverse
              geocoding, or manual search against the local Location
              collection.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { useDsLocation } from '../../context/LocationContext'
import LocationSearchDropdown from './LocationSearchDropdown'

const LocationModal = () => {
  const { isDark } = useTheme()
  const {
    isModalOpen,
    closeLocationModal,
    setLocation,
    location,
    detectCurrentLocation,
  } = useDsLocation()

  const [isDetecting, setIsDetecting] = useState(false)
  const [detectError, setDetectError] = useState('')

  if (!isModalOpen) return null

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true)
    setDetectError('')
    const result = await detectCurrentLocation()
    setIsDetecting(false)
    if (!result.success) {
      setDetectError(result.message || 'Could not detect your location.')
    }
  }

  const handleSelectSearchResult = (place) => {
    setLocation({
      city: place.city,
      district: place.district,
      state: place.state,
      stateCode: place.stateCode,
      pincode: place.pincode,
      country: place.country || 'India',
      latitude: place.latitude,
      longitude: place.longitude,
    })
    // Close the modal immediately after selection
    closeLocationModal()
  }

  // A previously-selected location exists, so this modal was opened
  // voluntarily (via the navbar) — allow closing without picking again.
  // 🟢 FIX: We remove this check so the close icon is always visible.
  const canDismiss = true 

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={canDismiss ? closeLocationModal : undefined}
          />

          <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border overflow-hidden ${
                isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Choose your location
                    </h2>
                    <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      We use your location to calculate accurate on-road prices, dealership availability, offers and EMI.
                    </p>
                  </div>
                  {/* 🟢 FIX: Always render the close icon */}
                  <button
                    onClick={closeLocationModal}
                    className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isDetecting}
                  className="w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-[#0B1F3A] hover:bg-[#08172C] text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDetecting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Detecting your location…
                    </>
                  ) : (
                    <>📍 Use My Current Location</>
                  )}
                </button>

                {detectError && (
                  <p className="mt-2 text-xs text-red-500 text-center">{detectError}</p>
                )}

                <div className="flex items-center gap-3 my-5">
                  <div className={`flex-1 h-px ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>OR</span>
                  <div className={`flex-1 h-px ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />
                </div>

                {/* 🟢 FIX: Pass closeLocationModal to the dropdown */}
                <LocationSearchDropdown onSelect={handleSelectSearchResult} isDark={isDark} />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default LocationModal