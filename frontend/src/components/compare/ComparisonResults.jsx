// src/components/compare/ComparisonResults.jsx

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useRef, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import OnRoadPriceDisplay from '../location/OnRoadPriceDisplay'
import useMediaQuery from '../../hooks/useMediaQuery'
import MobileBottomSheet from './MobileBottomSheet'
import SectionExplainButton from './SectionExplainButton'
import SectionExplainOverlay from './SectionExplainOverlay'
import SectionExplanationPanel from './SectionExplanationPanel'
import { buildSectionExplanation } from './sectionExplanation'

// ========================================
// Fully data-driven comparison results
// ========================================

const LABEL_COL_WIDTH = 'w-[110px] sm:w-[180px] md:w-[240px]'

// ✅ CRITICAL FIX: Whitelist of keys that MUST show a numeric rating bar
const NUMERIC_KEYS = new Set([
  // Engine & Performance
  'displacement', 'engineDisplacement', 'power', 'maxPower', 'torque', 'maxTorque',
  'mileage', 'fuelEfficiency',
  'fuelTankCapacity',
  
  // Driving Dynamics
  'turningRadius', 'groundClearance',
  
  // Dimensions
  'overallLength', 'length', 'overallWidth', 'width', 'overallHeight', 'height',
  'wheelbase', 'bootSpace', 'kerbWeight',
  
  // Off-road
  'approachAngle', 'departureAngle', 'breakoverAngle',
  
  // Safety
  'airbags',
  
  // Ownership
  'price', 'exShowroomPrice'
])

// Non-benchmarkable text fields that should never show ratings
const TEXT_ONLY_KEYS = new Set([
  'engineType', 'fuelSystem', 'engine', 
  'valvetrainType', 'valvetrain',
  'transmissionType', 'transmission',
  'steeringType', 'steeringColumn', 'steeringGearType', 'steering',
  'brakeType', 'brakeFront', 'brakeRear', 'brakes',
  'suspensionFront', 'suspensionRear', 'suspension',
  'tyreType', 'tireType', 'tyreSize', 'tireSize', 'spareTire', 'wheelSize',
  'driveType', 'bodyType', 'fuelType',
  'seats', 'upholstery', 'seatMaterial',
  'infotainment', 'connectivity', 
  'comfortFeatures', 'safetyFeatures', 'additionalFeatures',
  'exteriorFeatures', 'interiorFeatures', 'technology'
])

