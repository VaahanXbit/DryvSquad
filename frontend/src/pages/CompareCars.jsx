// // src/pages/CompareCars.jsx
// /*
// ================================================================================
// File Name : CompareCars.jsx
// Author : Tahseen Raza
// Created Date : 2025-01-16
// Description : Professional car comparison with full theme support
// Company : Vaahan International
// Copyright : (c) 2026 Vaahan International. All rights reserved.
// ================================================================================
// */

// import { useState } from 'react'
// import { Link } from 'react-router-dom'
// import { motion, AnimatePresence } from 'framer-motion'
// import { useTheme } from '../context/ThemeContext'
// import { 
//   getAllBrands, 
//   getModelsByBrand, 
//   getVariantsByBrandAndModel,
//   getCarByBrandModelVariant,
//   popularComparisons,
//   getAllCars 
// } from '../data/cars/index'

// const CompareCars = () => {
//   const { isDark } = useTheme()
  
//   // Car selection state - Three layer
//   const [brand1, setBrand1] = useState('')
//   const [model1, setModel1] = useState('')
//   const [variant1, setVariant1] = useState('')
//   const [brand2, setBrand2] = useState('')
//   const [model2, setModel2] = useState('')
//   const [variant2, setVariant2] = useState('')
  
//   const [car1Id, setCar1Id] = useState(null)
//   const [car2Id, setCar2Id] = useState(null)
//   const [showComparison, setShowComparison] = useState(false)
//   const [showLoadingModal, setShowLoadingModal] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [highlightDifferences, setHighlightDifferences] = useState(true)
//   const [activeSection, setActiveSection] = useState('overview')
//   const [isComparing, setIsComparing] = useState(false)
//   const [expandedCategories, setExpandedCategories] = useState({})
  
//   const brands = getAllBrands()

//   const car1 = car1Id ? getCarByBrandModelVariant(brand1, model1, variant1) : null
//   const car2 = car2Id ? getCarByBrandModelVariant(brand2, model2, variant2) : null

//   // Toggle expand/collapse for a category
//   const toggleCategory = (categoryKey) => {
//     setExpandedCategories(prev => ({
//       ...prev,
//       [categoryKey]: !prev[categoryKey]
//     }))
//   }

//   // Get models for selected brand
//   const getModels = (brand) => {
//     return brand ? getModelsByBrand(brand) : []
//   }

//   // Get variants for selected brand and model
//   const getVariants = (brand, model) => {
//     if (!brand || !model) return []
//     const variants = getVariantsByBrandAndModel(brand, model)
//     return variants.map(v => v.name)
//   }

//   // Handle brand selection
//   const handleBrandSelect = (position, brand) => {
//     if (position === 1) {
//       setBrand1(brand)
//       setModel1('')
//       setVariant1('')
//       setCar1Id(null)
//       setShowComparison(false)
//       setIsComparing(false)
//       setExpandedCategories({})
//     } else {
//       setBrand2(brand)
//       setModel2('')
//       setVariant2('')
//       setCar2Id(null)
//       setShowComparison(false)
//       setIsComparing(false)
//       setExpandedCategories({})
//     }
//   }

//   // Handle model selection
//   const handleModelSelect = (position, model) => {
//     if (position === 1) {
//       setModel1(model)
//       setVariant1('')
//       setCar1Id(null)
//       setShowComparison(false)
//       setIsComparing(false)
//       setExpandedCategories({})
//     } else {
//       setModel2(model)
//       setVariant2('')
//       setCar2Id(null)
//       setShowComparison(false)
//       setIsComparing(false)
//       setExpandedCategories({})
//     }
//   }

//   // Handle variant selection
//   const handleVariantSelect = (position, variant) => {
//     if (position === 1) {
//       setVariant1(variant)
//       const car = getCarByBrandModelVariant(brand1, model1, variant)
//       if (car) {
//         setCar1Id(car.id)
//         setShowComparison(false)
//         setIsComparing(false)
//         setExpandedCategories({})
//       }
//     } else {
//       setVariant2(variant)
//       const car = getCarByBrandModelVariant(brand2, model2, variant)
//       if (car) {
//         setCar2Id(car.id)
//         setShowComparison(false)
//         setIsComparing(false)
//         setExpandedCategories({})
//       }
//     }
//   }

//   // Handle compare
//   const handleCompare = () => {
//     if (car1Id && car2Id) {
//       setIsComparing(true)
//       setShowLoadingModal(true)
//       setIsLoading(true)
//       setExpandedCategories({})
      
//       setTimeout(() => {
//         setShowComparison(true)
//         setIsLoading(false)
//         setShowLoadingModal(false)
//         setTimeout(() => {
//           const element = document.getElementById('comparison-results')
//           if (element) {
//             element.scrollIntoView({ behavior: 'smooth' })
//           }
//         }, 100)
//       }, 1500)
//     }
//   }

//   // Handle popular comparison click
//   const handlePopularCompare = (id1, id2) => {
//     const allCars = getAllCars()
//     const car1Data = allCars.find(c => c.id === id1)
//     const car2Data = allCars.find(c => c.id === id2)
    
//     if (car1Data && car2Data) {
//       setBrand1(car1Data.brand)
//       setModel1(car1Data.model)
//       setVariant1(car1Data.variant)
//       setBrand2(car2Data.brand)
//       setModel2(car2Data.model)
//       setVariant2(car2Data.variant)
//       setCar1Id(id1)
//       setCar2Id(id2)
//       setIsComparing(true)
//       setShowLoadingModal(true)
//       setIsLoading(true)
//       setExpandedCategories({})
      
//       setTimeout(() => {
//         setShowComparison(true)
//         setIsLoading(false)
//         setShowLoadingModal(false)
//         setTimeout(() => {
//           const element = document.getElementById('comparison-results')
//           if (element) {
//             element.scrollIntoView({ behavior: 'smooth' })
//           }
//         }, 100)
//       }, 1500)
//     }
//   }

//   // Clear all
//   const clearAll = () => {
//     setBrand1('')
//     setModel1('')
//     setVariant1('')
//     setBrand2('')
//     setModel2('')
//     setVariant2('')
//     setCar1Id(null)
//     setCar2Id(null)
//     setShowComparison(false)
//     setIsComparing(false)
//     setShowLoadingModal(false)
//     setIsLoading(false)
//     setActiveSection('overview')
//     setExpandedCategories({})
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//   }

//   // Sections
//   const sections = [
//     { id: 'overview', label: 'Overview', icon: '📊' },
//     { id: 'detailed', label: 'Detailed Ratings', icon: '⭐' }
//   ]

//   // Get score data for table
//   const getScoreData = () => {
//     if (!car1 || !car2) return []
    
//     const scoreCategories = [
//       { key: 'safetyScore', label: 'Safety', icon: '🛡️' },
//       { key: 'performanceScore', label: 'Performance', icon: '⚡' },
//       { key: 'drivingExperienceScore', label: 'Driving Experience', icon: '🚗' },
//       { key: 'suspensionScore', label: 'Suspension', icon: '🔧' },
//       { key: 'comfortScore', label: 'Comfort', icon: '🛋️' },
//       { key: 'featuresScore', label: 'Features', icon: '🎯' },
//       { key: 'valueForMoneyScore', label: 'Value for Money', icon: '💰' },
//       { key: 'cityDrivingScore', label: 'City Driving', icon: '🏙️' },
//       { key: 'highwayDrivingScore', label: 'Highway Driving', icon: '🛣️' },
//       { key: 'familyScore', label: 'Family', icon: '👨‍👩‍👧‍👦' },
//       { key: 'maintenanceScore', label: 'Maintenance', icon: '🔧' }
//     ]

//     return scoreCategories.map(cat => ({
//       ...cat,
//       score1: car1.scores?.[cat.key] || null,
//       score2: car2.scores?.[cat.key] || null
//     }))
//   }

//   const scoreData = getScoreData()

//   // Get detailed score data with factors
//   const getDetailedScoreData = () => {
//     if (!car1 || !car2) return []
    
