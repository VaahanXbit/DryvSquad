// src/components/compare/ParameterDrawer.jsx
/*
================================================================================
File Name : ParameterDrawer.jsx
Description : The X-Ray-style explanation surface (PART 4 of the brief).

              - Desktop: ~420px right-side slide-over. The comparison page
                is NOT pushed or resized — it overlays. ESC and outside-click
                both close it.
              - Mobile: delegates to MobileBottomSheet (80% height sheet,
                swipe-down to dismiss).
              - Only one instance is ever mounted by ComparisonResults, and
                switching the selected parameter just swaps `content` — it
                never spawns a second drawer/modal.

              This component owns none of the "which parameter is selected"
              state — that lives in the parent (ComparisonResults) so the
              open/close + content-swap logic is centralized in one place.
================================================================================
*/

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMediaQuery from '../../hooks/useMediaQuery'
import MobileBottomSheet from './MobileBottomSheet'
import ExplanationContent from './ExplanationContent'

const DRAWER_WIDTH = 420

const ParameterDrawer = ({ isOpen, onClose, param }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  // ESC to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock background scroll while open (both desktop and mobile)
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  if (!isDesktop) {
    return (
      <MobileBottomSheet isOpen={isOpen} onClose={onClose} title={param?.label} icon={param?.icon}>
        {param && <ExplanationContent label={param.label} icon={param.icon} entries={param.entries} winner={param.winner} />}
      </MobileBottomSheet>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — click outside to close. Comparison page shrinks
              slightly via the parent's layout (see ComparisonResults),
              it does not reflow/expand. */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-[60]"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ x: DRAWER_WIDTH, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: DRAWER_WIDTH, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
            style={{ width: DRAWER_WIDTH }}
            className="fixed top-0 right-0 h-full z-[61] bg-white dark:bg-dark-800 shadow-2xl border-l border-gray-200 dark:border-dark-700 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-dark-700 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Parameter Details
              </span>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {param && (
                  <motion.div
                    key={param.key /* re-animates content swap when a different row's arrow is clicked */}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ExplanationContent label={param.label} icon={param.icon} entries={param.entries} winner={param.winner} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ParameterDrawer
export { DRAWER_WIDTH }