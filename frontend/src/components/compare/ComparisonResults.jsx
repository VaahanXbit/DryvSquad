// src/components/compare/ComparisonResults.jsx

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const ComparisonResults = ({ 
  comparisonData, 
  onClear, 
  onEdit,
  carCardRef1,
  carCardRef2 
}) => {
  const [expandedRow, setExpandedRow] = useState(null)
  
  const { car1, car2, summary } = comparisonData

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
      <div className="flex items-center justify-center gap-3 w-full">
        <div className="w-44 h-2.5 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden theme-transition">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${colors.bar} rounded-full`}
          />
        </div>
        <span className={`text-sm font-bold ${colors.text} min-w-[50px] text-right theme-transition`}>
          {rating !== null ? `${rating.toFixed(1)} / 10` : 'N/A'}
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

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden theme-transition">
      
      {/* Header - Only title + close */}
      <div className="px-6 md:px-8 py-4 md:py-6 border-b border-gray-200 dark:border-dark-700 theme-transition">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white theme-transition">
            {/* Title space kept if needed in future */}
          </h2>
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

      {/* ✅ Car Cards with ID for scroll tracking */}
      <div 
        id="comparison-car-cards"
        className="px-6 md:px-8 py-6 md:py-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-b from-gray-50 to-white dark:from-dark-800/80 dark:to-dark-800 border-b border-gray-200 dark:border-dark-700 theme-transition"
      >
        {/* Parameter Label */}
        <div className="hidden md:flex flex-col items-center justify-center text-center">
          <span className="text-gray-400 dark:text-gray-500 font-bold tracking-widest uppercase text-sm theme-transition">Parameter</span>
        </div>

        {/* Car 1 */}
        <div 
          ref={carCardRef1}
          className="text-center flex flex-col items-center justify-end relative"
        >
          <div className="flex justify-center mb-4 w-full h-36 md:h-44 lg:h-48 relative">
            <img 
              src={car1.image} 
              alt={car1.model} 
              className="max-w-full max-h-full object-contain drop-shadow-xl theme-transition" 
            />
          </div>
          
          {/* ✅ UPDATED ROW: Brand name centered, Edit button aligned right */}
          <div className="flex items-center justify-center w-full relative mb-1.5 px-2">
            <span className="text-xs font-bold px-3 py-0.5 bg-yellow-500 text-gray-900 rounded-full shadow-sm">
              {car1.brand}
            </span>
            <button
              onClick={() => handleEditClick(1)}
              className="absolute right-2 text-[11px] font-medium text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-200 flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-dark-700 px-2 py-1 rounded-md"
            >
              ✏️ Edit
            </button>
          </div>

          <div className="text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-tight theme-transition">{car1.model}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold theme-transition">{car1Variant}</div>
          <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mt-2 theme-transition">{car1.price}</div>
          {car1.overallScore && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full border border-yellow-500/20 theme-transition">
              <span className="text-xs text-yellow-600 dark:text-yellow-400">★</span>
              <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{car1.overallScore.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Car 2 */}
        <div 
          ref={carCardRef2}
          className="text-center flex flex-col items-center justify-end relative"
        >
          <div className="flex justify-center mb-4 w-full h-36 md:h-44 lg:h-48 relative">
            <img 
              src={car2.image} 
              alt={car2.model} 
              className="max-w-full max-h-full object-contain drop-shadow-xl theme-transition" 
            />
          </div>
          
          {/* ✅ UPDATED ROW: Brand name centered, Edit button aligned right */}
          <div className="flex items-center justify-center w-full relative mb-1.5 px-2">
            <span className="text-xs font-bold px-3 py-0.5 bg-yellow-500 text-gray-900 rounded-full shadow-sm">
              {car2.brand}
            </span>
            <button
              onClick={() => handleEditClick(2)}
              className="absolute right-2 text-[11px] font-medium text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-200 flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-dark-700 px-2 py-1 rounded-md"
            >
              ✏️ Edit
            </button>
          </div>

          <div className="text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-tight theme-transition">{car2.model}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold theme-transition">{car2Variant}</div>
          <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mt-2 theme-transition">{car2.price}</div>
          {car2.overallScore && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full border border-yellow-500/20 theme-transition">
              <span className="text-xs text-yellow-600 dark:text-yellow-400">★</span>
              <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{car2.overallScore.toFixed(1)}</span>
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
                <div className="px-6 md:px-8 py-4 md:py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  
                  <div className="flex items-center gap-4 col-span-1">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-600 shadow-sm text-2xl theme-transition">
                      {icon}
                    </div>
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wide theme-transition">
                      {label}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center col-span-1">
                    <span className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 text-center theme-transition">
                      {data.car1.value}
                    </span>
                    {renderRatingBar(data.car1.rating)}
                  </div>

                  <div className="flex flex-col items-center justify-center col-span-1">
                    <span className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 text-center theme-transition">
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
                      {isExpanded }
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
                      <div className="px-6 md:px-8 py-4 md:py-6 bg-yellow-50/30 dark:bg-yellow-900/5 border-t border-yellow-100 dark:border-yellow-900/20 theme-transition">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="hidden md:block"></div>

                          {data.car1.explanation && (
                            <div className="p-4 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 shadow-sm theme-transition">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 theme-transition">
                                  {car1Full} ({car1Variant})
                                </span>
                                {data.car1.rating !== null && data.car1.rating >= 7 && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full flex-shrink-0 theme-transition">
                                    ★ Good
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed theme-transition">
                                {data.car1.explanation.summary}
                              </p>
                              <ul className="space-y-1.5">
                                {data.car1.explanation.details?.map((detail, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 theme-transition">
                                    <span className="text-yellow-500 mt-0.5 text-xs">◆</span>
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {data.car2.explanation && (
                            <div className="p-4 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 shadow-sm theme-transition">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 theme-transition">
                                  {car2Full} ({car2Variant})
                                </span>
                                {data.car2.rating !== null && data.car2.rating >= 7 && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full flex-shrink-0 theme-transition">
                                    ★ Good
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed theme-transition">
                                {data.car2.explanation.summary}
                              </p>
                              <ul className="space-y-1.5">
                                {data.car2.explanation.details?.map((detail, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 theme-transition">
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