//     const detailedCategories = [
//       {
//         key: 'safetyScore',
//         label: 'Safety',
//         icon: '🛡️',
//         factors: [
//           { name: 'Airbags', key: 'airbags' },
//           { name: 'ADAS Features', key: 'adas' },
//           { name: 'NCAP Rating', key: 'ncapRating' },
//           { name: 'Braking Performance', key: 'braking' },
//           { name: 'Structural Safety', key: 'structuralSafety' }
//         ]
//       },
//       {
//         key: 'performanceScore',
//         label: 'Performance',
//         icon: '⚡',
//         factors: [
//           { name: 'Engine Power', key: 'enginePower' },
//           { name: 'Torque Output', key: 'torque' },
//           { name: 'Acceleration', key: 'acceleration' },
//           { name: 'Highway Performance', key: 'highwayPerformance' },
//           { name: 'Gearbox Response', key: 'gearboxResponse' }
//         ]
//       },
//       {
//         key: 'drivingExperienceScore',
//         label: 'Driving Experience',
//         icon: '🚗',
//         factors: [
//           { name: 'Steering Feedback', key: 'steeringFeedback' },
//           { name: 'Handling', key: 'handling' },
//           { name: 'Stability', key: 'stability' },
//           { name: 'Ride Quality', key: 'rideQuality' },
//           { name: 'Driver Confidence', key: 'driverConfidence' }
//         ]
//       },
//       {
//         key: 'suspensionScore',
//         label: 'Suspension',
//         icon: '🔧',
//         factors: [
//           { name: 'Ride Comfort', key: 'rideComfort' },
//           { name: 'Pothole Absorption', key: 'potholeAbsorption' },
//           { name: 'Highway Stability', key: 'highwayStability' },
//           { name: 'Cornering Support', key: 'corneringSupport' }
//         ]
//       },
//       {
//         key: 'comfortScore',
//         label: 'Comfort',
//         icon: '🛋️',
//         factors: [
//           { name: 'Seat Quality', key: 'seatQuality' },
//           { name: 'Cabin Insulation', key: 'cabinInsulation' },
//           { name: 'AC Effectiveness', key: 'acEffectiveness' },
//           { name: 'Rear Seat Comfort', key: 'rearSeatComfort' },
//           { name: 'Ride Smoothness', key: 'rideSmoothness' }
//         ]
//       },
//       {
//         key: 'featuresScore',
//         label: 'Features',
//         icon: '🎯',
//         factors: [
//           { name: 'Infotainment System', key: 'infotainment' },
//           { name: 'Connected Car', key: 'connectedCar' },
//           { name: 'Panoramic Sunroof', key: 'sunroof' },
//           { name: 'Ventilated Seats', key: 'ventilatedSeats' },
//           { name: 'Ambient Lighting', key: 'ambientLighting' }
//         ]
//       },
//       {
//         key: 'valueForMoneyScore',
//         label: 'Value for Money',
//         icon: '💰',
//         factors: [
//           { name: 'Price vs Features', key: 'priceVsFeatures' },
//           { name: 'Safety Package', key: 'safetyPackage' },
//           { name: 'Performance Value', key: 'performanceValue' },
//           { name: 'Resale Value', key: 'resaleValue' },
//           { name: 'Overall Package', key: 'overallPackage' }
//         ]
//       },
//       {
//         key: 'cityDrivingScore',
//         label: 'City Driving',
//         icon: '🏙️',
//         factors: [
//           { name: 'Steering Responsiveness', key: 'steeringResponsiveness' },
//           { name: 'Turning Radius', key: 'turningRadius' },
//           { name: 'Visibility', key: 'visibility' },
//           { name: 'Ease of Parking', key: 'easeOfParking' },
//           { name: 'Traffic Maneuverability', key: 'trafficManeuverability' }
//         ]
//       },
//       {
//         key: 'highwayDrivingScore',
//         label: 'Highway Driving',
//         icon: '🛣️',
//         factors: [
//           { name: 'High Speed Stability', key: 'highSpeedStability' },
//           { name: 'Cruise Control', key: 'cruiseControl' },
//           { name: 'Overtaking Ability', key: 'overtakingAbility' },
//           { name: 'Fuel Efficiency', key: 'fuelEfficiency' },
//           { name: 'Cabin Noise', key: 'cabinNoise' }
//         ]
//       },
//       {
//         key: 'familyScore',
//         label: 'Family',
//         icon: '👨‍👩‍👧‍👦',
//         factors: [
//           { name: 'Rear Seat Space', key: 'rearSeatSpace' },
//           { name: 'Boot Capacity', key: 'bootCapacity' },
//           { name: 'Child Safety', key: 'childSafety' },
//           { name: 'Ease of Entry', key: 'easeOfEntry' },
//           { name: 'Family Features', key: 'familyFeatures' }
//         ]
//       },
//       {
//         key: 'maintenanceScore',
//         label: 'Maintenance',
//         icon: '🔧',
//         factors: [
//           { name: 'Service Cost', key: 'serviceCost' },
//           { name: 'Spare Parts', key: 'spareParts' },
//           { name: 'Service Network', key: 'serviceNetwork' },
//           { name: 'Reliability', key: 'reliability' },
//           { name: 'Warranty', key: 'warranty' }
//         ]
//       }
//     ]

//     return detailedCategories.map(cat => ({
//       ...cat,
//       score1: car1.scores?.[cat.key] || null,
//       score2: car2.scores?.[cat.key] || null,
//       factorScores1: car1.factorScores?.[cat.key] || {},
//       factorScores2: car2.factorScores?.[cat.key] || {},
//       winner: car1.scores?.[cat.key] > car2.scores?.[cat.key] ? 'car1' :
//                car2.scores?.[cat.key] > car1.scores?.[cat.key] ? 'car2' : 'tie'
//     }))
//   }

//   const detailedScoreData = getDetailedScoreData()

//   // Get color for score
//   const getScoreColor = (score) => {
//     if (score === null || score === undefined) return 'text-gray-400'
//     if (score >= 9) return 'text-green-600'
//     if (score >= 8) return 'text-green-500'
//     if (score >= 7) return 'text-yellow-600'
//     if (score >= 6) return 'text-orange-500'
//     return 'text-red-500'
//   }

//   const getScoreBg = (score) => {
//     if (score === null || score === undefined) return 'bg-gray-200'
//     if (score >= 9) return 'bg-green-500'
//     if (score >= 8) return 'bg-green-400'
//     if (score >= 7) return 'bg-yellow-500'
//     if (score >= 6) return 'bg-orange-500'
//     return 'bg-red-500'
//   }

//   // Loading Modal
//   if (showLoadingModal) {
//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
//       >
//         <motion.div
//           initial={{ scale: 0.9, y: 20 }}
//           animate={{ scale: 1, y: 0 }}
//           exit={{ scale: 0.9, y: 20 }}
//           className={`rounded-2xl p-8 max-w-md w-full text-center shadow-2xl ${isDark ? 'bg-dark-800' : 'bg-white'}`}
//         >
//           <div className="relative w-24 h-24 mx-auto mb-6">
//             <div className={`absolute inset-0 border-4 rounded-full ${isDark ? 'border-dark-600' : 'border-gray-200'}`}></div>
//             <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
//             <div className="absolute inset-0 flex items-center justify-center text-3xl">🚗</div>
//           </div>
//           <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Comparing Cars</h3>
//           <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Analyzing features, specifications, and scores...</p>
//           <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mt-4">
//             <span className="animate-pulse">●</span>
//             <span className="animate-pulse delay-150">●</span>
//             <span className="animate-pulse delay-300">●</span>
//           </div>
//         </motion.div>
//       </motion.div>
//     )
//   }

//   // Render expandable detailed rating card
//   const renderDetailedRatingCard = (car, carNumber, scores, factorScores) => {
//     const isCar1 = carNumber === 1
//     const carLabel = `${car.brand} ${car.model}`
//     const carVariant = car.variant

//     return (
//       <div className={`rounded-xl p-6 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
//         <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
//           <img src={car.image} alt={car.model} className="w-12 h-12 object-cover rounded-lg" />
//           <div>
//             <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{carLabel}</h3>
//             <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{carVariant}</p>
//           </div>
//           {car.overallScore && (
//             <div className={`ml-auto text-center px-3 py-1 rounded-lg ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
//               <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Overall</span>
//               <div className="text-lg font-bold text-yellow-500">{car.overallScore.toFixed(1)}</div>
//             </div>
//           )}
//         </div>
        
//         <div className="space-y-3">
//           {detailedScoreData.map((item) => {
//             const score = isCar1 ? item.score1 : item.score2
//             const factors = isCar1 ? item.factorScores1 : item.factorScores2
//             const isExpanded = expandedCategories[`${carNumber}-${item.key}`]
//             const isWinner = isCar1 ? item.winner === 'car1' : item.winner === 'car2'
            
//             return (
//               <div 
//                 key={item.key} 
//                 className={`rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
//                   isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'
//                 }`}
//               >
//                 {/* Category Header - Clickable */}
//                 <button
//                   onClick={() => toggleCategory(`${carNumber}-${item.key}`)}
//                   className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
//                     isDark ? 'hover:bg-dark-800' : 'hover:bg-gray-50'
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <span className="text-xl">{item.icon}</span>
//                     <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.label}</span>
//                     {isWinner && (
//                       <span className="text-yellow-500 text-sm font-bold">🏆 Winner</span>
//                     )}
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span className={`text-xl font-bold ${getScoreColor(score)}`}>
//                       {score !== null ? score.toFixed(1) : 'N/A'}
//                     </span>
//                     <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>/ 10</span>
//                     <svg 
//                       className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
//                       fill="none" stroke="currentColor" viewBox="0 0 24 24"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </div>
//                 </button>
                
//                 {/* Expanded Content */}
//                 <AnimatePresence>
//                   {isExpanded && (
//                     <motion.div
//                       initial={{ height: 0, opacity: 0 }}
//                       animate={{ height: 'auto', opacity: 1 }}
//                       exit={{ height: 0, opacity: 0 }}
//                       transition={{ duration: 0.3 }}
//                       className="overflow-hidden"
//                     >
//                       <div className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
//                         <div className="mb-3">
//                           <div className="flex items-center justify-between mb-1">
//                             <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall {item.label} Score</span>
//                             <span className={`text-lg font-bold ${getScoreColor(score)}`}>
//                               {score !== null ? score.toFixed(1) : 'N/A'} / 10
//                             </span>
//                           </div>
//                           <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
//                             <div 
//                               className={`h-full ${getScoreBg(score)} rounded-full transition-all duration-1000`}
//                               style={{ width: score !== null ? `${(score / 10) * 100}%` : '0%' }}
//                             ></div>
//                           </div>
//                         </div>
                        
