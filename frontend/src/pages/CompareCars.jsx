// // src/pages/CompareCars.jsx
// /*
// ================================================================================
// File Name : CompareCars.jsx
// Author : Tahseen Raza
// Created Date : 2026-01-16
// Updated Date : 2026-06-29
// Description : Professional car comparison with CarDekho-style UX
// Company : Vaahan International
// Copyright : (c) 2026 Vaahan International. All rights reserved.
// ================================================================================
// */

// import { useState, useRef, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { useTheme } from '../context/ThemeContext'
// import { api } from '../services/api'
// import ComparisonResults from '../components/compare/ComparisonResults'

// // ========================================
// // CarDekho Style Car Selection Popup
// // ========================================
// const CarSelectionPopup = ({
//   isOpen,
//   onClose,
//   onSelect,
//   isDark,
//   anchorRef,
//   carsData,
//   brandsData,
//   position,
//   otherCarId,
// }) => {
//   const [selectedBrand, setSelectedBrand] = useState('')
//   const [selectedModel, setSelectedModel] = useState('')
//   const [selectedVariant, setSelectedVariant] = useState('')
//   const [step, setStep] = useState(1)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, placement: 'bottom' })
//   const popupRef = useRef(null)
//   const searchInputRef = useRef(null)

//   const brands = brandsData || []

//   useEffect(() => {
//     if (isOpen && anchorRef?.current) {
//       const rect = anchorRef.current.getBoundingClientRect()
//       const viewportHeight = window.innerHeight
//       const popupHeight = 400
//       const gap = 8

//       let top, placement

//       if (rect.bottom + popupHeight + gap < viewportHeight) {
//         top = rect.bottom + gap
//         placement = 'bottom'
//       } else {
//         top = rect.top - popupHeight - gap
//         placement = 'top'
//         if (top < 10) top = 10
//       }

//       const popupWidth = 340
//       let left = rect.left + (rect.width / 2) - (popupWidth / 2)

//       if (left < 10) left = 10
//       if (left + popupWidth > window.innerWidth - 10) {
//         left = window.innerWidth - popupWidth - 10
//       }

//       setPopupPosition({ top, left, placement })
//     }
//   }, [isOpen, anchorRef])

//   useEffect(() => {
//     if (isOpen && searchInputRef.current) {
//       setTimeout(() => searchInputRef.current?.focus(), 150)
//     }
//   }, [isOpen, step])

//   const getAvailableBrands = () => {
//     if (!carsData) return []
//     const allBrands = [...new Set(carsData.map(c => c.brand))]
//     if (!otherCarId) return allBrands
//     return allBrands.filter(brand => {
//       const availableCars = carsData.filter(c => c.brand === brand && c.id !== otherCarId)
//       return availableCars.length > 0
//     })
//   }

//   const getAvailableModelsForBrand = (brand) => {
//     if (!carsData) return []
//     const allModels = [...new Set(carsData.filter(c => c.brand === brand).map(c => c.model))]
//     if (!otherCarId) return allModels
//     return allModels.filter(model => {
//       const availableCars = carsData.filter(c => c.brand === brand && c.model === model && c.id !== otherCarId)
//       return availableCars.length > 0
//     })
//   }

//   const getAvailableVariantsForBrandModel = (brand, model) => {
//     if (!carsData) return []
//     const allVariants = carsData.filter(c => c.brand === brand && c.model === model).map(c => c.variant)
//     if (!otherCarId) return allVariants
//     const otherCar = carsData.find(c => c.id === otherCarId)
//     if (otherCar && otherCar.brand === brand && otherCar.model === model) {
//       return allVariants.filter(v => v !== otherCar.variant)
//     }
//     return allVariants
//   }

//   const handleBrandSelect = (brand) => {
//     setSelectedBrand(brand)
//     setSelectedModel('')
//     setSelectedVariant('')
//     setSearchQuery('')
//     setStep(2)
//   }

//   const handleModelSelect = (model) => {
//     setSelectedModel(model)
//     setSelectedVariant('')
//     setSearchQuery('')
//     setStep(3)
//   }

//   const handleVariantSelect = (variant) => {
//     setSelectedVariant(variant)
//     const car = carsData?.find(c =>
//       c.brand === selectedBrand &&
//       c.model === selectedModel &&
//       c.variant === variant
//     )
//     if (car) {
//       onSelect(car)
//       onClose()
//       resetSelection()
//     }
//   }

//   const resetSelection = () => {
//     setSelectedBrand('')
//     setSelectedModel('')
//     setSelectedVariant('')
//     setSearchQuery('')
//     setStep(1)
//   }

//   const handleClose = () => {
//     resetSelection()
//     onClose()
//   }

//   const handleBack = () => {
//     if (step === 2) {
//       setStep(1)
//       setSelectedModel('')
//       setSearchQuery('')
//     } else if (step === 3) {
//       setStep(2)
//       setSelectedVariant('')
//       setSearchQuery('')
//     }
//   }

//   const getModels = () => {
//     if (!selectedBrand) return []
//     return getAvailableModelsForBrand(selectedBrand)
//   }

//   const getVariants = () => {
//     if (!selectedBrand || !selectedModel) return []
//     return getAvailableVariantsForBrandModel(selectedBrand, selectedModel)
//   }

//   const filteredBrands = searchQuery.trim()
//     ? getAvailableBrands().filter(b => b.toLowerCase().includes(searchQuery.toLowerCase()))
//     : getAvailableBrands()

//   const filteredModels = searchQuery.trim()
//     ? getModels().filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
//     : getModels()

//   const filteredVariants = searchQuery.trim()
//     ? getVariants().filter(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
//     : getVariants()

//   const renderBrandStep = () => {
//     return (
//       <div>
//         <div className="mb-3">
//           <div className="relative">
//             <svg
//               className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
//               fill="none" stroke="currentColor" viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input
//               ref={searchInputRef}
//               type="text"
//               placeholder="Search Brand..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none ${isDark
//                 ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-500'
//                 : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
//                 }`}
//             />
//           </div>
//         </div>

//         <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
//           {filteredBrands.map((brand) => {
//             const hasModels = getAvailableModelsForBrand(brand).length > 0
//             const brandAvailableCount = carsData.filter(c => c.brand === brand && c.id !== otherCarId).length
//             return (
//               <button
//                 key={brand}
//                 onClick={() => hasModels && handleBrandSelect(brand)}
//                 disabled={!hasModels}
//                 className={`w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-all hover:scale-[1.01] flex items-center justify-between ${hasModels
//                   ? isDark
//                     ? 'text-gray-200 hover:bg-dark-700 hover:text-white'
//                     : 'text-gray-800 hover:bg-gray-100'
//                   : 'opacity-40 cursor-not-allowed'
//                   }`}
//               >
//                 <span>{brand}</span>
//                 {hasModels && (
//                   <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//                     {brandAvailableCount} variants
//                   </span>
//                 )}
//               </button>
//             )
//           })}
//           {filteredBrands.length === 0 && (
//             <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//               No brands available
//             </p>
//           )}
//         </div>
//       </div>
//     )
//   }

//   const renderModelStep = () => {
//     return (
//       <div>
//         <div className="mb-3 flex items-center gap-3">
//           <button
//             onClick={handleBack}
//             className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors`}
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>
//           <div className="flex-1">
//             <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//               {selectedBrand}
//             </p>
//             <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//               Select a model
//             </p>
//           </div>
//         </div>

//         <div className="mb-3">
//           <div className="relative">
//             <svg
//               className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
//               fill="none" stroke="currentColor" viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input
//               ref={searchInputRef}
//               type="text"
//               placeholder="Search Model..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none ${isDark
//                 ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-500'
//                 : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
//                 }`}
//             />
//           </div>
//         </div>

//         <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
//           {filteredModels.map((model) => (
//             <button
//               key={model}
//               onClick={() => handleModelSelect(model)}
//               className={`w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-all hover:scale-[1.01] ${isDark
//                 ? 'text-gray-200 hover:bg-dark-700 hover:text-white'
//                 : 'text-gray-800 hover:bg-gray-100'
//                 }`}
//             >
//               {model}
//             </button>
//           ))}
//           {filteredModels.length === 0 && (
//             <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//               No models available
//             </p>
//           )}
//         </div>
//       </div>
//     )
//   }

