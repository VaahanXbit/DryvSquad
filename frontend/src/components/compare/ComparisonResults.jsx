// src/components/compare/ComparisonResults.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useLocation } from '../../context/LocationContext'
import { api } from '../../services/api'

const ComparisonResults = ({ 
  comparisonData, 
  onClear, 
  onEdit,
  carCardRef1,
  carCardRef2 
}) => {
  const [expandedRow, setExpandedRow] = useState(null)
  const { location } = useLocation()
  
  const { car1, car2, summary } = comparisonData

  // State for on-road prices
  const [car1OnRoadPrice, setCar1OnRoadPrice] = useState(null)
  const [car2OnRoadPrice, setCar2OnRoadPrice] = useState(null)
  const [pricingLoading, setPricingLoading] = useState(true)

  const fetchOnRoadPrices = async () => {
    setPricingLoading(true)
    try {
      // Fetch both prices in parallel
      const [price1, price2] = await Promise.all([
        api.calculateOnRoadPrice(car1.id, location.city, location.stateCode),
        api.calculateOnRoadPrice(car2.id, location.city, location.stateCode)
      ])

      if (price1.success && price1.data?.pricing) {
        // ✅ Combined fallback evaluation logic
        setCar1OnRoadPrice(price1.data.pricing.total || price1.data.pricing.totalOnRoadPrice)
      }
      if (price2.success && price2.data?.pricing) {
        setCar2OnRoadPrice(price2.data.pricing.total || price2.data.pricing.totalOnRoadPrice)
      }
    } catch (error) {
      console.error('Error fetching on-road prices:', error)
    } finally {
      setPricingLoading(false)
    }
  }

  // Fetch on-road prices when component mounts or location changes
  useEffect(() => {
    if (location && car1?.id && car2?.id) {
      fetchOnRoadPrices()
    }
  }, [location, car1?.id, car2?.id])

  const formatPrice = (price) => {
    if (!price) return 'N/A'
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(2)}K`
    }
    return `₹${price.toFixed(0)}`
  }

  const categoryOrder = [
    { key: 'torque', label: 'MAX TORQUE', icon: '⚡' },
    { key: 'power', label: 'MAX POWER', icon: '🏎️' },
    { key: 'mileage', label: 'FUEL EFFICIENCY', icon: '⛽' },
    { key: 'bootSpace', label: 'BOOT SPACE', icon: '🧳' },
    { key: 'groundClearance', label: 'GROUND CLEARANCE', icon: '🛤️' },
    { key: 'turningRadius', label: 'TURNING RADIUS', icon: '🔄' },
    { key: 'price', label: 'EX-SHOWROOM PRICE', icon: '💰' },
  ]

  const getColorClasses = (rating) => {
    if (rating === null || rating === undefined) {
      return {
        bg: 'bg-gray-300 dark:bg-gray-600',
        text: 'text-gray-400 dark:text-gray-500',
        bar: 'bg-gray-300 dark:bg-gray-600',
      }
    }
    if (rating >= 8) {
      return {
        bg: 'bg-green-500',
        text: 'text-green-600 dark:text-green-400',
        bar: 'bg-green-500',
      }
    } else if (rating >= 5) {
      return {
        bg: 'bg-yellow-500',
        text: 'text-yellow-600 dark:text-yellow-400',
        bar: 'bg-yellow-500',
      }
    } else {
      return {
        bg: 'bg-red-500',
        text: 'text-red-600 dark:text-red-400',
        bar: 'bg-red-500',
      }
    }
  }

  const getRatingData = (key) => {
    const r1 = car1.ratings?.[key] || null
    const r2 = car2.ratings?.[key] || null

    return {
      label: r1?.label || categoryOrder.find(c => c.key === key)?.label || key,
      icon: r1?.icon || categoryOrder.find(c => c.key === key)?.icon || '📊',
      car1: {
        value: r1?.displayValue || 'N/A',
        rating: r1?.rating || null,
        explanation: r1?.explanation || null,
        color: r1?.color || null,
      },
      car2: {
        value: r2?.displayValue || 'N/A',
        rating: r2?.rating || null,
        explanation: r2?.explanation || null,
        color: r2?.color || null,
      },
    }
  }

  const toggleExpand = (key) => {
    setExpandedRow(expandedRow === key ? null : key)
  }

  const renderRatingBar = (rating) => {
    const colors = getColorClasses(rating)
    const percentage = rating !== null ? (rating / 10) * 100 : 0

    return (
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 w-full">
        <div className="w-16 sm:w-28 md:w-44 h-2 sm:h-2.5 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden theme-transition">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${colors.bar} rounded-full`}
          />
        </div>
        <span className={`text-[11px] sm:text-sm font-bold ${colors.text} min-w-[36px] sm:min-w-[50px] text-right theme-transition`}>
          {rating !== null ? `${rating.toFixed(1)}/10` : 'N/A'}
        </span>
      </div>
    )
  }

  const getVisibleCategories = () => {
    const visible = []
    for (const cat of categoryOrder) {
      const data = getRatingData(cat.key)
      const hasData = data.car1.rating !== null || data.car2.rating !== null
      if (hasData) {
        visible.push({ ...cat, data })
      }
    }
    return visible
  }

  const visibleCategories = getVisibleCategories()
  
  const car1Full = `${car1.brand} ${car1.model}`
  const car2Full = `${car2.brand} ${car2.model}`
  const car1Variant = car1.name || car1.variant || ''
  const car2Variant = car2.name || car2.variant || ''

  const handleEditClick = (position) => {
    if (onEdit) {
      onEdit(position)
    }
  }

  const hasOnRoadPrice = car1OnRoadPrice !== null || car2OnRoadPrice !== null

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden theme-transition">
      
      {/* Header */}
      <div className="px-6 md:px-8 py-4 md:py-6 border-b border-gray-200 dark:border-dark-700 theme-transition">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white theme-transition">
              Comparison Results
            </h2>
            {location && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1">
                📍 {location.city || location.state}
              </span>
            )}
          </div>
          <button 
            onClick={onClear} 
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 bg-gray-50 hover:bg-gray-100 dark:bg-dark-700 dark:hover:bg-dark-600 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Car Cards with On-Road Price */}
      <div 
        id="comparison-car-cards"
        className="px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6 bg-gradient-to-b from-gray-50 to-white dark:from-dark-800/80 dark:to-dark-800 border-b border-gray-200 dark:border-dark-700 theme-transition"
      >
        {/* Parameter Label */}
        <div className="hidden md:flex flex-col items-center justify-center text-center">
          <span className="text-gray-400 dark:text-gray-500 font-bold tracking-widest uppercase text-sm theme-transition">Parameter</span>
        </div>

        {/* Car 1 */}
        <div 
          ref={carCardRef1}
          className="col-start-1 md:col-start-2 text-center flex flex-col items-center justify-end md:justify-start relative md:border-r md:border-gray-200 dark:md:border-dark-700 pr-1 sm:pr-0"
        >
          <div className="flex justify-center mb-2 sm:mb-4 w-full h-20 sm:h-36 md:h-44 lg:h-48 relative">
            <img 
              src={car1.image} 
              alt={car1.model} 
              className="max-w-full max-h-full object-contain drop-shadow-xl theme-transition" 
            />
          </div>
          
          <div className="flex items-center justify-center w-full relative mb-1 sm:mb-1.5 px-1 sm:px-2">
            <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 bg-yellow-500 text-gray-900 rounded-full shadow-sm">
              {car1.brand}
            </span>
            <button
              onClick={() => handleEditClick(1)}
              className="absolute right-0 sm:right-2 text-[9px] sm:text-[11px] font-medium text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-200 flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-dark-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md"
            >
              ✏️ Edit
            </button>
          </div>

          <div className="text-xs sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-tight theme-transition px-1">{car1.model}</div>
          <div className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 uppercase tracking-wider font-semibold theme-transition">{car1Variant}</div>
          
          {/* Ex-Showroom Price */}
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ex-Showroom: <span className="font-semibold text-gray-700 dark:text-gray-300">{car1.price}</span>
          </div>

          {/* On-Road Price */}
          <div className="mt-1">
            {pricingLoading ? (
              <div className="flex items-center justify-center gap-1">
                <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-gray-400">Loading...</span>
              </div>
            ) : car1OnRoadPrice ? (
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full border border-yellow-500/20 theme-transition">
                <span className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400">💰</span>
                <span className="text-xs sm:text-sm font-bold text-yellow-600 dark:text-yellow-400">
                  {formatPrice(car1OnRoadPrice)}
                </span>
                <span className="text-[8px] sm:text-[9px] text-yellow-500/70">On-Road</span>
              </div>
            ) : (
              <span className="text-[10px] text-gray-400">No location data</span>
            )}
          </div>

          {car1.overallScore && (
            <div className="mt-1.5 sm:mt-3 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full border border-yellow-500/20 theme-transition">
              <span className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400">★</span>
              <span className="text-xs sm:text-sm font-bold text-yellow-600 dark:text-yellow-400">{car1.overallScore.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Car 2 */}
        <div 
          ref={carCardRef2}
          className="col-start-2 md:col-start-3 text-center flex flex-col items-center justify-end md:justify-start relative pl-1 sm:pl-0"
        >
          <div className="flex justify-center mb-2 sm:mb-4 w-full h-20 sm:h-36 md:h-44 lg:h-48 relative">
            <img 
              src={car2.image} 
              alt={car2.model} 
              className="max-w-full max-h-full object-contain drop-shadow-xl theme-transition" 
            />
          </div>
          
          <div className="flex items-center justify-center w-full relative mb-1 sm:mb-1.5 px-1 sm:px-2">
            <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 bg-yellow-500 text-gray-900 rounded-full shadow-sm">
              {car2.brand}
            </span>
            <button
              onClick={() => handleEditClick(2)}
              className="absolute right-0 sm:right-2 text-[9px] sm:text-[11px] font-medium text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-200 flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-dark-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md"
            >
              ✏️ Edit
            </button>
          </div>

          <div className="text-xs sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-tight theme-transition px-1">{car2.model}</div>
          <div className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 uppercase tracking-wider font-semibold theme-transition">{car2Variant}</div>
          
          {/* Ex-Showroom Price */}
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ex-Showroom: <span className="font-semibold text-gray-700 dark:text-gray-300">{car2.price}</span>
          </div>

          {/* On-Road Price */}
          <div className="mt-1">
            {pricingLoading ? (
              <div className="flex items-center justify-center gap-1">
                <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-gray-400">Loading...</span>
              </div>
            ) : car2OnRoadPrice ? (
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full border border-yellow-500/20 theme-transition">
                <span className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400">💰</span>
                <span className="text-xs sm:text-sm font-bold text-yellow-600 dark:text-yellow-400">
                  {formatPrice(car2OnRoadPrice)}
                </span>
                <span className="text-[8px] sm:text-[9px] text-yellow-500/70">On-Road</span>
              </div>
            ) : (
              <span className="text-[10px] text-gray-400">No location data</span>
            )}
          </div>

          {car2.overallScore && (
            <div className="mt-1.5 sm:mt-3 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full border border-yellow-500/20 theme-transition">
              <span className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400">★</span>
              <span className="text-xs sm:text-sm font-bold text-yellow-600 dark:text-yellow-400">{car2.overallScore.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Rows */}
      <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-dark-900/20 theme-transition">
        <div className="space-y-2">
          {visibleCategories.map((category, index) => {
            const { key, label, icon, data } = category
            const isExpanded = expandedRow === key
            const hasExplanation = data.car1.explanation || data.car2.explanation

            return (
              <div 
                key={key} 
                className={`bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl overflow-hidden transition-all duration-300 theme-transition ${
                  isExpanded ? 'shadow-md border-yellow-400/50 dark:border-yellow-500/30 ring-1 ring-yellow-400/20' : 'hover:border-gray-300 dark:hover:border-dark-600 hover:shadow-sm'
                }`}
              >
                <div className="px-3 sm:px-6 md:px-8 py-4 md:py-6 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6 items-center">
                  
                  <div className="flex items-center gap-2 sm:gap-4 col-span-2 md:col-span-1">
                    <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-600 shadow-sm text-lg sm:text-2xl theme-transition">
                      {icon}
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wide theme-transition">
                      {label}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center col-span-1">
                    <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-1.5 sm:mb-2 text-center theme-transition">
                      {data.car1.value}
                    </span>
                    {renderRatingBar(data.car1.rating)}
                  </div>

                  <div className="flex flex-col items-center justify-center col-span-1">
                    <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-1.5 sm:mb-2 text-center theme-transition">
                      {data.car2.value}
                    </span>
                    {renderRatingBar(data.car2.rating)}
                  </div>
                </div>

                {hasExplanation && (
                  <button
                    className="w-full px-6 py-2.5 border-t border-gray-100 dark:border-dark-700 bg-gray-50/50 hover:bg-gray-100/80 dark:bg-dark-800 dark:hover:bg-dark-700/80 transition-colors duration-200 flex items-center justify-center gap-2 group theme-transition"
                    onClick={() => toggleExpand(key)}
                  >
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200 theme-transition">
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 sm:px-6 md:px-8 py-4 md:py-6 bg-yellow-50/30 dark:bg-yellow-900/5 border-t border-yellow-100 dark:border-yellow-900/20 theme-transition">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                          <div className="hidden md:block"></div>

                          {data.car1.explanation && (
                            <div className="col-start-1 md:col-start-2 p-2.5 sm:p-4 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 shadow-sm theme-transition">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 theme-transition truncate">
                                  {car1Full} ({car1Variant})
                                </span>
                                {data.car1.rating !== null && data.car1.rating >= 7 && (
                                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 theme-transition">
                                    ★ Good
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 leading-relaxed theme-transition">
                                {data.car1.explanation.summary}
                              </p>
                              <ul className="space-y-1 sm:space-y-1.5">
                                {data.car1.explanation.details?.map((detail, idx) => (
                                  <li key={idx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-start gap-1.5 sm:gap-2 theme-transition">
                                    <span className="text-yellow-500 mt-0.5 text-xs">◆</span>
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {data.car2.explanation && (
                            <div className="col-start-2 md:col-start-3 p-2.5 sm:p-4 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 shadow-sm theme-transition">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 theme-transition truncate">
                                  {car2Full} ({car2Variant})
                                </span>
                                {data.car2.rating !== null && data.car2.rating >= 7 && (
                                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 theme-transition">
                                    ★ Good
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 leading-relaxed theme-transition">
                                {data.car2.explanation.summary}
                              </p>
                              <ul className="space-y-1 sm:space-y-1.5">
                                {data.car2.explanation.details?.map((detail, idx) => (
                                  <li key={idx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-start gap-1.5 sm:gap-2 theme-transition">
                                    <span className="text-yellow-500 mt-0.5 text-xs">◆</span>
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}

          {/* On-Road Price Comparison Row */}
          {hasOnRoadPrice && (
            <div className="bg-white dark:bg-dark-800 border border-yellow-300 dark:border-yellow-700/50 rounded-xl overflow-hidden theme-transition">
              <div className="px-3 sm:px-6 md:px-8 py-4 md:py-6 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6 items-center bg-yellow-50/30 dark:bg-yellow-900/10">
                
                <div className="flex items-center gap-2 sm:gap-4 col-span-2 md:col-span-1">
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 shadow-sm text-lg sm:text-2xl theme-transition">
                    💰
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wide theme-transition">
                    ON-ROAD PRICE
                  </span>
                  {location && (
                    <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      📍 {location.city || location.state}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center col-span-1">
                  <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-1 text-center theme-transition">
                    {car1.price}
                  </span>
                  {pricingLoading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-gray-400">Loading...</span>
                    </div>
                  ) : car1OnRoadPrice ? (
                    <span className="text-lg sm:text-xl font-bold text-yellow-600 dark:text-yellow-400">
                      {formatPrice(car1OnRoadPrice)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center col-span-1">
                  <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-1 text-center theme-transition">
                    {car2.price}
                  </span>
                  {pricingLoading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-gray-400">Loading...</span>
                    </div>
                  ) : car2OnRoadPrice ? (
                    <span className="text-lg sm:text-xl font-bold text-yellow-600 dark:text-yellow-400">
                      {formatPrice(car2OnRoadPrice)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 md:px-6 py-6 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 flex flex-wrap gap-4 justify-center theme-transition">
        <button 
          onClick={onClear} 
          className="px-8 py-3 border border-gray-300 dark:border-dark-600 text-gray-600 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-all duration-200"
        >
          New Comparison
        </button>
      </div>
    </div>
  )
}

export default ComparisonResults