//                         <div className="space-y-2">
//                           <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Contributing Factors:</p>
//                           {item.factors.map((factor, idx) => {
//                             const factorScore = factors[factor.key] || null
//                             return (
//                               <div key={idx} className="flex items-center justify-between pl-2">
//                                 <div className="flex items-center gap-2">
//                                   <span className="text-green-500 text-sm">✓</span>
//                                   <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{factor.name}</span>
//                                 </div>
//                                 <div className="flex items-center gap-3">
//                                   <div className={`w-32 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
//                                     <div 
//                                       className={`h-full ${getScoreBg(factorScore)} rounded-full transition-all duration-1000`}
//                                       style={{ width: factorScore !== null ? `${(factorScore / 10) * 100}%` : '0%' }}
//                                     ></div>
//                                   </div>
//                                   <span className={`text-sm font-semibold ${getScoreColor(factorScore)}`}>
//                                     {factorScore !== null ? factorScore.toFixed(1) : 'N/A'}
//                                   </span>
//                                 </div>
//                               </div>
//                             )
//                           })}
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <>
//       {/* Hero Section with Image */}
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
//               className="inline-block px-4 py-1.5 bg-yellow-500 rounded-full text-gray-900 text-sm font-semibold mb-6"
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
//               Select Brand → Model → Variant to compare real-world scores and specifications
//             </motion.p>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6, duration: 0.5 }}
//               className="flex flex-wrap gap-8 pt-6 border-t border-white/20"
//             >
//               <div>
//                 <div className="text-3xl font-bold text-yellow-400">5</div>
//                 <div className="text-gray-300 text-sm">Brands</div>
//               </div>
//               <div>
//                 <div className="text-3xl font-bold text-yellow-400">10+</div>
//                 <div className="text-gray-300 text-sm">Models</div>
//               </div>
//               <div>
//                 <div className="text-3xl font-bold text-yellow-400">14</div>
//                 <div className="text-gray-300 text-sm">Variants</div>
//               </div>
//               <div>
//                 <div className="text-3xl font-bold text-yellow-400">11</div>
//                 <div className="text-gray-300 text-sm">Rating Categories</div>
//               </div>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Car Selector Section - Hidden after comparison */}
//       {!isComparing && (
//         <section className={`py-12 border-b transition-colors duration-300 relative -mt-6 ${
//           isDark ? 'bg-dark-900 border-dark-700' : 'bg-gray-50 border-gray-200'
//         }`}>
//           <div className="container-custom">
//             <div className="max-w-5xl mx-auto">
//               <div className="text-center mb-8">
//                 <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Select Cars to Compare</h2>
//                 <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Choose Brand → Model → Variant for each car</p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
//                 {/* Car 1 Selector */}
//                 <div className={`p-4 rounded-xl shadow-sm border transition-colors duration-300 ${
//                   isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
//                 }`}>
//                   <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Add Car 1</label>
                  
//                   <select
//                     value={brand1}
//                     onChange={(e) => handleBrandSelect(1, e.target.value)}
//                     className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-2 transition-colors duration-300 ${
//                       isDark 
//                         ? 'bg-dark-700 border-dark-600 text-white' 
//                         : 'bg-white border-gray-300 text-gray-700'
//                     } border`}
//                   >
//                     <option value="">Select Brand</option>
//                     {brands.map(brand => (
//                       <option key={brand} value={brand}>{brand}</option>
//                     ))}
//                   </select>
                  
//                   <select
//                     value={model1}
//                     onChange={(e) => handleModelSelect(1, e.target.value)}
//                     disabled={!brand1}
//                     className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-2 transition-colors duration-300 ${
//                       isDark 
//                         ? 'bg-dark-700 border-dark-600 text-white disabled:bg-dark-800 disabled:text-gray-500' 
//                         : 'bg-white border-gray-300 text-gray-700 disabled:bg-gray-100'
//                     } border`}
//                   >
//                     <option value="">Select Model</option>
//                     {getModels(brand1).map(model => (
//                       <option key={model} value={model}>{model}</option>
//                     ))}
//                   </select>
                  
//                   <select
//                     value={variant1}
//                     onChange={(e) => handleVariantSelect(1, e.target.value)}
//                     disabled={!model1}
//                     className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-300 ${
//                       isDark 
//                         ? 'bg-dark-700 border-dark-600 text-white disabled:bg-dark-800 disabled:text-gray-500' 
//                         : 'bg-white border-gray-300 text-gray-700 disabled:bg-gray-100'
//                     } border`}
//                   >
//                     <option value="">Select Variant</option>
//                     {getVariants(brand1, model1).map(variant => (
//                       <option key={variant} value={variant}>{variant}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* VS Divider */}
//                 <div className="text-center pt-6 md:pt-0">
//                   <div className="w-16 h-16 mx-auto bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
//                     VS
//                   </div>
//                 </div>

//                 {/* Car 2 Selector */}
//                 <div className={`p-4 rounded-xl shadow-sm border transition-colors duration-300 ${
//                   isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
//                 }`}>
//                   <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Add Car 2</label>
                  
//                   <select
//                     value={brand2}
//                     onChange={(e) => handleBrandSelect(2, e.target.value)}
//                     className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-2 transition-colors duration-300 ${
//                       isDark 
//                         ? 'bg-dark-700 border-dark-600 text-white' 
//                         : 'bg-white border-gray-300 text-gray-700'
//                     } border`}
//                   >
//                     <option value="">Select Brand</option>
//                     {brands.map(brand => (
//                       <option key={brand} value={brand}>{brand}</option>
//                     ))}
//                   </select>
                  
//                   <select
//                     value={model2}
//                     onChange={(e) => handleModelSelect(2, e.target.value)}
//                     disabled={!brand2}
//                     className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-2 transition-colors duration-300 ${
//                       isDark 
//                         ? 'bg-dark-700 border-dark-600 text-white disabled:bg-dark-800 disabled:text-gray-500' 
//                         : 'bg-white border-gray-300 text-gray-700 disabled:bg-gray-100'
//                     } border`}
//                   >
//                     <option value="">Select Model</option>
//                     {getModels(brand2).map(model => (
//                       <option key={model} value={model}>{model}</option>
//                     ))}
//                   </select>
                  
//                   <select
//                     value={variant2}
//                     onChange={(e) => handleVariantSelect(2, e.target.value)}
//                     disabled={!model2}
//                     className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-300 ${
//                       isDark 
//                         ? 'bg-dark-700 border-dark-600 text-white disabled:bg-dark-800 disabled:text-gray-500' 
//                         : 'bg-white border-gray-300 text-gray-700 disabled:bg-gray-100'
//                     } border`}
//                   >
//                     <option value="">Select Variant</option>
//                     {getVariants(brand2, model2).map(variant => (
//                       <option key={variant} value={variant}>{variant}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Compare Button */}
//               <div className="text-center mt-8">
//                 <button
//                   onClick={handleCompare}
//                   disabled={!car1Id || !car2Id}
//                   className={`px-12 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 ${
//                     car1Id && car2Id
//                       ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900 shadow-lg hover:scale-105 hover:shadow-xl'
//                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                   }`}
//                 >
//                   {car1Id && car2Id ? '🚀 Compare Now' : 'Select both cars to compare'}
//                 </button>
//                 {(car1Id || car2Id) && (
//                   <button
//                     onClick={clearAll}
//                     className={`ml-4 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
//                   >
//                     Clear Selection
//                   </button>
//                 )}
//               </div>

//               <div className="text-center mt-6">
//                 <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
//                   Compare real-world scores, features, specifications, and more
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Comparison Results */}
//       {isComparing && showComparison && car1 && car2 && (
//         <section id="comparison-results" className={`py-16 transition-colors duration-300 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
//           <div className="container-custom">
//             <div className="max-w-6xl mx-auto">
//               {/* Header */}
//               <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
//                 <div className="flex items-center gap-4 flex-wrap">
//                   <button
//                     onClick={clearAll}
//                     className={`transition-colors flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                     </svg>
//                     New Comparison
//                   </button>
//                   <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                     {car1.brand} {car1.model} vs {car2.brand} {car2.model}
//                   </h2>
//                 </div>
//                 <div className="flex items-center gap-4 flex-wrap">
//                   <label className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//                     <input
//                       type="checkbox"
//                       checked={highlightDifferences}
//                       onChange={() => setHighlightDifferences(!highlightDifferences)}
//                       className="w-4 h-4 text-yellow-500 rounded"
//                     />
//                     Highlight Differences
//                   </label>
//                   <button
//                     onClick={clearAll}
//                     className={`transition-colors ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
//                   >
//                     ✕ Close
//                   </button>
//                 </div>
//               </div>

//               {/* Car Headers */}
//               <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl shadow-lg p-8 mb-8 transition-colors duration-300 ${
//                 isDark ? 'bg-dark-800' : 'bg-white'
//               }`}>
//                 <div className="text-center">
//                   <div className={`rounded-xl p-6 transition-colors duration-300 ${isDark ? 'bg-dark-700' : 'bg-gray-50'}`}>
//                     <img src={car1.image} alt={car1.model} className="w-80 h-80 object-cover rounded-lg mx-auto mb-4 shadow-md" />
//                     <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>{car1.brand}</h3>
//                     <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{car1.model}</p>
//                     <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{car1.variant}</p>
//                     <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{car1.price}</p>
//                     {car1.overallScore && (
//                       <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
//                         <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall</span>
//                         <span className="text-xl font-bold text-yellow-500">{car1.overallScore.toFixed(1)}</span>
//                         <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/ 10</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div className="text-center">
//                   <div className={`rounded-xl p-6 transition-colors duration-300 ${isDark ? 'bg-dark-700' : 'bg-gray-50'}`}>
//                     <img src={car2.image} alt={car2.model} className="w-80 h-80 object-cover rounded-lg mx-auto mb-4 shadow-md" />
//                     <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>{car2.brand}</h3>
//                     <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{car2.model}</p>
//                     <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{car2.variant}</p>
//                     <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{car2.price}</p>
//                     {car2.overallScore && (
//                       <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
//                         <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall</span>
//                         <span className="text-xl font-bold text-yellow-500">{car2.overallScore.toFixed(1)}</span>
//                         <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/ 10</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Section Tabs */}
//               <div className={`flex flex-wrap gap-2 mb-8 rounded-xl shadow-lg p-2 transition-colors duration-300 ${
//                 isDark ? 'bg-dark-800' : 'bg-white'
//               }`}>
//                 {sections.map((section) => (
//                   <button
//                     key={section.id}
//                     onClick={() => setActiveSection(section.id)}
//                     className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
//                       activeSection === section.id
//                         ? 'bg-yellow-500 text-gray-900 shadow-md'
//                         : isDark ? 'bg-transparent text-gray-400 hover:bg-dark-700' : 'bg-transparent text-gray-600 hover:bg-gray-100'
//                     }`}
//                   >
//                     <span>{section.icon}</span>
//                     {section.label}
//                   </button>
//                 ))}
//               </div>

//               {/* Section Content */}
//               <div className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${
//                 isDark ? 'bg-dark-800' : 'bg-white'
//               }`}>
//                 <AnimatePresence mode="wait">
//                   {sections.map((section) => {
//                     if (activeSection !== section.id) return null
                    
//                     return (
//                       <motion.div
//                         key={section.id}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         {/* Overview Section - Table Format */}
//                         {section.id === 'overview' && (
//                           <div className="p-6">
//                             <div className="overflow-x-auto">
//                               <table className="w-full">
//                                 <thead>
//                                   <tr className={`rounded-lg ${isDark ? 'bg-dark-700' : 'bg-gradient-to-r from-gray-50 to-gray-100'}`}>
//                                     <th className={`px-6 py-4 text-left font-semibold text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Category</th>
//                                     <th className={`px-6 py-4 text-center font-semibold text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//                                       {car1.brand} {car1.model}
//                                     </th>
//                                     <th className={`px-6 py-4 text-center font-semibold text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//                                       {car2.brand} {car2.model}
//                                     </th>
//                                     <th className={`px-6 py-4 text-center font-semibold text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Winner</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {scoreData.map((item, idx) => {
//                                     const isDifferent = item.score1 !== item.score2
//                                     const winner = item.score1 > item.score2 ? car1.model : 
//                                                   item.score2 > item.score1 ? car2.model : 'Tie'
//                                     const winnerColor = item.score1 > item.score2 ? 'text-green-600' :
//                                                        item.score2 > item.score1 ? 'text-green-600' : 'text-gray-400'
                                    
