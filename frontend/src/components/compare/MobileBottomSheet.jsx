// src/components/compare/MobileBottomSheet.jsx
/*
================================================================================
File Name : MobileBottomSheet.jsx
Description : Mobile counterpart to ParameterDrawer (PART 5 of the brief).
              Slides up from the bottom to 80% viewport height, swipe-down
              to dismiss, tap-backdrop to dismiss. Same explanation content
              as the desktop drawer — only the shell differs.
================================================================================
*/

import { motion, AnimatePresence } from 'framer-motion'

const DISMISS_DRAG_THRESHOLD = 120 // px dragged down before we close
const DISMISS_VELOCITY_THRESHOLD = 500 // px/s flick-down before we close

const MobileBottomSheet = ({ isOpen, onClose, title, icon, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 2, ease: [0.16, 1, 0.3, 1] }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > DISMISS_DRAG_THRESHOLD || info.velocity.y > DISMISS_VELOCITY_THRESHOLD) {
                onClose()
              }
            }}
            className="fixed left-0 right-0 bottom-0 z-[61] h-[80vh] bg-white dark:bg-dark-800 rounded-t-2xl shadow-2xl flex flex-col overscroll-contain"
          >
            {/* Grab handle */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-dark-600" />
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-dark-700 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{title}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 shrink-0"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileBottomSheet