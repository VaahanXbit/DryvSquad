// src/components/compare/SectionExplainButton.jsx
/*
================================================================================
File Name : SectionExplainButton.jsx
Description : The one Explain button a category owns. Sits at the bottom-
              right of the expanded section body (below the last row) —
              small dark pill, soft breathing glow, subtle pulse, reads as
              an AI action rather than a plain UI control.

              Framer Motion drives an infinite, very subtle scale/shadow
              "breathing" loop so it stays noticeable without being
              distracting — this is a call-to-action, not a spinner.
================================================================================
*/

import { motion } from 'framer-motion'

const SectionExplainButton = ({ onClick, isActive, label = 'Explain' }) => {
  return (
    <div className="flex justify-end px-3 sm:px-6 md:px-8 py-2.5 border-t border-gray-100 dark:border-dark-700/70">
      <motion.button
        onClick={onClick}
        animate={isActive ? {} : {
          boxShadow: [
            '0 0 0px 0px rgba(250,204,21,0.0)',
            '0 0 14px 2px rgba(250,204,21,0.35)',
            '0 0 0px 0px rgba(250,204,21,0.0)',
          ],
          scale: [1, 1.015, 1],
        }}
        transition={isActive ? {} : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-colors duration-200 ${
          isActive
            ? 'bg-yellow-500 text-gray-900'
            : 'bg-gradient-to-br from-gray-900 to-dark-800 dark:from-black dark:to-dark-900 text-yellow-300 border border-yellow-500/30'
        }`}
      >
        <span className="text-sm">✨</span>
        {label}
      </motion.button>
    </div>
  )
}

export default SectionExplainButton