const ComparisonResults = ({
  comparisonData,
  onClear,
  onEdit,
  carCardRef1,
  carCardRef2,
  carCardRef3,
}) => {
  const [openSectionKey, setOpenSectionKey] = useState(null)
  const { isDark } = useTheme()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const { car1, car2, car3, sections = [] } = comparisonData

  const cars = [
    { car: car1, position: 1, slot: 'car1', ref: carCardRef1 },
    { car: car2, position: 2, slot: 'car2', ref: carCardRef2 },
    car3 ? { car: car3, position: 3, slot: 'car3', ref: carCardRef3 } : null,
  ].filter(Boolean)

  const columnCount = cars.length
  const carGridStyle = { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }

  const [collapsedSections, setCollapsedSections] = useState(() => {
    const initial = {}
    sections.forEach((section, idx) => { if (idx > 0) initial[section.key] = true })
    return initial
  })
  const toggleSection = (sectionKey) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }))
    if (openSectionKey === sectionKey) setOpenSectionKey(null)
  }

  const getColorClasses = (rating) => {
    if (rating === null || rating === undefined) {
      return { text: 'text-gray-400 dark:text-gray-500', bar: 'bg-gray-300 dark:bg-gray-600' }
    }
    if (rating >= 8) return { text: 'text-green-600 dark:text-green-400', bar: 'bg-green-500' }
    if (rating >= 5) return { text: 'text-yellow-600 dark:text-yellow-400', bar: 'bg-yellow-500' }
    return { text: 'text-red-600 dark:text-red-400', bar: 'bg-red-500' }
  }

  const getRowData = (row) => {
    const byPosition = {}
    for (const { car, position } of cars) {
      const r = car.ratings?.[row.key] || null
      byPosition[position] = {
        value: r?.displayValue ?? 'N/A',
        rating: r?.rating ?? null,
        explanation: r?.explanation || null,
        color: r?.color || null,
        isTextOnly: !NUMERIC_KEYS.has(row.key),
      }
    }
    return { ...row, byPosition }
  }

  const renderRatingBar = (rating) => {
    const colors = getColorClasses(rating)
    const percentage = rating !== null ? (rating / 10) * 100 : 0
    return (
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full">
        <div className="w-10 sm:w-16 md:w-28 h-1.5 sm:h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden theme-transition">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full ${colors.bar} rounded-full`}
          />
        </div>
        <span className={`text-[10px] sm:text-xs font-bold ${colors.text} min-w-[28px] sm:min-w-[38px] text-right theme-transition`}>
          {rating !== null ? `${rating.toFixed(1)} / 10` : 'N/A'}
        </span>
      </div>
    )
  }

  const renderValueWithRating = (value, rating, isTextOnly) => {
    if (isTextOnly) {
      return (
        <span className="text-xs sm:text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 text-center theme-transition truncate max-w-full">
          {value}
        </span>
      )
    }
    // ✅ FIX: If rating is null (meaning no valid range), show Text Only instead of N/A gray bar
    if (rating === null || rating === undefined) {
      return (
        <span className="text-xs sm:text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 text-center theme-transition truncate max-w-full">
          {value}
        </span>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center min-w-0 w-full">
        <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200 mb-1 text-center theme-transition truncate max-w-full">
          {value}
        </span>
        {renderRatingBar(rating)}
      </div>
    )
  }

  const visibleSections = sections
    .map((section) => {
      const rows = section.rows
        .map((row) => getRowData(row))
        .filter((row) => cars.some(({ position }) => row.byPosition[position]?.value !== 'N/A'))
      return { ...section, rows }
    })
    .filter((section) => section.rows.length > 0)

  const handleEditClick = (position) => {
    if (onEdit) onEdit(position)
  }

  const openSectionExplanation = useMemo(() => {
    if (!openSectionKey) return null
    const section = visibleSections.find((s) => s.key === openSectionKey)
    if (!section) return null
    return buildSectionExplanation(section, cars)
  }, [openSectionKey, visibleSections])

  const toggleExplain = (sectionKey) => {
    setOpenSectionKey((prev) => (prev === sectionKey ? null : sectionKey))
  }
  const closeExplain = () => setOpenSectionKey(null)

  useEffect(() => {
    if (!openSectionKey) return
    const handler = (e) => { if (e.key === 'Escape') closeExplain() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openSectionKey])

  const containerRef = useRef(null)
  useEffect(() => {
    if (!openSectionKey || !isDesktop) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) closeExplain()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openSectionKey, isDesktop])

  return (
    <div className="relative" ref={containerRef}>
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden theme-transition">

        {/* Header */}
        <div className="px-6 md:px-8 py-4 md:py-6 border-b border-gray-200 dark:border-dark-700 theme-transition">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white theme-transition"></h2>
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

        {/* Vehicle Header */}
        <div
          id="comparison-car-cards"
          className="flex items-start gap-2 sm:gap-4 md:gap-6 px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 bg-gradient-to-b from-gray-50 to-white dark:from-dark-800/80 dark:to-dark-800 border-b border-gray-200 dark:border-dark-700 theme-transition"
        >
          <div className={`hidden md:flex ${LABEL_COL_WIDTH} shrink-0 flex-col items-start justify-center`}>
            <span className="text-gray-400 dark:text-gray-500 font-bold tracking-widest uppercase text-sm theme-transition">Parameter</span>
          </div>

          <div className="grid flex-1 gap-2 sm:gap-4 md:gap-6" style={carGridStyle}>
            {cars.map(({ car, position, ref }, idx) => {
              const carVariant = car.name || car.variant || ''
              return (
                <div
                  key={position}
                  ref={ref}
                  className={`text-center flex flex-col items-center relative px-1 sm:px-0 ${
                    idx < cars.length - 1 ? 'md:border-r md:border-gray-200 dark:md:border-dark-700 md:pr-4' : ''
                  }`}
                >
                  <div className="flex justify-center mb-2 sm:mb-4 w-full h-20 sm:h-36 md:h-44 lg:h-48 relative">
                    <img
                      src={car.image}
                      alt={car.model}
                      className="max-w-full max-h-full object-contain drop-shadow-xl theme-transition"
                    />
                  </div>

                  <div className="flex items-center justify-center w-full relative mb-1 sm:mb-1.5 px-1 sm:px-2">
                    <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 bg-yellow-500 text-gray-900 rounded-full shadow-sm">
                      {car.brand}
                    </span>
                    <button
                      onClick={() => handleEditClick(position)}
                      className="absolute right-0 sm:right-2 text-[9px] sm:text-[11px] font-medium text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-200 flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-dark-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md"
                    >
                      ✏️ Edit
                    </button>
                  </div>

                  <div className="text-xs sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-tight theme-transition px-1">{car.model}</div>
                  <div className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 uppercase tracking-wider font-semibold theme-transition">{carVariant}</div>

                  {car.segment?.label && (
                    <span className="mt-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded-full">
                      {car.segment.label}
                    </span>
                  )}

                  <div className="mt-1 sm:mt-2 px-1">
                    <OnRoadPriceDisplay
                      exShowroomPrice={car.onRoadPricing?.exShowroomPrice}
                      exShowroomPriceLabel={car.price}
                      onRoadPricing={car.onRoadPricing}
                      isDark={isDark}
                      size="compact"
                    />
                  </div>
                  {car.overallScore && (
                    <div className="mt-1.5 sm:mt-3 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full border border-yellow-500/20 theme-transition">
                      <span className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400">★</span>
                      <span className="text-xs sm:text-sm font-bold text-yellow-600 dark:text-yellow-400">{car.overallScore.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Specification Sections */}
        <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-dark-900/20 theme-transition">
          <div className="space-y-4">
            {visibleSections.map((section) => {
              const isCollapsed = !!collapsedSections[section.key]
              const isExplainOpen = openSectionKey === section.key
              
              const hasAnyExplanation = section.rows.some((row) => {
                return cars.some(({ position }) => {
                  const cell = row.byPosition?.[position];
                  return cell?.rating !== null && cell?.rating !== undefined;
                });
              });

              return (
                <div
                  key={section.key}
                  className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl overflow-hidden theme-transition"
                >
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-gray-50 dark:bg-dark-700/50 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                      <span className="text-lg">{section.icon}</span>
                      {section.label}
                      <span className="text-[10px] font-semibold normal-case text-gray-400 dark:text-gray-500">
                        ({section.rows.length})
                      </span>
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        {/* ✅ FIX: Added dynamic min-height based on isExplainOpen */}
                        <div 
                          className="relative transition-all duration-300"
                          style={{ minHeight: isExplainOpen ? '400px' : 'auto' }}
                        >
                          <div className="divide-y divide-gray-100 dark:divide-dark-700">
                            {section.rows.map((row) => {
                              const isTextOnlyRow = !NUMERIC_KEYS.has(row.key);
                              
                              return (
                                <div
                                  key={row.key}
                                  className="flex items-center gap-2 sm:gap-4 md:gap-6 px-3 sm:px-6 md:px-8 py-2.5 md:py-3"
                                >
                                  <div className={`flex items-center gap-1.5 sm:gap-2 ${LABEL_COL_WIDTH} shrink-0 min-w-0`}>
                                    <span className="hidden sm:inline-flex shrink-0 items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-600 text-sm md:text-base theme-transition">
                                      {row.icon}
                                    </span>
                                    <span className="font-bold text-[11px] sm:text-xs md:text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wide theme-transition truncate">
                                      {row.label}
                                    </span>
                                  </div>

                                  <div className="grid flex-1 gap-2 sm:gap-4 md:gap-6" style={carGridStyle}>
                                    {cars.map(({ position }) => {
                                      const cell = row.byPosition[position]
                                      const value = cell?.value ?? 'N/A'
                                      const rating = cell?.rating ?? null
                                      const isTextOnlyField = isTextOnlyRow || cell?.isTextOnly === true;
                                      
                                      return (
                                        <div key={position} className="flex flex-col items-center justify-center min-w-0">
                                          {renderValueWithRating(value, rating, isTextOnlyField)}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Desktop overlay */}
                          {isDesktop && (
                            <SectionExplainOverlay
                              isOpen={isExplainOpen}
                              section={openSectionExplanation}
                              labelColWidthClass={LABEL_COL_WIDTH}
                              onClose={closeExplain}
                            />
                          )}
                        </div>

                        {hasAnyExplanation && !isExplainOpen && (
                          <SectionExplainButton
                            onClick={() => toggleExplain(section.key)}
                            isActive={isExplainOpen}
                          />
                        )}
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

      {/* Mobile bottom sheet */}
      {!isDesktop && (
        <MobileBottomSheet
          isOpen={!!openSectionKey}
          onClose={closeExplain}
          title={openSectionExplanation ? `${openSectionExplanation.label}` : ''}
          icon={openSectionExplanation?.icon}
        >
          <SectionExplanationPanel section={openSectionExplanation} showHeader={false} />
        </MobileBottomSheet>
      )}
    </div>
  )
}

export default ComparisonResults