//   const renderVariantStep = () => {
//     return (
//       <div>
//         <div className="mb-3 flex items-center gap-3">
//           <button
//             onClick={handleBack}
//             className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors`}
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>
//           <div className="flex-1">
//             <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//               {selectedBrand} → {selectedModel}
//             </p>
//             <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//               Select a variant
//             </p>
//           </div>
//         </div>

//         <div className="mb-3">
//           <div className="relative">
//             <svg
//               className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
//               fill="none" stroke="currentColor" viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input
//               ref={searchInputRef}
//               type="text"
//               placeholder="Search Variant..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none ${isDark
//                 ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-500'
//                 : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
//                 }`}
//             />
//           </div>
//         </div>

//         <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
//           {filteredVariants.map((variant) => {
//             const car = carsData?.find(c =>
//               c.brand === selectedBrand &&
//               c.model === selectedModel &&
//               c.variant === variant
//             )
//             return (
//               <button
//                 key={variant}
//                 onClick={() => handleVariantSelect(variant)}
//                 className={`w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-all hover:scale-[1.01] flex items-center justify-between ${isDark
//                   ? 'text-gray-200 hover:bg-dark-700 hover:text-white'
//                   : 'text-gray-800 hover:bg-gray-100'
//                   }`}
//               >
//                 <span>{variant}</span>
//                 {car && (
//                   <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//                     {car.price}
//                   </span>
//                 )}
//               </button>
//             )
//           })}
//           {filteredVariants.length === 0 && (
//             <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//               No variants available
//             </p>
//           )}
//         </div>
//       </div>
//     )
//   }

//   if (!isOpen) return null

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <><motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.15 }}
//             className="fixed inset-0 z-40"
//             onClick={handleClose}
//           />

//           <motion.div
//             ref={popupRef}
//             initial={{ opacity: 0, scale: 0.95, y: popupPosition.placement === 'bottom' ? -5 : 5 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: popupPosition.placement === 'bottom' ? -5 : 5 }}
//             transition={{ duration: 0.2, ease: 'easeOut' }}
//             className="fixed z-50 w-[340px] max-w-[calc(100vw-32px)]"
//             style={{
//               top: popupPosition.top,
//               left: popupPosition.left,
//               maxHeight: 'calc(100vh - 32px)',
//             }}
//           >
//             <div
//               className={`rounded-2xl shadow-2xl p-4 overflow-y-auto ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-100'}`}
//               style={{ maxHeight: 'calc(100vh - 48px)' }}
//             >
//               <div
//                 className={`absolute w-3 h-3 rotate-45 left-1/2 -translate-x-1/2 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'}`}
//                 style={{
//                   [popupPosition.placement === 'bottom' ? 'top' : 'bottom']: -6,
//                   borderTop: '1px solid',
//                   borderLeft: '1px solid',
//                   borderColor: isDark ? '#374151' : '#e5e7eb',
//                 }}
//               />

//               <div className="flex items-center justify-between mb-3">
//                 <div>
//                   <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                     {step === 1 && 'Select Brand/Model'}
//                     {step === 2 && 'Select Model'}
//                     {step === 3 && 'Select Variant'}
//                   </h3>
//                   {step === 1 && (
//                     <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//                       Choose a brand from the list below
//                     </p>
//                   )}
//                 </div>
//                 <button
//                   onClick={handleClose}
//                   className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors`}
//                 >
//                   <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               <div className="flex items-center gap-1 mb-3">
//                 {[1, 2, 3].map((s) => (
//                   <div key={s} className="flex items-center flex-1">
//                     <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all ${step >= s
//                       ? 'bg-yellow-500 text-gray-900'
//                       : isDark
//                         ? 'bg-dark-700 text-gray-500'
//                         : 'bg-gray-200 text-gray-400'
//                       }`}>
//                       {step > s ? '✓' : s}
//                       <span className="hidden xs:inline">
//                         {s === 1 && 'Brand'}
//                         {s === 2 && 'Model'}
//                         {s === 3 && 'Variant'}
//                       </span>
//                     </div>
//                     {s < 3 && (
//                       <div className={`flex-1 h-0.5 mx-0.5 ${step > s ? 'bg-yellow-500' : isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="min-h-[150px]">
//                 {step === 1 && renderBrandStep()}
//                 {step === 2 && renderModelStep()}
//                 {step === 3 && renderVariantStep()}
//               </div>

//               <div className="mt-3 pt-2 border-t border-gray-200 dark:border-dark-700 flex items-center justify-between">
//                 <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//                   {step === 1 && 'Choose a brand'}
//                   {step === 2 && `Step 2 of 3`}
//                   {step === 3 && `Step 3 of 3`}
//                 </span>
//                 {step > 1 && (
//                   <button
//                     onClick={handleBack}
//                     className={`text-[10px] font-medium px-3 py-1 rounded-lg transition-colors ${isDark
//                       ? 'text-gray-400 hover:text-white hover:bg-dark-700'
//                       : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
//                       }`}
//                   >
//                     ← Back
//                   </button>
//                 )}
//               </div>
//             </div>
//           </motion.div></>
//       )}
//     </AnimatePresence>
//   )
// }

// // ========================================
// // Selected Car Display Card
// // ========================================
// const SelectedCarCard = ({ car, onRemove, onEdit, isDark }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.95 }}
//       transition={{ duration: 0.2 }}
//       className={`relative overflow-hidden rounded-xl border h-full flex flex-col ${
//         isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 hover:shadow-sm'
//       }`}
//     >
//       <button
//         onClick={onRemove}
//         className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-colors ${
//           isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/80' : 'text-gray-500 hover:text-gray-800 hover:bg-black/5'
//         }`}
//       >
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//         </svg>
//       </button>

//       {/* Image Area */}
//       <div className={`w-full h-44 p-4 flex items-center justify-center ${
//         isDark ? 'bg-dark-700/40' : 'bg-[#f4f5f7]'
//       }`}>
//         <img
//           src={car.image}
//           alt={car.model}
//           className="max-w-full max-h-full object-contain drop-shadow-sm mix-blend-multiply dark:mix-blend-normal"
//         />
//       </div>

//       {/* Text Details Area */}
//       <div className="p-4 text-left flex-1 flex flex-col">
//         <h4 className={`font-semibold text-[15px] leading-snug ${isDark ? 'text-white' : 'text-gray-800'}`}>
//           {car.brand} {car.model}
//         </h4>
//         <p className={`text-xs mt-1 text-gray-500 dark:text-gray-400 flex items-center gap-1`}>
//           <span className="truncate">{car.variant}</span> 
//           <button onClick={onEdit} className="text-[10px] underline text-gray-400 hover:text-gray-600 cursor-pointer">✎</button>
//         </p>

//         <div className="mt-auto pt-3">
//           <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//             {car.price}*
//           </p>
//           <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//             *Ex-showroom Price
//           </p>
//         </div>
//       </div>
//     </motion.div>
//   )
// }

// // ========================================
// // Add Car Button 
// // ========================================
// const AddCarButton = ({ onClick, isDark }) => {
//   return (
//     <motion.button
//       whileHover={{ scale: 1.01 }}
//       whileTap={{ scale: 0.99 }}
//       onClick={onClick}
//       className={`w-full h-[320px] rounded-xl border flex flex-col items-center justify-center transition-all bg-white dark:bg-dark-800 ${
//         isDark ? 'border-dark-700 hover:border-dark-500 text-gray-400' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-500'
//       }`}
//     >
//       <div className="w-16 h-16 rounded-full border border-dashed border-gray-300 dark:border-dark-600 flex items-center justify-center mb-3">
//         <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
//         </svg>
//       </div>
//       <span className="text-sm font-medium mb-6">Add car</span>
      
//       {/* Mock Dropdowns */}
//       <div className="w-3/4 max-w-[200px] space-y-2">
//         <div className={`w-full py-2.5 px-3 text-left text-[13px] rounded border flex justify-between items-center ${
//           isDark ? 'bg-dark-700/50 border-dark-600/50 text-gray-400' : 'bg-gray-50/50 border-gray-200/60 text-gray-400'
//         }`}>
//           Select Brand/Model
//           <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
//         </div>
//         <div className={`w-full py-2.5 px-3 text-left text-[13px] rounded border flex justify-between items-center ${
//           isDark ? 'bg-dark-700/30 border-dark-600/30 text-gray-500' : 'bg-gray-50/30 border-gray-200/40 text-gray-300'
//         }`}>
//           Select Variant
//           <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
//         </div>
//       </div>
//     </motion.button>
//   )
// }

