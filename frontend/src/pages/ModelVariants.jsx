import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'
import { 
  ChevronLeft, 
  Sparkles, 
  Fuel, 
  Cpu, 
  Gauge, 
  TrendingUp, 
  Milestone,
  ArrowRight,
  Info
} from 'lucide-react'

const ModelVariants = () => {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const [variants, setVariants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Retrieve passed state from routing
  const state = location.state || {}
  const { modelName, brand, verdict, focus, image, searchParams } = state

  useEffect(() => {
    const fetchVariants = async () => {
      setIsLoading(true)
      setError('')
      try {
        const res = await api.getVariantsByModel(slug)
        if (res && res.success) {
          setVariants(res.data || [])
        } else {
          setError('No variants found for this model.')
        }
      } catch (err) {
        console.error('Error fetching variants:', err)
        setError('Network error. Failed to load variants.')
      } finally {
        setIsLoading(false)
      }
    }
    if (slug) {
      fetchVariants()
    }
  }, [slug])

  // Helper to dynamically explain why a specific variant matches the user's search choices
  const getSelectionReason = (variant) => {
    if (!searchParams) {
      return 'Matches your overall AI lifestyle recommendation.';
    }

    const budgetStr = searchParams.budget || ''
    const seatingStr = searchParams.seating || ''
    const usageStr = searchParams.usage || ''
    const terrainStr = searchParams.terrain || ''
    const driverStr = searchParams.driver || ''

    const trans = (variant.transmission || '').toLowerCase()
    const isAuto = trans.includes('auto') || trans.includes('cvt') || trans.includes('dct') || trans.includes('amt') || trans.includes('at')
    const fuel = (variant.fuelType || '').toLowerCase()

    if (usageStr.toLowerCase().includes('city') && isAuto) {
      return `Selected for easy City commutes with its convenient automatic (${variant.transmission}) transmission.`
    }
    if (driverStr.toLowerCase().includes('beginner') && isAuto) {
      return `Highly recommended for beginner drivers due to its smooth automatic transmission.`
    }
    if (usageStr.toLowerCase().includes('highway') && (fuel.includes('diesel') || fuel.includes('hybrid'))) {
      return `Excellent for highways with its efficient ${variant.fuelType} engine and high fuel economy.`
    }
    if (terrainStr.toLowerCase().includes('rough') || terrainStr.toLowerCase().includes('hills')) {
      return `Selected for terrain demands with its robust ${variant.engine || 'powertrain'} and stable chassis.`
    }

    return `Fits your ${budgetStr} budget preference with its ex-showroom price of ${variant.price || 'N/A'}.`
  }

  // Format currency numbers nicely
  const formatCurrency = (val) => {
    if (!val) return 'N/A'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  return (
    <div className={`min-h-screen pt-24 pb-16 font-sans transition-colors duration-200 ${
      isDark ? 'bg-dark-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className={`group mb-8 flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to AI Finder</span>
        </button>

        {/* Header Block */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold uppercase tracking-wider">
              {brand}
            </span>
            {focus && (
              <span className="px-3 py-1 bg-slate-500/10 text-slate-400 rounded-full text-xs font-bold">
                {focus}
              </span>
            )}
          </div>
          
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {brand} {modelName} Variants
          </h1>

          {verdict && (
            <div className={`p-5 rounded-2xl border text-sm max-w-3xl leading-relaxed flex items-start gap-3.5 shadow-sm ${
              isDark 
                ? 'bg-dark-900 border-dark-800/80 text-slate-300' 
                : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <Sparkles className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-yellow-500 block mb-1">AI Recommendation Verdict:</strong>
                {verdict.replace(/\*\*(.*?)\*\*/g, '$1')}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 text-center space-y-4"
            >
              <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                Loading available variants and specifications...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-center rounded-2xl max-w-md mx-auto"
            >
              {error}
            </motion.div>
          ) : variants.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center text-slate-400"
            >
              No variants listed for this model in the database.
            </motion.div>
          ) : (
            <motion.div
              key="variants-grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {variants.map((v) => (
                <div
                  key={v._id || v.id}
                  className={`rounded-3xl border overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${
                    isDark ? 'bg-dark-900 border-dark-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    {/* Why Selected Banner */}
                    <div className="px-5 py-3 bg-yellow-500/10 border-b border-yellow-500/10 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-yellow-500 leading-tight">
                        {getSelectionReason(v)}
                      </p>
                    </div>

                    {/* Variant Image */}
                    <div className="h-52 bg-slate-100/80 dark:bg-dark-950 flex items-center justify-center p-4 relative border-b border-slate-100 dark:border-dark-950">
                      <img
                        src={image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'}
                        alt={`${brand} ${modelName} ${v.name}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'
                        }}
                      />
                    </div>

                    {/* Core details */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {v.name}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          {v.exShowroomPrice && (
                            <span className="text-yellow-500 font-bold">
                              Ex-Showroom: {formatCurrency(v.exShowroomPrice)}
                            </span>
                          )}
                          {v.onRoadPrice && (
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                              On-Road: {formatCurrency(v.onRoadPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Specs Matrix */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-dark-800">
                        {v.engine && (
                          <div className="flex items-center gap-2">
                            <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div className="text-[10px] leading-tight">
                              <span className="text-slate-400 block font-semibold">Engine</span>
                              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{v.engine}</span>
                            </div>
                          </div>
                        )}
                        {v.displacement && (
                          <div className="flex items-center gap-2">
                            <Milestone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div className="text-[10px] leading-tight">
                              <span className="text-slate-400 block font-semibold">Displacement</span>
                              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{v.displacement} cc</span>
                            </div>
                          </div>
                        )}
                        {v.transmission && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div className="text-[10px] leading-tight">
                              <span className="text-slate-400 block font-semibold">Transmission</span>
                              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{v.transmission}</span>
                            </div>
                          </div>
                        )}
                        {v.fuelType && (
                          <div className="flex items-center gap-2">
                            <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div className="text-[10px] leading-tight">
                              <span className="text-slate-400 block font-semibold">Fuel Type</span>
                              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{v.fuelType}</span>
                            </div>
                          </div>
                        )}
                        {v.power && (
                          <div className="flex items-center gap-2 col-span-2">
                            <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div className="text-[10px] leading-tight">
                              <span className="text-slate-400 block font-semibold">Max Power</span>
                              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{v.power}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-6 pt-0 border-t border-slate-100 dark:border-dark-800/60 mt-4">
                    <button
                      onClick={() => navigate(`/compare-cars?car1=${brand} ${modelName} ${v.name}`)}
                      className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer shadow-md shadow-yellow-500/5"
                    >
                      <span>Compare Variant</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ModelVariants
