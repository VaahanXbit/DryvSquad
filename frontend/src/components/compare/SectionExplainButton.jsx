// src/components/compare/SectionExplainButton.jsx
/*
================================================================================
File Name : SectionExplainButton.jsx
Description : The one Explain button a category owns. Sits at the bottom-
              right of the expanded section body (below the last row).

              - Premium gold-gradient pill, small breathing glow + periodic
                micro-vibrate so it reads as an AI action, not a plain control.
              - Plain text only — no emoji/icon.
              - Explicitly compact on mobile (smaller padding/text, shorter
                copy) and never allowed to stretch full-width — inline-flex
                keeps it pill-shaped at every breakpoint.
================================================================================
*/

import { motion } from 'framer-motion'

const SectionExplainButton = ({ onClick, isActive, label = 'See Explanation Here' }) => {
  return (
    <div className="flex justify-end px-3 sm:px-6 md:px-8 py-2 sm:py-3 border-t border-gray-100 dark:border-dark-700/70">
      <div className="relative inline-block">
        {/* Soft pulsing halo behind the button — pure ambience, no pointer events */}
        {!isActive && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-yellow-400/40 blur-md pointer-events-none"
            animate={{ opacity: [0.35, 0.05, 0.35], scale: [0.95, 1.12, 0.95] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <motion.button
          onClick={onClick}
          animate={isActive ? {} : {
            x: [0, -1.5, 1.5, -1.5, 1.5, 0, 0, 0, 0, 0],
            boxShadow: [
              '0 0 0px 0px rgba(250,204,21,0.0)',
              '0 0 16px 3px rgba(250,204,21,0.45)',
              '0 0 0px 0px rgba(250,204,21,0.0)',
            ],
            scale: [1, 1.03, 1, 1, 1],
          }}
          transition={isActive ? {} : {
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.05, 0.09, 0.13, 0.17, 0.2, 0.4, 0.6, 0.8, 1],
          }}
          whileHover={{ scale: 1.07, y: -1 }}
          whileTap={{ scale: 0.95 }}
          className={`relative inline-flex items-center gap-1.5 sm:gap-2 pl-2.5 pr-3 sm:pl-3.5 sm:pr-4 py-1 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-wide shadow-md sm:shadow-lg whitespace-nowrap transition-colors duration-200 ${
            isActive
              ? 'bg-yellow-500 text-gray-900'
              : 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-gray-900 ring-1 ring-yellow-300/60'
          }`}
        >
          <span className="sm:hidden">{isActive ? 'Explaining…' : 'Explain'}</span>
          <span className="hidden sm:inline">{isActive ? 'Explaining…' : label}</span>
        </motion.button>
      </div>
    </div>
  )
}

export default SectionExplainButton