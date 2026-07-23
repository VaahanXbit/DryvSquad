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
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              type: 'tween', 
              duration: 5.0,  // 5 seconds
              ease: [0.42, 0, 0.58, 1],  // Smooth ease-in-out for even more refined feel
            }}
            className="flex-1 min-w-0 pointer-events-auto overflow-hidden bg-white dark:bg-dark-800 shadow-2xl"
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ 
                type: 'tween', 
                duration: 2.0,  
                delay: 2.0,     // Content appears at 2 seconds (40% through the animation)
                ease: [0.25, 1, 0.5, 1]  // Smooth bounce-like ease-out
              }}
              className="h-full"
            >
              <SectionExplanationPanel 
                section={section} 
                onClose={onClose} 
                showHeader={true}
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SectionExplainOverlay