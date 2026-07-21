// src/hooks/useMediaQuery.js
import { useState, useEffect } from 'react'

/**
 * Tracks a CSS media query and re-renders on change. Used to switch between
 * the desktop right-side ParameterDrawer and the mobile MobileBottomSheet
 * without duplicating drawer-open state or content-fetch logic.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

export default useMediaQuery