// // ========================================
// // Sticky Comparison Header 
// // ========================================
// const StickyComparisonHeader = ({ car1, car2, onEdit, onClose, isDark }) => {
//   const [isVisible, setIsVisible] = useState(false)

//   useEffect(() => {
//     const handleScroll = () => {
//       const carCardsSection = document.getElementById('comparison-car-cards')
//       if (carCardsSection) {
//         const rect = carCardsSection.getBoundingClientRect()
//         const shouldShow = rect.bottom <= 80
//         setIsVisible(shouldShow)
        
//         const event = new CustomEvent('stickyHeaderVisibility', { 
//           detail: { visible: shouldShow } 
//         })
//         window.dispatchEvent(event)
//       }
//     }

//     window.addEventListener('scroll', handleScroll, { passive: true })
//     return () => window.removeEventListener('scroll', handleScroll)
//   }, [])

//   if (!isVisible) return null

//   return (
//     <div 
//       id="sticky-comparison-header"
//       className={`fixed top-0 left-0 right-0 z-[45] bg-white/95 backdrop-blur-md dark:bg-dark-900/95 border-b border-gray-200 dark:border-dark-700 shadow-md theme-transition transition-all duration-300`}
//       style={{ top: 0 }}
//     >
//       <div className="container-custom">
//         <div className="max-w-6xl mx-auto px-6 md:px-8">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 md:py-5 items-center">
            
//             {/* Column 1 */}
//             <div className="hidden md:flex items-center justify-center">
//               <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-dark-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-dark-600 shadow-sm">
//                 Comparison View
//               </span>
//             </div>

//             {/* Column 2: Car 1 Sticky */}
//             <div className="flex items-center justify-center relative md:border-r md:border-gray-200 dark:md:border-dark-700">
//               <div className="flex items-center gap-4">
//                 <div className="w-16 h-12 flex items-center justify-center bg-[#f4f5f7] dark:bg-dark-800 rounded p-1 border border-gray-100 dark:border-dark-600">
//                   <img 
//                     src={car1.image} 
//                     alt={car1.model} 
//                     className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
//                   />
//                 </div>
//                 <div className="text-left flex flex-col justify-center">
//                   <span className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
//                     {car1.brand} {car1.model}
//                   </span>
//                   <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">
//                     {car1.price} 
//                     <span className="mx-1.5 text-gray-300 dark:text-gray-600">|</span>
//                     <button onClick={() => onEdit(1)} className="hover:text-orange-500 text-gray-400 underline transition-colors">
//                       Edit
//                     </button>
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Column 3: Car 2 Sticky */}
//             <div className="flex items-center justify-center">
//               <div className="flex items-center gap-4">
//                 <div className="w-16 h-12 flex items-center justify-center bg-[#f4f5f7] dark:bg-dark-800 rounded p-1 border border-gray-100 dark:border-dark-600">
//                   <img 
//                     src={car2.image} 
//                     alt={car2.model} 
//                     className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
//                   />
//                 </div>
//                 <div className="text-left flex flex-col justify-center">
//                   <span className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
//                     {car2.brand} {car2.model}
//                   </span>
//                   <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">
//                     {car2.price}
//                     <span className="mx-1.5 text-gray-300 dark:text-gray-600">|</span>
//                     <button onClick={() => onEdit(2)} className="hover:text-orange-500 text-gray-400 underline transition-colors">
//                       Edit
//                     </button>
//                   </span>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ========================================
// // Popular Comparison Card
// // ========================================
// const PopularComparisonCard = ({ comparison, onClick, isDark }) => {
//   const { car1, car2, title, badge } = comparison

//   return (
//     <motion.button
//       whileHover={{ y: -4, scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//       onClick={onClick}
//       className={`relative rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 text-left border ${isDark
//         ? 'bg-dark-800 border-dark-700 hover:border-gray-600'
//         : 'bg-white border-gray-200 hover:border-gray-300'
//         }`}
//     >
//       {badge && (
//         <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.includes('🔥')
//           ? 'bg-red-500 text-white'
//           : 'bg-yellow-500 text-gray-900'
//           }`}>
//           {badge}
//         </div>
//       )}

//       <div className="flex items-center justify-between mb-2">
//         <div className="flex-1 text-center">
//           <img src={car1.image} alt={car1.model} className="w-full h-20 object-contain mx-auto mb-1.5 rounded bg-[#f4f5f7] dark:bg-dark-700 p-2 mix-blend-multiply dark:mix-blend-normal" />
//           <span className="text-xs font-semibold block text-gray-800 dark:text-white theme-transition">{car1.model}</span>
//           <span className="text-[10px] text-gray-500 dark:text-gray-400 theme-transition truncate block max-w-full">{car1.variant}</span>
//         </div>

//         <div className="flex flex-col items-center px-2">
//           <span className="text-[10px] font-bold text-gray-400">VS</span>
//         </div>

//         <div className="flex-1 text-center">
//           <img src={car2.image} alt={car2.model} className="w-full h-20 object-contain mx-auto mb-1.5 rounded bg-[#f4f5f7] dark:bg-dark-700 p-2 mix-blend-multiply dark:mix-blend-normal" />
//           <span className="text-xs font-semibold block text-gray-800 dark:text-white theme-transition">{car2.model}</span>
//           <span className="text-[10px] text-gray-500 dark:text-gray-400 theme-transition truncate block max-w-full">{car2.variant}</span>
//         </div>
//       </div>

//       <div className="text-center pt-2 border-t border-gray-100 dark:border-dark-700 mt-2">
//         <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'} theme-transition`}>
//           {title}
//         </h4>
//         <span className="text-[10px] font-medium text-orange-500 hover:text-orange-600 transition-colors mt-1 block">
//           Compare Now
//         </span>
//       </div>
//     </motion.button>
//   )
// }

// // ========================================
// // Main CompareCars Component
// // ========================================
// const CompareCars = () => {
//   const { isDark } = useTheme()

//   const [carsData, setCarsData] = useState([])
//   const [brandsData, setBrandsData] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [dataError, setDataError] = useState(null)

//   const [car1Id, setCar1Id] = useState(null)
//   const [car2Id, setCar2Id] = useState(null)
//   const [showPopup1, setShowPopup1] = useState(false)
//   const [showPopup2, setShowPopup2] = useState(false)

//   const [comparisonData, setComparisonData] = useState(null)
//   const [isComparing, setIsComparing] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [showComparison, setShowComparison] = useState(false)

//   const [editingCar, setEditingCar] = useState(null)
//   const [showEditPopup, setShowEditPopup] = useState(false)
//   const [editAnchorRef, setEditAnchorRef] = useState(null)

//   const [popularCardsData, setPopularCardsData] = useState([])

//   const addCarRef1 = useRef(null)
//   const addCarRef2 = useRef(null)

//   const carCardRef1 = useRef(null)
//   const carCardRef2 = useRef(null)

//   useEffect(() => {
//     const fetchCarData = async () => {
//       try {
//         setLoading(true)
//         setDataError(null)

//         const response = await api.getAllCars()

//         if (response.success) {
//           const flattened = []
//           response.data.forEach(brand => {
//             brand.models.forEach(model => {
//               model.variants.forEach(variant => {
//                 flattened.push({
//                   id: variant._id,
//                   brand: brand.brand,
//                   model: model.name,
//                   variant: variant.name,
//                   slug: model.slug,
//                   image: model.image,
//                   price: variant.price,
//                   exShowroomPrice: variant.exShowroomPrice,
//                   engine: variant.engine,
//                   torque: variant.torque,
//                   power: variant.power,
//                   mileage: variant.mileage,
//                   torqueNumeric: variant.torqueNumeric,
//                   powerNumeric: variant.powerNumeric,
//                   mileageNumeric: variant.mileageNumeric,
//                   overallScore: variant.overallScore || 0,
//                   scores: variant.scores || null,
//                   factorScores: variant.factorScores || null,
//                   specifications: variant.specifications || {},
//                 })
//               })
//             })
//           })
//           setCarsData(flattened)
//           const uniqueBrands = [...new Set(flattened.map(c => c.brand))]
//           setBrandsData(uniqueBrands)
//         } else {
//           setDataError(response.message || 'Failed to load car data')
//         }
//       } catch (error) {
//         console.error('❌ Error fetching car data:', error)
//         setDataError('Network error. Please try again.')
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchCarData()
//   }, [])