//                                     return (
//                                       <tr key={item.key} className={`${idx % 2 === 0 ? (isDark ? 'bg-dark-900' : 'bg-white') : (isDark ? 'bg-dark-800' : 'bg-gray-50')} hover:bg-yellow-50 transition-colors`}>
//                                         <td className={`px-6 py-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
//                                           <span className="mr-2">{item.icon}</span>
//                                           {item.label}
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                           {item.score1 !== null ? (
//                                             <div className="flex items-center justify-center gap-2">
//                                               <span className={`text-lg font-bold ${getScoreColor(item.score1)}`}>
//                                                 {item.score1.toFixed(1)}
//                                               </span>
//                                               <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
//                                                 <div 
//                                                   className={`h-full ${getScoreBg(item.score1)} rounded-full`}
//                                                   style={{ width: `${(item.score1 / 10) * 100}%` }}
//                                                 ></div>
//                                               </div>
//                                             </div>
//                                           ) : (
//                                             <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>N/A</span>
//                                           )}
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                           {item.score2 !== null ? (
//                                             <div className="flex items-center justify-center gap-2">
//                                               <span className={`text-lg font-bold ${getScoreColor(item.score2)}`}>
//                                                 {item.score2.toFixed(1)}
//                                               </span>
//                                               <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
//                                                 <div 
//                                                   className={`h-full ${getScoreBg(item.score2)} rounded-full`}
//                                                   style={{ width: `${(item.score2 / 10) * 100}%` }}
//                                                 ></div>
//                                               </div>
//                                             </div>
//                                           ) : (
//                                             <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>N/A</span>
//                                           )}
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                           {highlightDifferences && isDifferent ? (
//                                             <span className={`font-bold ${winnerColor}`}>
//                                               {winner !== 'Tie' ? `🏆 ${winner}` : 'Tie'}
//                                             </span>
//                                           ) : (
//                                             <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>—</span>
//                                           )}
//                                         </td>
//                                       </tr>
//                                     )
//                                   })}
//                                 </tbody>
//                               </table>
//                             </div>

//                             {/* Score Guide */}
//                             <div className={`mt-6 p-4 rounded-lg border transition-colors duration-300 ${
//                               isDark ? 'bg-dark-700 border-dark-600' : 'bg-gray-50 border-gray-200'
//                             }`}>
//                               <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Rating Guide</h4>
//                               <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                                   <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>9-10: Excellent</span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-3 h-3 bg-green-400 rounded-full"></div>
//                                   <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>8-9: Very Good</span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
//                                   <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>7-8: Good</span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
//                                   <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>6-7: Average</span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//                                   <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Below 6: Needs Improvement</span>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         )}

//                         {/* Detailed Section - Expandable Cards */}
//                         {section.id === 'detailed' && (
//                           <div className="p-6">
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                               {renderDetailedRatingCard(car1, 1, car1.scores, car1.factorScores)}
//                               {renderDetailedRatingCard(car2, 2, car2.scores, car2.factorScores)}
//                             </div>
//                           </div>
//                         )}
//                       </motion.div>
//                     )
//                   })}
//                 </AnimatePresence>
//               </div>

//               {/* Quick Summary Cards */}
//               <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className={`p-4 rounded-xl border transition-colors duration-300 ${
//                   isDark ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200'
//                 }`}>
//                   <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>🏆 Overall Winner</h4>
//                   <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
//                     {car1.overallScore > car2.overallScore 
//                       ? `${car1.brand} ${car1.model}`
//                       : car2.overallScore > car1.overallScore
//                       ? `${car2.brand} ${car2.model}`
//                       : 'Tie'}
//                   </p>
//                   <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
//                     {car1.overallScore > car2.overallScore 
//                       ? `Score: ${car1.overallScore.toFixed(1)}/10`
//                       : car2.overallScore > car1.overallScore
//                       ? `Score: ${car2.overallScore.toFixed(1)}/10`
//                       : `Both: ${car1.overallScore.toFixed(1)}/10`}
//                   </p>
//                 </div>
//                 <div className={`p-4 rounded-xl border transition-colors duration-300 ${
//                   isDark ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200'
//                 }`}>
//                   <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>🛡️ Safety Winner</h4>
//                   <p className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
//                     {car1.scores?.safetyScore > car2.scores?.safetyScore 
//                       ? `${car1.brand} ${car1.model}`
//                       : car2.scores?.safetyScore > car1.scores?.safetyScore
//                       ? `${car2.brand} ${car2.model}`
//                       : 'Similar Safety'}
//                   </p>
//                   <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
//                     {car1.scores?.safetyScore > car2.scores?.safetyScore 
//                       ? `Score: ${car1.scores.safetyScore.toFixed(1)}/10`
//                       : car2.scores?.safetyScore > car1.scores?.safetyScore
//                       ? `Score: ${car2.scores.safetyScore.toFixed(1)}/10`
//                       : `Both: ${car1.scores?.safetyScore?.toFixed(1) || 'N/A'}/10`}
//                   </p>
//                 </div>
//                 <div className={`p-4 rounded-xl border transition-colors duration-300 ${
//                   isDark ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-200'
//                 }`}>
//                   <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>💰 Value for Money</h4>
//                   <p className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
//                     {car1.scores?.valueForMoneyScore > car2.scores?.valueForMoneyScore 
//                       ? `${car1.brand} ${car1.model}`
//                       : car2.scores?.valueForMoneyScore > car1.scores?.valueForMoneyScore
//                       ? `${car2.brand} ${car2.model}`
//                       : 'Similar Value'}
//                   </p>
//                   <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
//                     {car1.scores?.valueForMoneyScore > car2.scores?.valueForMoneyScore 
//                       ? `Score: ${car1.scores.valueForMoneyScore.toFixed(1)}/10`
//                       : car2.scores?.valueForMoneyScore > car1.scores?.valueForMoneyScore
//                       ? `Score: ${car2.scores.valueForMoneyScore.toFixed(1)}/10`
//                       : `Both: ${car1.scores?.valueForMoneyScore?.toFixed(1) || 'N/A'}/10`}
//                   </p>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="mt-8 flex flex-wrap gap-4 justify-center">
//                 <button
//                   onClick={() => {
//                     setShowComparison(false)
//                     setShowLoadingModal(true)
//                     setTimeout(() => {
//                       setShowComparison(true)
//                       setShowLoadingModal(false)
//                     }, 1500)
//                   }}
//                   className="px-6 py-2.5 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
//                 >
//                   🔄 Refresh Comparison
//                 </button>
//                 <button
//                   onClick={clearAll}
//                   className={`px-6 py-2.5 border rounded-lg font-semibold transition-colors ${
//                     isDark 
//                       ? 'border-dark-600 text-gray-400 hover:bg-dark-700' 
//                       : 'border-gray-300 text-gray-600 hover:bg-gray-50'
//                   }`}
//                 >
//                   New Comparison
//                 </button>
//                 <Link
//                   to="/articles"
//                   className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
//                 >
//                   Read Reviews
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Popular Comparisons */}
//       <section className={`py-16 transition-colors duration-300 ${
//         isComparing && showComparison 
//           ? isDark ? 'bg-dark-900 border-t border-dark-700' : 'bg-white border-t border-gray-200'
//           : isDark ? 'bg-dark-800' : 'bg-gray-50'
//       }`}>
//         <div className="container-custom">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             viewport={{ once: true }}
//             className="text-center mb-10"
//           >
//             <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">Popular Comparisons</span>
//             <h2 className={`text-2xl md:text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Most Compared Cars</h2>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             {popularComparisons.map((comparison) => {
//               const allCars = getAllCars()
//               const car1Data = allCars.find(c => c.id === comparison.car1Id)
//               const car2Data = allCars.find(c => c.id === comparison.car2Id)
//               if (!car1Data || !car2Data) return null
//               return (
//                 <motion.button
//                   key={comparison.id}
//                   initial={{ opacity: 0, scale: 0.95 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.3 }}
//                   whileHover={{ y: -4 }}
//                   viewport={{ once: true }}
//                   onClick={() => handlePopularCompare(car1Data.id, car2Data.id)}
//                   className={`rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 text-left border hover:border-yellow-300 ${
//                     isDark 
//                       ? 'bg-dark-800 border-dark-700 hover:bg-dark-700' 
//                       : 'bg-white border-gray-100'
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2">
//                         <img src={car1Data.image} alt={car1Data.model} className="w-12 h-12 object-cover rounded" />
//                         <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{car1Data.model}</span>
//                       </div>
//                     </div>
//                     <div className="text-yellow-500 font-bold mx-2 text-sm">VS</div>
//                     <div className="flex-1 text-right">
//                       <div className="flex items-center gap-2 justify-end">
//                         <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{car2Data.model}</span>
//                         <img src={car2Data.image} alt={car2Data.model} className="w-12 h-12 object-cover rounded" />
//                       </div>
//                     </div>
//                   </div>
//                   <div className={`text-center mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
//                     {car1Data.brand} vs {car2Data.brand}
//                   </div>
//                 </motion.button>
//               )
//             })}
//           </div>
//         </div>
//       </section>
//     </>
//   )
// }

// export default CompareCars


// src/pages/CompareCars.jsx
/*
================================================================================
File Name : CompareCars.jsx
Author : Tahseen Raza
Created Date : 2025-01-16
Description : Professional car comparison with CarDekho-style selection
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { 
  getAllBrands, 
  getModelsByBrand, 
  getVariantsByBrandAndModel,
  getCarByBrandModelVariant,
  popularComparisons,
  getAllCars 
} from '../data/cars/index'

// ========================================
// CarDekho Style Car Selection Popup - Clean list format
// ========================================
const CarSelectionPopup = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  isDark, 
  position,
  anchorRef 
}) => {
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('')
  const [step, setStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, placement: 'bottom' })
  const popupRef = useRef(null)
  const searchInputRef = useRef(null)

  const brands = getAllBrands()

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
    const car = getCarByBrandModelVariant(selectedBrand, selectedModel, variant)
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
    return selectedBrand ? getModelsByBrand(selectedBrand) : []
  }

  const getVariants = () => {
    if (!selectedBrand || !selectedModel) return []
    const variants = getVariantsByBrandAndModel(selectedBrand, selectedModel)
    return variants.map(v => v.name)
  }

  // Filter brands by search query
  const filteredBrands = searchQuery.trim() 
    ? brands.filter(b => b.toLowerCase().includes(searchQuery.toLowerCase()))
    : brands

  // Filter models by search query
  const filteredModels = searchQuery.trim() 
    ? getModels().filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
    : getModels()

  // Filter variants by search query
  const filteredVariants = searchQuery.trim() 
    ? getVariants().filter(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
    : getVariants()

  // Render Step 1: Brand Selection - Clean list format
  const renderBrandStep = () => {
    return (
      <div>
        {/* Search Bar */}
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
              className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Brand List - Clean vertical list like in the image */}
        <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
          {filteredBrands.map((brand) => {
            const hasModels = getModelsByBrand(brand).length > 0
            return (
              <button
                key={brand}
                onClick={() => hasModels && handleBrandSelect(brand)}
                disabled={!hasModels}
                className={`w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-all hover:scale-[1.01] flex items-center justify-between ${
                  hasModels
                    ? isDark 
                      ? 'text-gray-200 hover:bg-dark-700 hover:text-white' 
                      : 'text-gray-800 hover:bg-gray-100'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <span>{brand}</span>
                {hasModels && (
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {getModelsByBrand(brand).length} models
                  </span>
                )}
              </button>
            )
          })}
          {filteredBrands.length === 0 && (
            <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No brands found
            </p>
          )}
        </div>
      </div>
    )
  }

  // Render Step 2: Model Selection - Clean list format
  const renderModelStep = () => {
    return (
      <div>
        {/* Header with back */}
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

        {/* Search Bar */}
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
              className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Models List - Clean vertical list */}
        <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
          {filteredModels.map((model) => (
            <button
              key={model}
              onClick={() => handleModelSelect(model)}
              className={`w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-all hover:scale-[1.01] ${
                isDark 
                  ? 'text-gray-200 hover:bg-dark-700 hover:text-white' 
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              {model}
            </button>
          ))}
          {filteredModels.length === 0 && (
            <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No models found
            </p>
          )}
        </div>
      </div>
    )
  }

  // Render Step 3: Variant Selection - Clean list format
  const renderVariantStep = () => {
    return (
      <div>
        {/* Header with back */}
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

        {/* Search Bar */}
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
              className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Variants List - Clean vertical list */}
        <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
          {filteredVariants.map((variant) => {
            const car = getCarByBrandModelVariant(selectedBrand, selectedModel, variant)
            return (
              <button
                key={variant}
                onClick={() => handleVariantSelect(variant)}
                className={`w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-all hover:scale-[1.01] flex items-center justify-between ${
                  isDark 
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
              No variants found
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />
          
          {/* Popup */}
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
              {/* Arrow indicator */}
              <div 
                className={`absolute w-3 h-3 rotate-45 left-1/2 -translate-x-1/2 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'}`}
                style={{
                  [popupPosition.placement === 'bottom' ? 'top' : 'bottom']: -6,
                  borderTop: '1px solid',
                  borderLeft: '1px solid',
                  borderColor: isDark ? '#374151' : '#e5e7eb',
                }}
              />

              {/* Header */}
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

              {/* Progress Steps */}
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
                      step >= s 
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

              {/* Content */}
              <div className="min-h-[150px]">
                {step === 1 && renderBrandStep()}
                {step === 2 && renderModelStep()}
                {step === 3 && renderVariantStep()}
              </div>

              {/* Footer */}
              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-dark-700 flex items-center justify-between">
                <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {step === 1 && 'Choose a brand'}
                  {step === 2 && `Step 2 of 3`}
                  {step === 3 && `Step 3 of 3`}
                </span>
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className={`text-[10px] font-medium px-3 py-1 rounded-lg transition-colors ${
                      isDark 
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
const SelectedCarCard = ({ car, onRemove, isDark }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`relative p-4 rounded-xl text-center border-2 border-yellow-500 shadow-lg shadow-yellow-500/10 ${
        isDark ? 'bg-dark-800' : 'bg-white'
      }`}
    >
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
      >
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img 
        src={car.image} 
        alt={car.model} 
        className="w-20 h-20 object-cover rounded-lg mx-auto mb-2 shadow-md" 
      />
      <div className="flex items-center justify-center gap-1.5 mb-0.5">
        <span className="text-xs font-medium px-2 py-0.5 bg-yellow-500 text-gray-900 rounded-full">
          {car.brand}
        </span>
      </div>
      <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {car.model}
      </h4>
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {car.variant}
      </p>
      <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
        {car.price}
      </p>
      {car.overallScore && (
        <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
          isDark ? 'bg-yellow-500/20' : 'bg-yellow-500/10'
        }`}>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>★</span>
          <span className="text-sm font-bold text-yellow-500">{car.overallScore.toFixed(1)}</span>
        </div>
      )}
    </motion.div>
  )
}

// ========================================
// Add Car Button
// ========================================
const AddCarButton = ({ onClick, isDark }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-dark-700/50 group ${
        isDark ? 'border-dark-600 text-gray-400' : 'border-gray-300 text-gray-500'
      }`}
    >
      <div className="w-14 h-14 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 flex items-center justify-center transition-all mb-2">
        <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="text-sm font-medium">Add Car</span>
    </motion.button>
  )
}

// ========================================
// Main CompareCars Component
// ========================================
const CompareCars = () => {
  const { isDark } = useTheme()
  
  const [car1Id, setCar1Id] = useState(null)
  const [car2Id, setCar2Id] = useState(null)
  const [showPopup1, setShowPopup1] = useState(false)
  const [showPopup2, setShowPopup2] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [highlightDifferences, setHighlightDifferences] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  const [isComparing, setIsComparing] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({})
  
  const addCarRef1 = useRef(null)
  const addCarRef2 = useRef(null)

  const car1 = car1Id ? getAllCars().find(c => c.id === car1Id) : null
  const car2 = car2Id ? getAllCars().find(c => c.id === car2Id) : null

  const handleCarSelect = (position, car) => {
    if (position === 1) {
      setCar1Id(car.id)
    } else {
      setCar2Id(car.id)
    }
    setShowPopup1(false)
    setShowPopup2(false)
  }

  const openPopup = (position) => {
    if (position === 1) {
      setShowPopup1(true)
    } else {
      setShowPopup2(true)
    }
  }

  const handleCompare = () => {
    if (car1 && car2) {
      setIsComparing(true)
      setShowLoadingModal(true)
      setExpandedCategories({})
      
      setTimeout(() => {
        setShowComparison(true)
        setShowLoadingModal(false)
        setTimeout(() => {
          document.getElementById('comparison-results')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }, 1500)
    }
  }

  const clearAll = () => {
    setCar1Id(null)
    setCar2Id(null)
    setShowComparison(false)
    setIsComparing(false)
    setShowLoadingModal(false)
    setActiveSection('overview')
    setExpandedCategories({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePopularCompare = (id1, id2) => {
    const allCars = getAllCars()
    const car1Data = allCars.find(c => c.id === id1)
    const car2Data = allCars.find(c => c.id === id2)
    
    if (car1Data && car2Data) {
      setCar1Id(id1)
      setCar2Id(id2)
      setIsComparing(true)
      setShowLoadingModal(true)
      setExpandedCategories({})
      
      setTimeout(() => {
        setShowComparison(true)
        setShowLoadingModal(false)
        setTimeout(() => {
          document.getElementById('comparison-results')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }, 1500)
    }
  }

  // Sections
  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'detailed', label: 'Detailed Ratings', icon: '⭐' }
  ]

  // Get score data for table
  const getScoreData = () => {
    if (!car1 || !car2) return []
    
    const scoreCategories = [
      { key: 'safetyScore', label: 'Safety', icon: '🛡️' },
      { key: 'performanceScore', label: 'Performance', icon: '⚡' },
      { key: 'drivingExperienceScore', label: 'Driving Experience', icon: '🚗' },
      { key: 'suspensionScore', label: 'Suspension', icon: '🔧' },
      { key: 'comfortScore', label: 'Comfort', icon: '🛋️' },
      { key: 'featuresScore', label: 'Features', icon: '🎯' },
      { key: 'valueForMoneyScore', label: 'Value for Money', icon: '💰' },
      { key: 'cityDrivingScore', label: 'City Driving', icon: '🏙️' },
      { key: 'highwayDrivingScore', label: 'Highway Driving', icon: '🛣️' },
      { key: 'familyScore', label: 'Family', icon: '👨‍👩‍👧‍👦' },
      { key: 'maintenanceScore', label: 'Maintenance', icon: '🔧' }
    ]

    return scoreCategories.map(cat => ({
      ...cat,
      score1: car1.scores?.[cat.key] || null,
      score2: car2.scores?.[cat.key] || null
    }))
  }

  const scoreData = getScoreData()

  // Get detailed score data with factors
  const getDetailedScoreData = () => {
    if (!car1 || !car2) return []
    
    const detailedCategories = [
      {
        key: 'safetyScore',
        label: 'Safety',
        icon: '🛡️',
        factors: [
          { name: 'Airbags', key: 'airbags' },
          { name: 'ADAS Features', key: 'adas' },
          { name: 'NCAP Rating', key: 'ncapRating' },
          { name: 'Braking Performance', key: 'braking' },
          { name: 'Structural Safety', key: 'structuralSafety' }
        ]
      },
      {
        key: 'performanceScore',
        label: 'Performance',
        icon: '⚡',
        factors: [
          { name: 'Engine Power', key: 'enginePower' },
          { name: 'Torque Output', key: 'torque' },
          { name: 'Acceleration', key: 'acceleration' },
          { name: 'Highway Performance', key: 'highwayPerformance' },
          { name: 'Gearbox Response', key: 'gearboxResponse' }
        ]
      },
      {
        key: 'drivingExperienceScore',
        label: 'Driving Experience',
        icon: '🚗',
        factors: [
          { name: 'Steering Feedback', key: 'steeringFeedback' },
          { name: 'Handling', key: 'handling' },
          { name: 'Stability', key: 'stability' },
          { name: 'Ride Quality', key: 'rideQuality' },
          { name: 'Driver Confidence', key: 'driverConfidence' }
        ]
      },
      {
        key: 'suspensionScore',
        label: 'Suspension',
        icon: '🔧',
        factors: [
          { name: 'Ride Comfort', key: 'rideComfort' },
          { name: 'Pothole Absorption', key: 'potholeAbsorption' },
          { name: 'Highway Stability', key: 'highwayStability' },
          { name: 'Cornering Support', key: 'corneringSupport' }
        ]
      },
      {
        key: 'comfortScore',
        label: 'Comfort',
        icon: '🛋️',
        factors: [
          { name: 'Seat Quality', key: 'seatQuality' },
          { name: 'Cabin Insulation', key: 'cabinInsulation' },
          { name: 'AC Effectiveness', key: 'acEffectiveness' },
          { name: 'Rear Seat Comfort', key: 'rearSeatComfort' },
          { name: 'Ride Smoothness', key: 'rideSmoothness' }
        ]
      },
      {
        key: 'featuresScore',
        label: 'Features',
        icon: '🎯',
        factors: [
          { name: 'Infotainment System', key: 'infotainment' },
          { name: 'Connected Car', key: 'connectedCar' },
          { name: 'Panoramic Sunroof', key: 'sunroof' },
          { name: 'Ventilated Seats', key: 'ventilatedSeats' },
          { name: 'Ambient Lighting', key: 'ambientLighting' }
        ]
      },
      {
        key: 'valueForMoneyScore',
        label: 'Value for Money',
        icon: '💰',
        factors: [
          { name: 'Price vs Features', key: 'priceVsFeatures' },
          { name: 'Safety Package', key: 'safetyPackage' },
          { name: 'Performance Value', key: 'performanceValue' },
          { name: 'Resale Value', key: 'resaleValue' },
          { name: 'Overall Package', key: 'overallPackage' }
        ]
      },
      {
        key: 'cityDrivingScore',
        label: 'City Driving',
        icon: '🏙️',
        factors: [
          { name: 'Steering Responsiveness', key: 'steeringResponsiveness' },
          { name: 'Turning Radius', key: 'turningRadius' },
          { name: 'Visibility', key: 'visibility' },
          { name: 'Ease of Parking', key: 'easeOfParking' },
          { name: 'Traffic Maneuverability', key: 'trafficManeuverability' }
        ]
      },
      {
        key: 'highwayDrivingScore',
        label: 'Highway Driving',
        icon: '🛣️',
        factors: [
          { name: 'High Speed Stability', key: 'highSpeedStability' },
          { name: 'Cruise Control', key: 'cruiseControl' },
          { name: 'Overtaking Ability', key: 'overtakingAbility' },
          { name: 'Fuel Efficiency', key: 'fuelEfficiency' },
          { name: 'Cabin Noise', key: 'cabinNoise' }
        ]
      },
      {
        key: 'familyScore',
        label: 'Family',
        icon: '👨‍👩‍👧‍👦',
        factors: [
          { name: 'Rear Seat Space', key: 'rearSeatSpace' },
          { name: 'Boot Capacity', key: 'bootCapacity' },
          { name: 'Child Safety', key: 'childSafety' },
          { name: 'Ease of Entry', key: 'easeOfEntry' },
          { name: 'Family Features', key: 'familyFeatures' }
        ]
      },
      {
        key: 'maintenanceScore',
        label: 'Maintenance',
        icon: '🔧',
        factors: [
          { name: 'Service Cost', key: 'serviceCost' },
          { name: 'Spare Parts', key: 'spareParts' },
          { name: 'Service Network', key: 'serviceNetwork' },
          { name: 'Reliability', key: 'reliability' },
          { name: 'Warranty', key: 'warranty' }
        ]
      }
    ]

    return detailedCategories.map(cat => ({
      ...cat,
      score1: car1.scores?.[cat.key] || null,
      score2: car2.scores?.[cat.key] || null,
      factorScores1: car1.factorScores?.[cat.key] || {},
      factorScores2: car2.factorScores?.[cat.key] || {},
      winner: car1.scores?.[cat.key] > car2.scores?.[cat.key] ? 'car1' :
               car2.scores?.[cat.key] > car1.scores?.[cat.key] ? 'car2' : 'tie'
    }))
  }

  const detailedScoreData = getDetailedScoreData()

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-gray-400'
    if (score >= 9) return 'text-green-600'
    if (score >= 8) return 'text-green-500'
    if (score >= 7) return 'text-yellow-600'
    if (score >= 6) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreBg = (score) => {
    if (score === null || score === undefined) return 'bg-gray-300 dark:bg-gray-600'
    if (score >= 9) return 'bg-green-500'
    if (score >= 8) return 'bg-green-400'
    if (score >= 7) return 'bg-yellow-500'
    if (score >= 6) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Loading Modal
  if (showLoadingModal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`rounded-2xl p-8 max-w-md w-full text-center shadow-2xl ${isDark ? 'bg-dark-800' : 'bg-white'}`}
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className={`absolute inset-0 border-4 rounded-full ${isDark ? 'border-dark-600' : 'border-gray-200'}`}></div>
            <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-3xl">🚗</div>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Comparing Cars</h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Analyzing features, specifications, and scores...</p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mt-4">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse delay-150">●</span>
            <span className="animate-pulse delay-300">●</span>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <>
      {/* Hero Section */}
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
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="inline-block px-4 py-1.5 bg-yellow-500 rounded-full text-gray-900 text-sm font-semibold mb-6">
              🚗 Car Comparison Tool
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Compare Cars{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Side by Side</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="text-xl text-gray-300 mb-8">
              Select two cars to compare their features, scores, and specifications
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Car Selection */}
      {!isComparing && (
        <section className={`py-12 border-b transition-colors duration-300 relative -mt-6 ${
          isDark ? 'bg-dark-900 border-dark-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Compare Cars
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Add two cars to compare their features and scores
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Car 1 */}
                <div className="w-full">
                  <AnimatePresence mode="wait">
                    {car1 ? (
                      <SelectedCarCard
                        key="car1"
                        car={car1}
                        onRemove={() => setCar1Id(null)}
                        isDark={isDark}
                      />
                    ) : (
                      <div ref={addCarRef1} className="w-full">
                        <AddCarButton
                          key="add1"
                          onClick={() => openPopup(1)}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* VS */}
                <div className="flex justify-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-yellow-500/25"
                  >
                    VS
                  </motion.div>
                </div>

                {/* Car 2 */}
                <div className="w-full">
                  <AnimatePresence mode="wait">
                    {car2 ? (
                      <SelectedCarCard
                        key="car2"
                        car={car2}
                        onRemove={() => setCar2Id(null)}
                        isDark={isDark}
                      />
                    ) : (
                      <div ref={addCarRef2} className="w-full">
                        <AddCarButton
                          key="add2"
                          onClick={() => openPopup(2)}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Compare Button */}
              <div className="text-center mt-8">
                <motion.button
                  whileHover={car1 && car2 ? { scale: 1.05 } : {}}
                  whileTap={car1 && car2 ? { scale: 0.95 } : {}}
                  onClick={handleCompare}
                  disabled={!car1 || !car2}
                  className={`px-12 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    car1 && car2
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {car1 && car2 ? 'Compare Now 🚀' : 'Add two cars to compare'}
                </motion.button>
                {(car1 || car2) && (
                  <button
                    onClick={clearAll}
                    className={`ml-4 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popups - Anchored to buttons */}
      <CarSelectionPopup
        isOpen={showPopup1}
        onClose={() => setShowPopup1(false)}
        onSelect={(car) => handleCarSelect(1, car)}
        position={1}
        isDark={isDark}
        anchorRef={addCarRef1}
      />
      <CarSelectionPopup
        isOpen={showPopup2}
        onClose={() => setShowPopup2(false)}
        onSelect={(car) => handleCarSelect(2, car)}
        position={2}
        isDark={isDark}
        anchorRef={addCarRef2}
      />

      {/* Comparison Results */}
      {isComparing && showComparison && car1 && car2 && (
        <section id="comparison-results" className={`py-16 transition-colors duration-300 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={clearAll}
                    className={`transition-colors flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    New Comparison
                  </button>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {car1.brand} {car1.model} vs {car2.brand} {car2.model}
                  </h2>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <input
                      type="checkbox"
                      checked={highlightDifferences}
                      onChange={() => setHighlightDifferences(!highlightDifferences)}
                      className="w-4 h-4 text-yellow-500 rounded"
                    />
                    Highlight Differences
                  </label>
                  <button
                    onClick={clearAll}
                    className={`transition-colors ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Car Headers */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl shadow-lg p-6 md:p-8 mb-8 transition-colors duration-300 ${
                isDark ? 'bg-dark-800' : 'bg-white'
              }`}>
                <div className={`rounded-xl p-4 md:p-6 transition-colors duration-300 ${isDark ? 'bg-dark-700' : 'bg-gray-50'}`}>
                  <div className="flex flex-col items-center text-center">
                    <img src={car1.image} alt={car1.model} className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-cover rounded-lg mx-auto mb-4 shadow-md" />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 bg-yellow-500 text-gray-900 rounded-full">{car1.brand}</span>
                    </div>
                    <h3 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{car1.model}</h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{car1.variant}</p>
                    <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{car1.price}</p>
                    {car1.overallScore && (
                      <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall</span>
                        <span className="text-lg font-bold text-yellow-500">{car1.overallScore.toFixed(1)}</span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/ 10</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`rounded-xl p-4 md:p-6 transition-colors duration-300 ${isDark ? 'bg-dark-700' : 'bg-gray-50'}`}>
                  <div className="flex flex-col items-center text-center">
                    <img src={car2.image} alt={car2.model} className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-cover rounded-lg mx-auto mb-4 shadow-md" />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 bg-yellow-500 text-gray-900 rounded-full">{car2.brand}</span>
                    </div>
                    <h3 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{car2.model}</h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{car2.variant}</p>
                    <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{car2.price}</p>
                    {car2.overallScore && (
                      <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall</span>
                        <span className="text-lg font-bold text-yellow-500">{car2.overallScore.toFixed(1)}</span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/ 10</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Tabs */}
              <div className={`flex flex-wrap gap-2 mb-8 rounded-xl shadow-lg p-2 transition-colors duration-300 ${
                isDark ? 'bg-dark-800' : 'bg-white'
              }`}>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm md:text-base ${
                      activeSection === section.id
                        ? 'bg-yellow-500 text-gray-900 shadow-md'
                        : isDark ? 'bg-transparent text-gray-400 hover:bg-dark-700' : 'bg-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </div>

              {/* Section Content */}
              <div className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${
                isDark ? 'bg-dark-800' : 'bg-white'
              }`}>
                <AnimatePresence mode="wait">
                  {sections.map((section) => {
                    if (activeSection !== section.id) return null
                    
                    return (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {section.id === 'overview' && (
                          <div className="p-4 md:p-6">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className={`rounded-lg ${isDark ? 'bg-dark-700' : 'bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                                    <th className={`px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Category</th>
                                    <th className={`px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {car1.brand} {car1.model}
                                    </th>
                                    <th className={`px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {car2.brand} {car2.model}
                                    </th>
                                    <th className={`px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Winner</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {scoreData.map((item, idx) => {
                                    const isDifferent = item.score1 !== item.score2
                                    const winner = item.score1 > item.score2 ? car1.model : 
                                                  item.score2 > item.score1 ? car2.model : 'Tie'
                                    const winnerColor = item.score1 > item.score2 ? 'text-green-600 dark:text-green-400' :
                                                       item.score2 > item.score1 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                                    
                                    return (
                                      <tr key={item.key} className={`${idx % 2 === 0 ? (isDark ? 'bg-dark-900' : 'bg-white') : (isDark ? 'bg-dark-800' : 'bg-gray-50')} transition-colors duration-200 hover:bg-yellow-50 dark:hover:bg-dark-700`}>
                                        <td className={`px-4 md:px-6 py-3 md:py-4 font-medium text-xs md:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                          <span className="mr-2">{item.icon}</span>
                                          {item.label}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                          {item.score1 !== null ? (
                                            <div className="flex items-center justify-center gap-2">
                                              <span className={`text-base md:text-lg font-bold ${getScoreColor(item.score1)}`}>
                                                {item.score1.toFixed(1)}
                                              </span>
                                              <div className={`w-12 md:w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                                                <div 
                                                  className={`h-full ${getScoreBg(item.score1)} rounded-full`}
                                                  style={{ width: `${(item.score1 / 10) * 100}%` }}
                                                ></div>
                                              </div>
                                            </div>
                                          ) : (
                                            <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>N/A</span>
                                          )}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                          {item.score2 !== null ? (
                                            <div className="flex items-center justify-center gap-2">
                                              <span className={`text-base md:text-lg font-bold ${getScoreColor(item.score2)}`}>
                                                {item.score2.toFixed(1)}
                                              </span>
                                              <div className={`w-12 md:w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                                                <div 
                                                  className={`h-full ${getScoreBg(item.score2)} rounded-full`}
                                                  style={{ width: `${(item.score2 / 10) * 100}%` }}
                                                ></div>
                                              </div>
                                            </div>
                                          ) : (
                                            <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>N/A</span>
                                          )}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                          {highlightDifferences && isDifferent ? (
                                            <span className={`font-bold ${winnerColor}`}>
                                              {winner !== 'Tie' ? `🏆 ${winner}` : 'Tie'}
                                            </span>
                                          ) : (
                                            <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>—</span>
                                          )}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <div className={`mt-6 p-4 rounded-lg border transition-colors duration-300 ${
                              isDark ? 'bg-dark-700 border-dark-600' : 'bg-gray-50 border-gray-200'
                            }`}>
                              <h4 className={`font-semibold mb-2 text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>Rating Guide</h4>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>9-10: Excellent</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>8-9: Very Good</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>7-8: Good</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>6-7: Average</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Below 6: Needs Improvement</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {section.id === 'detailed' && (
                          <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Car 1 Detailed Ratings */}
                              <div className={`rounded-xl p-6 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
                                <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                                  <img src={car1.image} alt={car1.model} className="w-12 h-12 object-cover rounded-lg" />
                                  <div>
                                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{car1.brand} {car1.model}</h3>
                                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{car1.variant}</p>
                                  </div>
                                  {car1.overallScore && (
                                    <div className={`ml-auto text-center px-3 py-1 rounded-lg ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
                                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Overall</span>
                                      <div className="text-lg font-bold text-yellow-500">{car1.overallScore.toFixed(1)}</div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-3">
                                  {detailedScoreData.map((item) => {
                                    const score = item.score1
                                    const factors = item.factorScores1
                                    const isExpanded = expandedCategories[`1-${item.key}`]
                                    const isWinner = item.winner === 'car1'
                                    
                                    return (
                                      <div 
                                        key={item.key} 
                                        className={`rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                                          isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'
                                        }`}
                                      >
                                        <button
                                          onClick={() => setExpandedCategories(prev => ({
                                            ...prev,
                                            [`1-${item.key}`]: !prev[`1-${item.key}`]
                                          }))}
                                          className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                                            isDark ? 'hover:bg-dark-800' : 'hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className="flex items-center gap-3">
                                            <span className="text-xl">{item.icon}</span>
                                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.label}</span>
                                            {isWinner && (
                                              <span className="text-yellow-500 text-sm font-bold">🏆 Winner</span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                                              {score !== null ? score.toFixed(1) : 'N/A'}
                                            </span>
                                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>/ 10</span>
                                            <svg 
                                              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            >
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </div>
                                        </button>
                                        
                                        <AnimatePresence>
                                          {isExpanded && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.3 }}
                                              className="overflow-hidden"
                                            >
                                              <div className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                                                <div className="mb-3">
                                                  <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall {item.label} Score</span>
                                                    <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                                                      {score !== null ? score.toFixed(1) : 'N/A'} / 10
                                                    </span>
                                                  </div>
                                                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                                                    <div 
                                                      className={`h-full ${getScoreBg(score)} rounded-full transition-all duration-1000`}
                                                      style={{ width: score !== null ? `${(score / 10) * 100}%` : '0%' }}
                                                    ></div>
                                                  </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                  <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Contributing Factors:</p>
                                                  {item.factors.map((factor, idx) => {
                                                    const factorScore = factors[factor.key] || null
                                                    return (
                                                      <div key={idx} className="flex items-center justify-between pl-2">
                                                        <div className="flex items-center gap-2">
                                                          <span className="text-green-500 text-sm">✓</span>
                                                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{factor.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                          <div className={`w-32 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                                                            <div 
                                                              className={`h-full ${getScoreBg(factorScore)} rounded-full transition-all duration-1000`}
                                                              style={{ width: factorScore !== null ? `${(factorScore / 10) * 100}%` : '0%' }}
                                                            ></div>
                                                          </div>
                                                          <span className={`text-sm font-semibold ${getScoreColor(factorScore)}`}>
                                                            {factorScore !== null ? factorScore.toFixed(1) : 'N/A'}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    )
                                                  })}
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Car 2 Detailed Ratings */}
                              <div className={`rounded-xl p-6 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
                                <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                                  <img src={car2.image} alt={car2.model} className="w-12 h-12 object-cover rounded-lg" />
                                  <div>
                                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{car2.brand} {car2.model}</h3>
                                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{car2.variant}</p>
                                  </div>
                                  {car2.overallScore && (
                                    <div className={`ml-auto text-center px-3 py-1 rounded-lg ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
                                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Overall</span>
                                      <div className="text-lg font-bold text-yellow-500">{car2.overallScore.toFixed(1)}</div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-3">
                                  {detailedScoreData.map((item) => {
                                    const score = item.score2
                                    const factors = item.factorScores2
                                    const isExpanded = expandedCategories[`2-${item.key}`]
                                    const isWinner = item.winner === 'car2'
                                    
                                    return (
                                      <div 
                                        key={item.key} 
                                        className={`rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                                          isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'
                                        }`}
                                      >
                                        <button
                                          onClick={() => setExpandedCategories(prev => ({
                                            ...prev,
                                            [`2-${item.key}`]: !prev[`2-${item.key}`]
                                          }))}
                                          className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                                            isDark ? 'hover:bg-dark-800' : 'hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className="flex items-center gap-3">
                                            <span className="text-xl">{item.icon}</span>
                                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.label}</span>
                                            {isWinner && (
                                              <span className="text-yellow-500 text-sm font-bold">🏆 Winner</span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                                              {score !== null ? score.toFixed(1) : 'N/A'}
                                            </span>
                                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>/ 10</span>
                                            <svg 
                                              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            >
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </div>
                                        </button>
                                        
                                        <AnimatePresence>
                                          {isExpanded && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.3 }}
                                              className="overflow-hidden"
                                            >
                                              <div className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                                                <div className="mb-3">
                                                  <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall {item.label} Score</span>
                                                    <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                                                      {score !== null ? score.toFixed(1) : 'N/A'} / 10
                                                    </span>
                                                  </div>
                                                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                                                    <div 
                                                      className={`h-full ${getScoreBg(score)} rounded-full transition-all duration-1000`}
                                                      style={{ width: score !== null ? `${(score / 10) * 100}%` : '0%' }}
                                                    ></div>
                                                  </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                  <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Contributing Factors:</p>
                                                  {item.factors.map((factor, idx) => {
                                                    const factorScore = factors[factor.key] || null
                                                    return (
                                                      <div key={idx} className="flex items-center justify-between pl-2">
                                                        <div className="flex items-center gap-2">
                                                          <span className="text-green-500 text-sm">✓</span>
                                                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{factor.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                          <div className={`w-32 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                                                            <div 
                                                              className={`h-full ${getScoreBg(factorScore)} rounded-full transition-all duration-1000`}
                                                              style={{ width: factorScore !== null ? `${(factorScore / 10) * 100}%` : '0%' }}
                                                            ></div>
                                                          </div>
                                                          <span className={`text-sm font-semibold ${getScoreColor(factorScore)}`}>
                                                            {factorScore !== null ? factorScore.toFixed(1) : 'N/A'}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    )
                                                  })}
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Quick Summary Cards */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border transition-colors duration-300 ${
                  isDark ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200'
                }`}>
                  <h4 className={`font-bold mb-2 text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>🏆 Overall Winner</h4>
                  <p className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {car1.overallScore > car2.overallScore 
                      ? `${car1.brand} ${car1.model}`
                      : car2.overallScore > car1.overallScore
                      ? `${car2.brand} ${car2.model}`
                      : 'Tie'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {car1.overallScore > car2.overallScore 
                      ? `Score: ${car1.overallScore.toFixed(1)}/10`
                      : car2.overallScore > car1.overallScore
                      ? `Score: ${car2.overallScore.toFixed(1)}/10`
                      : `Both: ${car1.overallScore.toFixed(1)}/10`}
                  </p>
                </div>
                <div className={`p-4 rounded-xl border transition-colors duration-300 ${
                  isDark ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200'
                }`}>
                  <h4 className={`font-bold mb-2 text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>🛡️ Safety Winner</h4>
                  <p className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {car1.scores?.safetyScore > car2.scores?.safetyScore 
                      ? `${car1.brand} ${car1.model}`
                      : car2.scores?.safetyScore > car1.scores?.safetyScore
                      ? `${car2.brand} ${car2.model}`
                      : 'Similar Safety'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {car1.scores?.safetyScore > car2.scores?.safetyScore 
                      ? `Score: ${car1.scores.safetyScore.toFixed(1)}/10`
                      : car2.scores?.safetyScore > car1.scores?.safetyScore
                      ? `Score: ${car2.scores.safetyScore.toFixed(1)}/10`
                      : `Both: ${car1.scores?.safetyScore?.toFixed(1) || 'N/A'}/10`}
                  </p>
                </div>
                <div className={`p-4 rounded-xl border transition-colors duration-300 ${
                  isDark ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-200'
                }`}>
                  <h4 className={`font-bold mb-2 text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>💰 Value for Money</h4>
                  <p className={`font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {car1.scores?.valueForMoneyScore > car2.scores?.valueForMoneyScore 
                      ? `${car1.brand} ${car1.model}`
                      : car2.scores?.valueForMoneyScore > car1.scores?.valueForMoneyScore
                      ? `${car2.brand} ${car2.model}`
                      : 'Similar Value'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {car1.scores?.valueForMoneyScore > car2.scores?.valueForMoneyScore 
                      ? `Score: ${car1.scores.valueForMoneyScore.toFixed(1)}/10`
                      : car2.scores?.valueForMoneyScore > car1.scores?.valueForMoneyScore
                      ? `Score: ${car2.scores.valueForMoneyScore.toFixed(1)}/10`
                      : `Both: ${car1.scores?.valueForMoneyScore?.toFixed(1) || 'N/A'}/10`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => {
                    setShowComparison(false)
                    setShowLoadingModal(true)
                    setTimeout(() => {
                      setShowComparison(true)
                      setShowLoadingModal(false)
                    }, 1500)
                  }}
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                >
                  🔄 Refresh Comparison
                </button>
                <button
                  onClick={clearAll}
                  className={`px-4 md:px-6 py-2 md:py-2.5 border rounded-lg font-semibold transition-colors text-sm ${
                    isDark 
                      ? 'border-dark-600 text-gray-400 hover:bg-dark-700' 
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  New Comparison
                </button>
                <Link
                  to="/articles"
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  Read Reviews
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Comparisons */}
      <section className={`py-12 md:py-16 transition-colors duration-300 ${
        isComparing && showComparison 
          ? isDark ? 'bg-dark-900 border-t border-dark-700' : 'bg-white border-t border-gray-200'
          : isDark ? 'bg-dark-800' : 'bg-gray-50'
      }`}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-10"
          >
            <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">Popular Comparisons</span>
            <h2 className={`text-xl md:text-2xl lg:text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Most Compared Cars</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {popularComparisons.map((comparison) => {
              const allCars = getAllCars()
              const car1Data = allCars.find(c => c.id === comparison.car1Id)
              const car2Data = allCars.find(c => c.id === comparison.car2Id)
              if (!car1Data || !car2Data) return null
              return (
                <motion.button
                  key={comparison.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4 }}
                  viewport={{ once: true }}
                  onClick={() => handlePopularCompare(car1Data.id, car2Data.id)}
                  className={`rounded-xl p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 text-left border hover:border-yellow-300 ${
                    isDark 
                      ? 'bg-dark-800 border-dark-700 hover:bg-dark-700' 
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <img src={car1Data.image} alt={car1Data.model} className="w-8 h-8 md:w-10 md:h-10 object-cover rounded" />
                        <span className={`font-semibold text-xs md:text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{car1Data.model}</span>
                      </div>
                    </div>
                    <div className="text-yellow-500 font-bold mx-1 md:mx-2 text-[10px] md:text-sm">VS</div>
                    <div className="flex-1 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`font-semibold text-xs md:text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{car2Data.model}</span>
                        <img src={car2Data.image} alt={car2Data.model} className="w-8 h-8 md:w-10 md:h-10 object-cover rounded" />
                      </div>
                    </div>
                  </div>
                  <div className={`text-center mt-1 md:mt-2 text-[10px] md:text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                    {car1Data.brand} vs {car2Data.brand}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

export default CompareCars