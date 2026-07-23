// src/components/compare/SectionExplainOverlay.jsx
/*
================================================================================
File Name : SectionExplainOverlay.jsx
Description : The desktop "X-Ray inside the section" overlay. Absolutely
              positioned within the section's own row-list wrapper (which
              must be `position: relative`), NOT the viewport. Uses an
              invisible spacer matching the parameter-label column width so
              the panel only ever covers the car-values area — parameter
              names stay visible, and the overlay can never bleed outside
              its own section.

              Now uses the full comparison width (after parameter column)
              and background matches accordion body.
================================================================================
*/

import { motion, AnimatePresence } from 'framer-motion'
import SectionExplanationPanel from './SectionExplanationPanel'

const SectionExplainOverlay = ({ isOpen, section, labelColWidthClass, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-20 flex items-stretch pointer-events-none">
          {/* Invisible spacer — keeps parameter names visible, uncovered */}
          <div className={`${labelColWidthClass} shrink-0`} />

          <motion.div
            initial={{ x: '100%', opacity: 0.4 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.4 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="flex-1 min-w-0 pointer-events-auto overflow-hidden bg-white dark:bg-dark-800"
          >
            <SectionExplanationPanel 
              section={section} 
              onClose={onClose} 
              showHeader={true}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SectionExplainOverlay