//   // ============================================================================
//   // ✅ 5 POPULAR COMPARISONS GENERATION (GUARANTEED MATCHES)
//   // Evaluates data matrix using safe fallbacks, strictly ensuring EV vs EV & ICE vs ICE.
//   // ============================================================================
//   useEffect(() => {
//     if (carsData.length === 0) return

//     const getHighestRatedCar = (searchTerms) => {
//       const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms]
//       let matches = []
      
//       for (const term of terms) {
//         matches = carsData.filter(c => c.model.toLowerCase().includes(term.toLowerCase()))
//         if (matches.length > 0) break
//       }
      
//       if (matches.length === 0) return null
      
//       return matches.reduce((prev, current) => {
//         const prevScore = prev.overallScore || 0
//         const currScore = current.overallScore || 0
//         return (currScore > prevScore) ? current : prev
//       })
//     }

//     // Using highly robust fallback keywords based strictly on the user's provided inventory
//     const baseComparisons = [
//       { id: 1, search1: ['Creta Electric', 'Creta EV', 'Creta'], search2: ['Harrier EV', 'Harrier'], title: 'Creta EV vs Harrier EV', badge: '🔥 EV Premium' },
//       { id: 2, search1: ['e VITARA', 'Vitara'], search2: ['XUV 3XO EV', '3XO EV', 'XUV 3XO'], title: 'e Vitara vs 3XO EV', badge: '⚡ EV Compact' },
//       { id: 3, search1: ['Tiago EV', 'Tiago'], search2: ['XUV400', 'XUV 400'], title: 'Tiago EV vs XUV400 EV', badge: '⭐ Popular EV' },
//       { id: 4, search1: ['BasaltX', 'Basalt'], search2: ['Seltos'], title: 'BasaltX vs Seltos', badge: '🚗 ICE SUV' },
//       { id: 5, search1: ['Dzire'], search2: ['C3X', 'C3'], title: 'Dzire vs C3X', badge: '🚗 ICE Notch' },
//     ]

//     const generated = baseComparisons.map(comp => {
//       const c1 = getHighestRatedCar(comp.search1)
//       const c2 = getHighestRatedCar(comp.search2)
//       if (c1 && c2) {
//         return {
//           id: comp.id,
//           title: comp.title,
//           badge: comp.badge,
//           car1: c1,
//           car2: c2
//         }
//       }
//       return null
//     }).filter(Boolean)

//     setPopularCardsData(generated)
//   }, [carsData])

//   const getCarById = (id) => carsData.find(c => c.id === id) || null
//   const car1 = car1Id ? getCarById(car1Id) : null
//   const car2 = car2Id ? getCarById(car2Id) : null

//   const executeComparison = async (id1, id2) => {
//     if (!id1 || !id2) return

//     setIsLoading(true)
//     setIsComparing(true)
//     try {
//       const response = await api.compareCars(id1, id2)
//       if (response.success) {
//         setComparisonData(response.data)
//         setShowComparison(true)
//         setTimeout(() => {
//           document.getElementById('comparison-results')?.scrollIntoView({ behavior: 'smooth' })
//         }, 200)
//       } else {
//         console.error('❌ Comparison failed:', response.message)
//       }
//     } catch (error) {
//       console.error('❌ Comparison error:', error)
//     } finally {
//       setIsLoading(false)
//       setIsComparing(false)
//     }
//   }

//   const handleCompare = () => {
//     executeComparison(car1Id, car2Id)
//   }

//   const handleCarSelect = (position, car) => {
//     let newCar1Id = car1Id
//     let newCar2Id = car2Id

//     if (position === 1) {
//       setCar1Id(car.id)
//       newCar1Id = car.id
//     } else if (position === 2) {
//       setCar2Id(car.id)
//       newCar2Id = car.id
//     }
    
//     setShowPopup1(false)
//     setShowPopup2(false)
//     setShowEditPopup(false)
    
//     if (newCar1Id && newCar2Id && (showComparison || editingCar !== null)) {
//       executeComparison(newCar1Id, newCar2Id)
//     }
    
//     setEditingCar(null)
//     setEditAnchorRef(null)
//   }

//   const openPopup = (position) => {
//     if (position === 1) {
//       setShowPopup1(true)
//     } else {
//       setShowPopup2(true)
//     }
//   }

//   const handleEditCar = (position) => {
//     setEditingCar(position)
//     if (position === 1) {
//       setEditAnchorRef(carCardRef1)
//     } else {
//       setEditAnchorRef(carCardRef2)
//     }
//     setShowEditPopup(true)
//   }

//   const closeComparison = () => {
//     setShowComparison(false)
//   }

//   const resetAll = () => {
//     setCar1Id(null)
//     setCar2Id(null)
//     setComparisonData(null)
//     setIsComparing(false)
//     setShowComparison(false)
//     setEditingCar(null)
//     setShowEditPopup(false)
//     setEditAnchorRef(null)
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//   }

//   const handlePopularCompare = (comparison) => {
//     setCar1Id(comparison.car1.id)
//     setCar2Id(comparison.car2.id)
//     setTimeout(() => executeComparison(comparison.car1.id, comparison.car2.id), 300)
//   }

//   if (loading) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center pt-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
//           <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading car data...</p>
//         </div>
//       </div>
//     )
//   }

//   if (dataError) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center pt-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
//         <div className="text-center">
//           <p className="text-red-500">{dataError}</p>
//           <button onClick={() => window.location.reload()} className="mt-4 bg-[#ff5a00] hover:bg-[#e05312] text-white font-semibold py-2 px-6 rounded transition-all">Retry</button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className={`min-h-screen ${isDark ? 'bg-dark-900' : 'bg-white'}`}>
      
//       {/* HERO SECTION */}
//       <section className="relative pt-32 pb-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
//         <div className="absolute inset-0 z-0">
//           <img
//             src="./imageCompare.png"
//             alt="Compare Cars"
//             className="w-full h-full object-cover opacity-30"
//           />
//           <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
//         </div>

//         <div className="container-custom relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="max-w-3xl"
//           >
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2, duration: 0.5 }}
//               className="inline-block px-4 py-1.5 bg-[#fc641c] rounded-full text-white text-sm font-semibold mb-6 shadow-sm"
//             >
//               🚗 Car Comparison Tool
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3, duration: 0.5 }}
//               className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
//             >
//               Compare Cars{' '}
//               <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Side by Side</span>
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4, duration: 0.5 }}
//               className="text-xl text-gray-300 mb-8"
//             >
//               Select two cars to compare their features, scores, and specifications
//             </motion.p>
//           </motion.div>
//         </div>
//       </section>

//       {/* Car Selection - Hidden when comparison results are shown */}
//       {!showComparison && (
//         <section className={`py-12 transition-colors duration-300 relative ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
//           <div className="container-custom">
//             <div className="max-w-4xl mx-auto">
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch relative">
                
//                 {/* Left Card */}
//                 <div className="w-full h-full">
//                   <AnimatePresence mode="wait">
//                     {car1 ? (
//                       <SelectedCarCard 
//                         key="car1" 
//                         car={car1} 
//                         onRemove={() => setCar1Id(null)} 
//                         onEdit={() => handleEditCar(1)} 
//                         isDark={isDark} 
//                       />
//                     ) : (
//                       <div ref={addCarRef1} className="w-full h-full">
//                         <AddCarButton key="add1" onClick={() => openPopup(1)} isDark={isDark} />
//                       </div>
//                     )}
//                   </AnimatePresence>
//                 </div>

//                 {/* Optional Subtle VS separator in the middle */}
//                 <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-dark-800 border shadow-sm border-gray-200 dark:border-dark-600 text-[10px] font-bold text-gray-400">
//                   VS
//                 </div>

//                 {/* Right Card */}
//                 <div className="w-full h-full">
//                   <AnimatePresence mode="wait">
//                     {car2 ? (
//                       <SelectedCarCard 
//                         key="car2" 
//                         car={car2} 
//                         onRemove={() => setCar2Id(null)} 
//                         onEdit={() => handleEditCar(2)} 
//                         isDark={isDark} 
//                       />
//                     ) : (
//                       <div ref={addCarRef2} className="w-full h-full">
//                         <AddCarButton key="add2" onClick={() => openPopup(2)} isDark={isDark} />
//                       </div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </div>

//               <div className="text-center mt-8">
//                 <motion.button
//                   whileHover={car1 && car2 ? { scale: 1.01 } : {}}
//                   whileTap={car1 && car2 ? { scale: 0.99 } : {}}
//                   onClick={handleCompare}
//                   disabled={!car1 || !car2}
//                   className={`w-full md:w-1/3 min-w-[280px] px-8 py-3.5 rounded-lg font-bold text-base transition-all duration-300 ${
//                     car1 && car2
//                     ? 'bg-[#fc641c] hover:bg-[#e65a18] text-white shadow-md shadow-orange-500/20' 
//                     : 'bg-gray-200 dark:bg-dark-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
//                   }`}
//                 >
//                   Compare Now
//                 </motion.button>
//                 {(car1 || car2) && (
//                   <button onClick={resetAll} className={`block mx-auto mt-4 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>
//                     Reset Selection
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Popups */}
//       <CarSelectionPopup isOpen={showPopup1} onClose={() => setShowPopup1(false)} onSelect={(car) => handleCarSelect(1, car)} position={1} otherCarId={car2Id} isDark={isDark} anchorRef={addCarRef1} carsData={carsData} brandsData={brandsData} />
//       <CarSelectionPopup isOpen={showPopup2} onClose={() => setShowPopup2(false)} onSelect={(car) => handleCarSelect(2, car)} position={2} otherCarId={car1Id} isDark={isDark} anchorRef={addCarRef2} carsData={carsData} brandsData={brandsData} />
//       <CarSelectionPopup isOpen={showEditPopup} onClose={() => { setShowEditPopup(false); setEditingCar(null); setEditAnchorRef(null); }} onSelect={(car) => handleCarSelect(editingCar, car)} position={editingCar} otherCarId={editingCar === 1 ? car2Id : car1Id} isDark={isDark} anchorRef={editAnchorRef} carsData={carsData} brandsData={brandsData} />

//       {/* Loading Modal */}
//       <AnimatePresence>
//         {isLoading && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
//             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`rounded-2xl p-8 max-w-md w-full text-center shadow-2xl ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
//               <div className="relative w-24 h-24 mx-auto mb-6">
//                 <div className={`absolute inset-0 border-4 rounded-full ${isDark ? 'border-dark-600' : 'border-gray-200'}`} />
//                 <div className="absolute inset-0 border-4 border-[#fc641c] rounded-full border-t-transparent animate-spin" />
//                 <div className="absolute inset-0 flex items-center justify-center text-3xl">🚗</div>
//               </div>
//               <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Analyzing Cars</h3>
//               <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Comparing features and specifications...</p>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {showComparison && car1 && car2 && (
//         <StickyComparisonHeader car1={car1} car2={car2} onEdit={handleEditCar} onClose={closeComparison} isDark={isDark} />
//       )}

//       {showComparison && comparisonData && (
//         <section id="comparison-results" className={`py-12 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
//           <div className="container-custom">
//             <div className="max-w-6xl mx-auto">
//               <ComparisonResults comparisonData={comparisonData} car1={car1} car2={car2} onClear={closeComparison} onEdit={handleEditCar} carCardRef1={carCardRef1} carCardRef2={carCardRef2} />
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Popular Comparisons */}
//       <section className={`py-12 md:py-16 transition-colors duration-300 ${showComparison ? (isDark ? 'bg-dark-900 border-t border-dark-700' : 'bg-white border-t border-gray-200') : (isDark ? 'bg-dark-900' : 'bg-gray-50')}`}>
//         <div className="container-custom">
//           <div className="max-w-6xl mx-auto">
//             <div className="mb-8">
//               <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Popular Comparisons</h2>
//             </div>
            
//             {/* Displaying all 5 cards in rows layout smoothly */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
//               {popularCardsData.map((comparison) => (
//                 <PopularComparisonCard 
//                   key={comparison.id} 
//                   comparison={comparison} 
//                   onClick={() => handlePopularCompare(comparison)} 
//                   isDark={isDark} 
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//     </div>
//   )
// }

// export default CompareCars

// src/pages/CompareCars.jsx
/*
================================================================================
File Name : CompareCars.jsx
Author : Tahseen Raza
Created Date : 2026-01-16
Updated Date : 2026-06-27
Description : Professional car comparison with CarDekho-style UX
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'
import ComparisonResults from '../components/compare/ComparisonResults'

// ========================================
// CarDekho Style Car Selection Popup
// ========================================
const CarSelectionPopup = ({
  isOpen,
  onClose,
  onSelect,
  isDark,
  anchorRef,
  carsData,
  brandsData,
  position,
  otherCarId,
}) => {
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('')
  const [step, setStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, placement: 'bottom' })
  const popupRef = useRef(null)
  const searchInputRef = useRef(null)

  const brands = brandsData || []

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const popupHeight = 400
      const gap = 8

      let top, placement

      if (rect.bottom + popupHeight + gap < viewportHeight) {
        top = rect.bottom + gap
        placement = 'bottom'
      } else {
        top = rect.top - popupHeight - gap
        placement = 'top'
        if (top < 10) top = 10
      }

      const popupWidth = 340
      let left = rect.left + (rect.width / 2) - (popupWidth / 2)

      if (left < 10) left = 10
      if (left + popupWidth > window.innerWidth - 10) {
        left = window.innerWidth - popupWidth - 10
      }

      setPopupPosition({ top, left, placement })
    }
  }, [isOpen, anchorRef])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 150)
    }
  }, [isOpen, step])

  const getAvailableBrands = () => {
    if (!carsData) return []
    const allBrands = [...new Set(carsData.map(c => c.brand))]
    if (!otherCarId) return allBrands
    return allBrands.filter(brand => {
      const availableCars = carsData.filter(c => c.brand === brand && c.id !== otherCarId)
      return availableCars.length > 0
    })
  }

  const getAvailableModelsForBrand = (brand) => {
    if (!carsData) return []
    const allModels = [...new Set(carsData.filter(c => c.brand === brand).map(c => c.model))]
    if (!otherCarId) return allModels
    return allModels.filter(model => {
      const availableCars = carsData.filter(c => c.brand === brand && c.model === model && c.id !== otherCarId)
      return availableCars.length > 0
    })
  }

  const getAvailableVariantsForBrandModel = (brand, model) => {
    if (!carsData) return []
    const allVariants = carsData.filter(c => c.brand === brand && c.model === model).map(c => c.variant)
    if (!otherCarId) return allVariants
    const otherCar = carsData.find(c => c.id === otherCarId)
    if (otherCar && otherCar.brand === brand && otherCar.model === model) {
      return allVariants.filter(v => v !== otherCar.variant)
    }
    return allVariants
  }

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand)
    setSelectedModel('')
    setSelectedVariant('')
    setSearchQuery('')
    setStep(2)
  }

  const handleModelSelect = (model) => {
    setSelectedModel(model)
    setSelectedVariant('')
    setSearchQuery('')
    setStep(3)
  }

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant)
    const car = carsData?.find(c =>
      c.brand === selectedBrand &&
      c.model === selectedModel &&
      c.variant === variant
    )
    if (car) {
      onSelect(car)
      onClose()
      resetSelection()
    }
  }

  const resetSelection = () => {
    setSelectedBrand('')
    setSelectedModel('')
    setSelectedVariant('')
    setSearchQuery('')
    setStep(1)
  }

  const handleClose = () => {
    resetSelection()
    onClose()
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setSelectedModel('')
      setSearchQuery('')
    } else if (step === 3) {
      setStep(2)
      setSelectedVariant('')
      setSearchQuery('')
    }
  }

  const getModels = () => {
    if (!selectedBrand) return []
    return getAvailableModelsForBrand(selectedBrand)
  }

  const getVariants = () => {
    if (!selectedBrand || !selectedModel) return []
    return getAvailableVariantsForBrandModel(selectedBrand, selectedModel)
  }

  const filteredBrands = searchQuery.trim()
    ? getAvailableBrands().filter(b => b.toLowerCase().includes(searchQuery.toLowerCase()))
    : getAvailableBrands()

  const filteredModels = searchQuery.trim()
    ? getModels().filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
    : getModels()

  const filteredVariants = searchQuery.trim()
    ? getVariants().filter(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
    : getVariants()

  const renderBrandStep = () => {
    return (
      <div>
        <div className="mb-3">
          <div className="relative">
            <svg
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none ${isDark
                ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
            />
          </div>
        </div>

        <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
          {filteredBrands.map((brand) => {
            const hasModels = getAvailableModelsForBrand(brand).length > 0
            const brandAvailableCount = carsData.filter(c => c.brand === brand && c.id !== otherCarId).length
            return (
              <button
                key={brand}
                onClick={() => hasModels && handleBrandSelect(brand)}
                disabled={!hasModels}
                className={`w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-all hover:scale-[1.01] flex items-center justify-between ${hasModels
                  ? isDark
                    ? 'text-gray-200 hover:bg-dark-700 hover:text-white'
                    : 'text-gray-800 hover:bg-gray-100'
                  : 'opacity-40 cursor-not-allowed'
                  }`}
              >
                <span>{brand}</span>
                {hasModels && (
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {brandAvailableCount} variants
                  </span>
                )}
              </button>
            )
          })}
          {filteredBrands.length === 0 && (
            <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No brands available
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderModelStep = () => {
    return (
      <div>
        <div className="mb-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedBrand}
            </p>
            <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Select a model
            </p>
          </div>
        </div>

        <div className="mb-3">
          <div className="relative">
            <svg
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none ${isDark
                ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
            />
          </div>
        </div>

        <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
          {filteredModels.map((model) => (
            <button
              key={model}
              onClick={() => handleModelSelect(model)}
              className={`w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-all hover:scale-[1.01] ${isDark
                ? 'text-gray-200 hover:bg-dark-700 hover:text-white'
                : 'text-gray-800 hover:bg-gray-100'
                }`}
            >
              {model}
            </button>
          ))}
          {filteredModels.length === 0 && (
            <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No models available
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderVariantStep = () => {
    return (
      <div>
        <div className="mb-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedBrand} → {selectedModel}
            </p>
            <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Select a variant
            </p>
          </div>
        </div>

        <div className="mb-3">
          <div className="relative">
            <svg
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Variant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none ${isDark
                ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
            />
          </div>
        </div>

        <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
          {filteredVariants.map((variant) => {
            const car = carsData?.find(c =>
              c.brand === selectedBrand &&
              c.model === selectedModel &&
              c.variant === variant
            )
            return (
              <button
                key={variant}
                onClick={() => handleVariantSelect(variant)}
                className={`w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-all hover:scale-[1.01] flex items-center justify-between ${isDark
                  ? 'text-gray-200 hover:bg-dark-700 hover:text-white'
                  : 'text-gray-800 hover:bg-gray-100'
                  }`}
              >
                <span>{variant}</span>
                {car && (
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {car.price}
                  </span>
                )}
              </button>
            )
          })}
          {filteredVariants.length === 0 && (
            <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No variants available
            </p>
          )}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />

          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.95, y: popupPosition.placement === 'bottom' ? -5 : 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: popupPosition.placement === 'bottom' ? -5 : 5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-50 w-[340px] max-w-[calc(100vw-32px)]"
            style={{
              top: popupPosition.top,
              left: popupPosition.left,
              maxHeight: 'calc(100vh - 32px)',
            }}
          >
            <div
              className={`rounded-2xl shadow-2xl p-4 overflow-y-auto ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-100'}`}
              style={{ maxHeight: 'calc(100vh - 48px)' }}
            >
              <div
                className={`absolute w-3 h-3 rotate-45 left-1/2 -translate-x-1/2 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'}`}
                style={{
                  [popupPosition.placement === 'bottom' ? 'top' : 'bottom']: -6,
                  borderTop: '1px solid',
                  borderLeft: '1px solid',
                  borderColor: isDark ? '#374151' : '#e5e7eb',
                }}
              />

              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {step === 1 && 'Select Brand/Model'}
                    {step === 2 && 'Select Model'}
                    {step === 3 && 'Select Variant'}
                  </h3>
                  {step === 1 && (
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Choose a brand from the list below
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors`}
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all ${step >= s
                      ? 'bg-yellow-500 text-gray-900'
                      : isDark
                        ? 'bg-dark-700 text-gray-500'
                        : 'bg-gray-200 text-gray-400'
                      }`}>
                      {step > s ? '✓' : s}
                      <span className="hidden xs:inline">
                        {s === 1 && 'Brand'}
                        {s === 2 && 'Model'}
                        {s === 3 && 'Variant'}
                      </span>
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-0.5 mx-0.5 ${step > s ? 'bg-yellow-500' : isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="min-h-[150px]">
                {step === 1 && renderBrandStep()}
                {step === 2 && renderModelStep()}
                {step === 3 && renderVariantStep()}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-dark-700 flex items-center justify-between">
                <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {step === 1 && 'Choose a brand'}
                  {step === 2 && `Step 2 of 3`}
                  {step === 3 && `Step 3 of 3`}
                </span>
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className={`text-[10px] font-medium px-3 py-1 rounded-lg transition-colors ${isDark
                      ? 'text-gray-400 hover:text-white hover:bg-dark-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    ← Back
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ========================================
// Selected Car Display Card
// ========================================
const SelectedCarCard = ({ car, onRemove, onEdit, isDark }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-xl border h-full flex flex-col ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 hover:shadow-sm'
      }`}
    >
      <button
        onClick={onRemove}
        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-colors ${
          isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/80' : 'text-gray-500 hover:text-gray-800 hover:bg-black/5'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image Area */}
      <div className={`w-full h-44 p-4 flex items-center justify-center ${
        isDark ? 'bg-dark-700/40' : 'bg-[#f4f5f7]'
      }`}>
        <img
          src={car.image}
          alt={car.model}
          className="max-w-full max-h-full object-contain drop-shadow-sm mix-blend-multiply dark:mix-blend-normal"
        />
      </div>

      {/* Text Details Area */}
      <div className="p-4 text-left flex-1 flex flex-col">
        <h4 className={`font-semibold text-[15px] leading-snug ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {car.brand} {car.model}
        </h4>
        <p className={`text-xs mt-1 text-gray-500 dark:text-gray-400 flex items-center gap-1`}>
          <span className="truncate">{car.variant}</span> 
          <button onClick={onEdit} className="text-[10px] underline text-gray-400 hover:text-gray-600 cursor-pointer">✎</button>
        </p>

        <div className="mt-auto pt-3">
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {car.price}*
          </p>
          <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            *Ex-showroom Price
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ========================================
// Add Car Button 
// ========================================
const AddCarButton = ({ onClick, isDark }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full h-[320px] rounded-xl border flex flex-col items-center justify-center transition-all bg-white dark:bg-dark-800 ${
        isDark ? 'border-dark-700 hover:border-dark-500 text-gray-400' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-500'
      }`}
    >
      <div className="w-16 h-16 rounded-full border border-dashed border-gray-300 dark:border-dark-600 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="text-sm font-medium mb-6">Add car</span>
      
      {/* Mock Dropdowns */}
      <div className="w-3/4 max-w-[200px] space-y-2">
        <div className={`w-full py-2.5 px-3 text-left text-[13px] rounded border flex justify-between items-center ${
          isDark ? 'bg-dark-700/50 border-dark-600/50 text-gray-400' : 'bg-gray-50/50 border-gray-200/60 text-gray-400'
        }`}>
          Select Brand/Model
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
        <div className={`w-full py-2.5 px-3 text-left text-[13px] rounded border flex justify-between items-center ${
          isDark ? 'bg-dark-700/30 border-dark-600/30 text-gray-500' : 'bg-gray-50/30 border-gray-200/40 text-gray-300'
        }`}>
          Select Variant
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </motion.button>
  )
}

// ========================================
// Sticky Comparison Header
// ========================================
const StickyComparisonHeader = ({ car1, car2, onEdit, onClose, isDark }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const carCardsSection = document.getElementById('comparison-car-cards')
      if (carCardsSection) {
        const rect = carCardsSection.getBoundingClientRect()
        const shouldShow = rect.bottom <= 80
        setIsVisible(shouldShow)
        
        const event = new CustomEvent('stickyHeaderVisibility', { 
          detail: { visible: shouldShow } 
        })
        window.dispatchEvent(event)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div 
      id="sticky-comparison-header"
      className={`fixed top-0 left-0 right-0 z-[45] bg-white/95 backdrop-blur-md dark:bg-dark-900/95 border-b border-gray-200 dark:border-dark-700 shadow-md theme-transition transition-all duration-300`}
      style={{ top: 0 }}
    >
      <div className="container-custom">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 md:py-5 items-center">
            
            {/* Column 1 */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-dark-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-dark-600 shadow-sm">
                Comparison View
              </span>
            </div>

            {/* Column 2 */}
            <div className="flex items-center justify-center relative md:border-r md:border-gray-200 dark:md:border-dark-700">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 flex items-center justify-center bg-[#f4f5f7] dark:bg-dark-800 rounded p-1 border border-gray-100 dark:border-dark-600">
                  <img 
                    src={car1.image} 
                    alt={car1.model} 
                    className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
                  />
                </div>
                <div className="text-left flex flex-col justify-center">
                  <span className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                    {car1.brand} {car1.model}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">
                    {car1.price} 
                    <span className="mx-1.5 text-gray-300 dark:text-gray-600">|</span>
                    <button onClick={() => onEdit(1)} className="hover:text-orange-500 text-gray-400 underline transition-colors">
                      Edit
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 flex items-center justify-center bg-[#f4f5f7] dark:bg-dark-800 rounded p-1 border border-gray-100 dark:border-dark-600">
                  <img 
                    src={car2.image} 
                    alt={car2.model} 
                    className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
                  />
                </div>
                <div className="text-left flex flex-col justify-center">
                  <span className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                    {car2.brand} {car2.model}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">
                    {car2.price}
                    <span className="mx-1.5 text-gray-300 dark:text-gray-600">|</span>
                    <button onClick={() => onEdit(2)} className="hover:text-orange-500 text-gray-400 underline transition-colors">
                      Edit
                    </button>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ========================================
// Popular Comparison Card
// ========================================
const PopularComparisonCard = ({ comparison, onClick, isDark }) => {
  const { car1, car2, title, badge } = comparison

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 text-left border ${isDark
        ? 'bg-dark-800 border-dark-700 hover:border-gray-600'
        : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
    >
      {badge && (
        <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge === '🔥 Popular'
          ? 'bg-red-500 text-white'
          : 'bg-yellow-500 text-gray-900'
          }`}>
          {badge}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 text-center">
          <img src={car1.image} alt={car1.model} className="w-full h-20 object-contain mx-auto mb-1.5 rounded bg-[#f4f5f7] dark:bg-dark-700 p-2 mix-blend-multiply dark:mix-blend-normal" />
          <span className="text-xs font-semibold block text-gray-800 dark:text-white theme-transition">{car1.model}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 theme-transition truncate block max-w-full">{car1.variant}</span>
        </div>

        <div className="flex flex-col items-center px-2">
          <span className="text-[10px] font-bold text-gray-400">VS</span>
        </div>

        <div className="flex-1 text-center">
          <img src={car2.image} alt={car2.model} className="w-full h-20 object-contain mx-auto mb-1.5 rounded bg-[#f4f5f7] dark:bg-dark-700 p-2 mix-blend-multiply dark:mix-blend-normal" />
          <span className="text-xs font-semibold block text-gray-800 dark:text-white theme-transition">{car2.model}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 theme-transition truncate block max-w-full">{car2.variant}</span>
        </div>
      </div>

      <div className="text-center pt-2 border-t border-gray-100 dark:border-dark-700 mt-2">
        <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'} theme-transition`}>
          {title}
        </h4>
        <span className="text-[10px] font-medium text-orange-500 hover:text-orange-600 transition-colors mt-1 block">
          Compare Now
        </span>
      </div>
    </motion.button>
  )
}

// ========================================
// Main CompareCars Component
// ========================================
const CompareCars = () => {
  const { isDark } = useTheme()

  const [carsData, setCarsData] = useState([])
  const [brandsData, setBrandsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataError, setDataError] = useState(null)

  const [car1Id, setCar1Id] = useState(null)
  const [car2Id, setCar2Id] = useState(null)
  const [showPopup1, setShowPopup1] = useState(false)
  const [showPopup2, setShowPopup2] = useState(false)

  const [comparisonData, setComparisonData] = useState(null)
  const [isComparing, setIsComparing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const [editingCar, setEditingCar] = useState(null)
  const [showEditPopup, setShowEditPopup] = useState(false)
  const [editAnchorRef, setEditAnchorRef] = useState(null)

  const [popularCardsData, setPopularCardsData] = useState([])

  const addCarRef1 = useRef(null)
  const addCarRef2 = useRef(null)

  const carCardRef1 = useRef(null)
  const carCardRef2 = useRef(null)

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        setLoading(true)
        setDataError(null)

        const response = await api.getAllCars()

        if (response.success) {
          const flattened = []
          response.data.forEach(brand => {
            brand.models.forEach(model => {
              model.variants.forEach(variant => {
                flattened.push({
                  id: variant._id,
                  brand: brand.brand,
                  model: model.name,
                  variant: variant.name,
                  slug: model.slug,
                  image: model.image,
                  price: variant.price,
                  exShowroomPrice: variant.exShowroomPrice,
                  engine: variant.engine,
                  torque: variant.torque,
                  power: variant.power,
                  mileage: variant.mileage,
                  torqueNumeric: variant.torqueNumeric,
                  powerNumeric: variant.powerNumeric,
                  mileageNumeric: variant.mileageNumeric,
                  overallScore: variant.overallScore || 0,
                  scores: variant.scores || null,
                  factorScores: variant.factorScores || null,
                  specifications: variant.specifications || {},
                })
              })
            })
          })
          setCarsData(flattened)
          const uniqueBrands = [...new Set(flattened.map(c => c.brand))]
          setBrandsData(uniqueBrands)
        } else {
          setDataError(response.message || 'Failed to load car data')
        }
      } catch (error) {
        console.error('❌ Error fetching car data:', error)
        setDataError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchCarData()
  }, [])

  // ✅ Dynamically Calculate the Highest Rated Variants for Popular Comparisons
  useEffect(() => {
    if (carsData.length === 0) return

    const getHighestRatedCar = (searchTerms) => {
      const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms]
      let matches = []
      
      for (const term of terms) {
        matches = carsData.filter(c => c.model.toLowerCase().includes(term.toLowerCase()))
        if (matches.length > 0) break
      }
      
      if (matches.length === 0) return null
      
      return matches.reduce((prev, current) => {
        const prevScore = prev.overallScore || 0
        const currScore = current.overallScore || 0
        return (currScore > prevScore) ? current : prev
      })
    }

    const baseComparisons = [
      { id: 1, search1: ['Nexon'], search2: ['Creta'], title: 'Nexon vs Creta'},
      { id: 2, search1: ['Harrier'], search2: ['XUV700', 'XUV 7X0', 'XUV'], title: 'Harrier vs XUV700' },
      { id: 3, search1: ['Thar'], search2: ['Wrangler'], title: 'Thar vs Wrangler' },
      { id: 4, search1: ['Baleno'], search2: ['i20'], title: 'Baleno vs i20' },
      { id: 5, search1: ['Curvv EV', 'Curv EV', 'Curvv'], search2: ['XUV 3XO EV', 'XUV3XO EV'], title: 'Curvv EV vs XEV 9e' },
    ]

    const generated = baseComparisons.map(comp => {
      const c1 = getHighestRatedCar(comp.search1)
      const c2 = getHighestRatedCar(comp.search2)
      if (c1 && c2) {
        return {
          id: comp.id,
          title: comp.title,
          badge: comp.badge,
          car1: c1,
          car2: c2
        }
      }
      return null
    }).filter(Boolean)

    setPopularCardsData(generated)
  }, [carsData])

  const getCarById = (id) => carsData.find(c => c.id === id) || null
  const car1 = car1Id ? getCarById(car1Id) : null
  const car2 = car2Id ? getCarById(car2Id) : null

  const executeComparison = async (id1, id2) => {
    if (!id1 || !id2) return

    setIsLoading(true)
    setIsComparing(true)
    try {
      const response = await api.compareCars(id1, id2)
      if (response.success) {
        setComparisonData(response.data)
        setShowComparison(true)
        setTimeout(() => {
          document.getElementById('comparison-results')?.scrollIntoView({ behavior: 'smooth' })
        }, 200)
      } else {
        console.error('❌ Comparison failed:', response.message)
      }
    } catch (error) {
      console.error('❌ Comparison error:', error)
    } finally {
      setIsLoading(false)
      setIsComparing(false)
    }
  }

  const handleCompare = () => {
    executeComparison(car1Id, car2Id)
  }

  const handleCarSelect = (position, car) => {
    let newCar1Id = car1Id
    let newCar2Id = car2Id

    if (position === 1) {
      setCar1Id(car.id)
      newCar1Id = car.id
    } else if (position === 2) {
      setCar2Id(car.id)
      newCar2Id = car.id
    }
    
    setShowPopup1(false)
    setShowPopup2(false)
    setShowEditPopup(false)
    
    if (newCar1Id && newCar2Id && (showComparison || editingCar !== null)) {
      executeComparison(newCar1Id, newCar2Id)
    }
    
    setEditingCar(null)
    setEditAnchorRef(null)
  }

  const openPopup = (position) => {
    if (position === 1) {
      setShowPopup1(true)
    } else {
      setShowPopup2(true)
    }
  }

  const handleEditCar = (position) => {
    setEditingCar(position)
    if (position === 1) {
      setEditAnchorRef(carCardRef1)
    } else {
      setEditAnchorRef(carCardRef2)
    }
    setShowEditPopup(true)
  }

  const closeComparison = () => {
    setShowComparison(false)
  }

  const resetAll = () => {
    setCar1Id(null)
    setCar2Id(null)
    setComparisonData(null)
    setIsComparing(false)
    setShowComparison(false)
    setEditingCar(null)
    setShowEditPopup(false)
    setEditAnchorRef(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePopularCompare = (comparison) => {
    setCar1Id(comparison.car1.id)
    setCar2Id(comparison.car2.id)
    setTimeout(() => executeComparison(comparison.car1.id, comparison.car2.id), 300)
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading car data...</p>
        </div>
      </div>
    )
  }

  if (dataError) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className="text-red-500">{dataError}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-[#ff5a00] hover:bg-[#e05312] text-white font-semibold py-2 px-6 rounded transition-all">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-900' : 'bg-white'}`}>
      
      {/* RESTORED HERO SECTION */}
      <section className="relative pt-32 pb-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="./imageCompare.png"
            alt="Compare Cars"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block px-4 py-1.5 bg-[#fc641c] rounded-full text-white text-sm font-semibold mb-6 shadow-sm"
            >
              🚗 Car Comparison Tool
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Compare Cars{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Side by Side</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl text-gray-300 mb-8"
            >
              Select two cars to compare their features, scores, and specifications
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Car Selection - Hidden when comparison results are shown */}
      {!showComparison && (
        <section className={`py-12 transition-colors duration-300 relative ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch relative">
                
                {/* Left Card */}
                <div ref={carCardRef1} className="w-full h-full">
                  <AnimatePresence mode="wait">
                    {car1 ? (
                      <SelectedCarCard 
                        key="car1" 
                        car={car1} 
                        onRemove={() => setCar1Id(null)} 
                        onEdit={() => handleEditCar(1)} 
                        isDark={isDark} 
                      />
                    ) : (
                      <div ref={addCarRef1} className="w-full h-full">
                        <AddCarButton key="add1" onClick={() => openPopup(1)} isDark={isDark} />
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Optional Subtle VS separator in the middle */}
                <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-dark-800 border shadow-sm border-gray-200 dark:border-dark-600 text-[10px] font-bold text-gray-400">
                  VS
                </div>

                {/* Right Card */}
                <div ref={carCardRef2} className="w-full h-full">
                  <AnimatePresence mode="wait">
                    {car2 ? (
                      <SelectedCarCard 
                        key="car2" 
                        car={car2} 
                        onRemove={() => setCar2Id(null)} 
                        onEdit={() => handleEditCar(2)} 
                        isDark={isDark} 
                      />
                    ) : (
                      <div ref={addCarRef2} className="w-full h-full">
                        <AddCarButton key="add2" onClick={() => openPopup(2)} isDark={isDark} />
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="text-center mt-8">
                <motion.button
                  whileHover={car1 && car2 ? { scale: 1.01 } : {}}
                  whileTap={car1 && car2 ? { scale: 0.99 } : {}}
                  onClick={handleCompare}
                  disabled={!car1 || !car2}
                  className={`w-full md:w-1/3 min-w-[280px] px-8 py-3.5 rounded-lg font-bold text-base transition-all duration-300 ${
                    car1 && car2
                    ? 'bg-[#fc641c] hover:bg-[#e65a18] text-white shadow-md shadow-orange-500/20' 
                    : 'bg-gray-200 dark:bg-dark-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Compare Now
                </motion.button>
                {(car1 || car2) && (
                  <button onClick={resetAll} className={`block mx-auto mt-4 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>
                    Reset Selection
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popups */}
      <CarSelectionPopup isOpen={showPopup1} onClose={() => setShowPopup1(false)} onSelect={(car) => handleCarSelect(1, car)} position={1} otherCarId={car2Id} isDark={isDark} anchorRef={addCarRef1} carsData={carsData} brandsData={brandsData} />
      <CarSelectionPopup isOpen={showPopup2} onClose={() => setShowPopup2(false)} onSelect={(car) => handleCarSelect(2, car)} position={2} otherCarId={car1Id} isDark={isDark} anchorRef={addCarRef2} carsData={carsData} brandsData={brandsData} />
      <CarSelectionPopup isOpen={showEditPopup} onClose={() => { setShowEditPopup(false); setEditingCar(null); setEditAnchorRef(null); }} onSelect={(car) => handleCarSelect(editingCar, car)} position={editingCar} otherCarId={editingCar === 1 ? car2Id : car1Id} isDark={isDark} anchorRef={editAnchorRef} carsData={carsData} brandsData={brandsData} />

      {/* Loading Modal */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`rounded-2xl p-8 max-w-md w-full text-center shadow-2xl ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className={`absolute inset-0 border-4 rounded-full ${isDark ? 'border-dark-600' : 'border-gray-200'}`} />
                <div className="absolute inset-0 border-4 border-[#fc641c] rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-3xl">🚗</div>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Analyzing Cars</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Comparing features and specifications...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showComparison && car1 && car2 && (
        <StickyComparisonHeader car1={car1} car2={car2} onEdit={handleEditCar} onClose={closeComparison} isDark={isDark} />
      )}

      {showComparison && comparisonData && (
        <section id="comparison-results" className={`py-12 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <ComparisonResults comparisonData={comparisonData} car1={car1} car2={car2} onClear={closeComparison} onEdit={handleEditCar} carCardRef1={carCardRef1} carCardRef2={carCardRef2} />
            </div>
          </div>
        </section>
      )}

      {/* Popular Comparisons */}
      <section className={`py-12 md:py-16 transition-colors duration-300 ${showComparison ? (isDark ? 'bg-dark-900 border-t border-dark-700' : 'bg-white border-t border-gray-200') : (isDark ? 'bg-dark-900' : 'bg-gray-50')}`}>
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Popular Comparisons</h2>
            </div>
            
            {/* Display the dynamically generated popular comparisons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {popularCardsData.map((comparison) => (
                <PopularComparisonCard 
                  key={comparison.id} 
                  comparison={comparison} 
                  onClick={() => handlePopularCompare(comparison)} 
                  isDark={isDark} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default CompareCars