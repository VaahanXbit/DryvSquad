import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Landmark, ShieldAlert, ArrowLeft, Send, CheckCircle2, ChevronDown } from 'lucide-react'
import { api } from '../services/api'

const LeadFormPage = ({ type }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const fromArticle = location.state?.fromArticle || '/ai-mode'
  const isFromArticle = fromArticle.startsWith('/article/')
  const isLoan = type === 'auto-loan'
  
  // Dynamic Car Database Models State
  const [carModels, setCarModels] = useState([])
  const [isLoadingCars, setIsLoadingCars] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Insurance specific
    carModelOrBudget: '',
    insuranceType: 'Comprehensive',
    // Auto Loan specific
    carBudget: '<10L',
    downPayment: 'Yes'
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [submitted, setSubmitted] = useState(false)

  // Fetch cars hierarchy for the dropdown in Insurance form
  useEffect(() => {
    if (!isLoan) {
      setIsLoadingCars(true)
      api.getAllCars()
        .then((response) => {
          if (response && response.success && Array.isArray(response.data)) {
            const list = []
            response.data.forEach(brand => {
              if (Array.isArray(brand.models)) {
                brand.models.forEach(model => {
                  list.push(`${brand.brand} ${model.name}`)
                })
              }
            })
            setCarModels(list)
            if (list.length > 0) {
              setFormData(prev => ({ ...prev, carModelOrBudget: list[0] }))
            }
          }
        })
        .catch(err => console.error('Error fetching cars list:', err))
        .finally(() => setIsLoadingCars(false))
    }
  }, [isLoan])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // Basic Validations
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setMessage({ type: 'error', text: 'Please fill in Name, Email, and Phone Number.' })
      setLoading(false)
      return
    }

    try {
      const payload = {
        type,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ...(isLoan ? {
          carBudget: formData.carBudget,
          downPayment: formData.downPayment
        } : {
          carModelOrBudget: formData.carModelOrBudget,
          insuranceType: formData.insuranceType
        })
      }

      const response = await api.submitLead(payload)
      if (response.success) {
        setSubmitted(true)
        setMessage({
          type: 'success',
          text: isLoan 
            ? '🎉 Your Auto Loan request has been submitted! Our financial advisor will contact you shortly.'
            : '🎉 Your Car Insurance quote request has been submitted! We are matching you with the best rates.'
        })
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to submit details. Please try again.' })
      }
    } catch (err) {
      console.error('Lead submit error:', err)
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-yellow-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 animate-fade-in">
        <Link 
          to={fromArticle} 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {isFromArticle ? 'Back to Article' : 'Back to AI Advisor'}
        </Link>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          
          {submitted ? (
            <div className="text-center py-10 space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-up">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Submission Successful</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                {message.text}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate(fromArticle)}
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-yellow-500/10"
                >
                  {isFromArticle ? 'Return to Article' : 'Return to AI Advisor'}
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setFormData(prev => ({
                      ...prev,
                      name: '',
                      email: '',
                      phone: ''
                    }))
                  }}
                  className="px-6 py-3 border border-slate-750 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Submit Another request
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="space-y-3 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-xs font-semibold">
                  {isLoan ? <Landmark className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  <span>{isLoan ? 'Financing Request' : 'Insurance Request'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {isLoan ? 'Auto Loan Form' : 'Insurance Lead Form'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {isLoan 
                    ? 'Get matched with competitive auto loan plans for your vehicle budget.'
                    : 'Compare rates and coverage options for comprehensive or third-party vehicle insurance.'}
                </p>
              </div>

              {/* Status Message */}
              {message.text && (
                <div className={`p-4 rounded-xl mb-6 text-sm border ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Core Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Amit Kumar"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Phone <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-sm font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Email <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="amit@domain.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* Conditional Fields */}
                {isLoan ? (
                  <div className="space-y-6 border-t border-slate-800 pt-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Car Budget ₹ <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="carBudget"
                          value={formData.carBudget}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-sm font-semibold appearance-none cursor-pointer"
                        >
                          <option value="<10L">Under ₹10 Lakhs (&lt;10L)</option>
                          <option value="10-15L">₹10 Lakhs - ₹15 Lakhs (10-15L)</option>
                          <option value="15-20L">₹15 Lakhs - ₹20 Lakhs (15-20L)</option>
                          <option value="20L+">₹20 Lakhs+ (20L+)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Down payment available? <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex gap-6 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer group text-sm font-semibold">
                          <input
                            type="radio"
                            name="downPayment"
                            value="Yes"
                            checked={formData.downPayment === 'Yes'}
                            onChange={handleInputChange}
                            className="w-4 h-4 accent-yellow-500 cursor-pointer"
                          />
                          <span className="text-slate-300 group-hover:text-white transition-colors">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group text-sm font-semibold">
                          <input
                            type="radio"
                            name="downPayment"
                            value="No"
                            checked={formData.downPayment === 'No'}
                            onChange={handleInputChange}
                            className="w-4 h-4 accent-yellow-500 cursor-pointer"
                          />
                          <span className="text-slate-300 group-hover:text-white transition-colors">No</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 border-t border-slate-800 pt-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Current Car Model or Budget ₹ <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="carModelOrBudget"
                          value={formData.carModelOrBudget}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-sm font-semibold appearance-none cursor-pointer"
                          disabled={isLoadingCars}
                        >
                          {isLoadingCars ? (
                            <option>Loading models from database...</option>
                          ) : (
                            <>
                              {/* Static budgets as fallbacks/options */}
                              <optgroup label="Car Budgets">
                                <option value="Budget: <10L">Under ₹10 Lakhs (&lt;10L)</option>
                                <option value="Budget: 10-15L">₹10 Lakhs - ₹15 Lakhs (10-15L)</option>
                                <option value="Budget: 15-20L">₹15 Lakhs - ₹20 Lakhs (15-20L)</option>
                                <option value="Budget: 20L+">₹20 Lakhs+ (20L+)</option>
                              </optgroup>
                              
                              {/* Dynamic models from MongoDB */}
                              {carModels.length > 0 && (
                                <optgroup label="Database Car Models">
                                  {carModels.map((model, idx) => (
                                    <option key={idx} value={model}>{model}</option>
                                  ))}
                                </optgroup>
                              )}
                            </>
                          )}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Insurance Type Needed <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex gap-6 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer group text-sm font-semibold">
                          <input
                            type="radio"
                            name="insuranceType"
                            value="Comprehensive"
                            checked={formData.insuranceType === 'Comprehensive'}
                            onChange={handleInputChange}
                            className="w-4 h-4 accent-yellow-500 cursor-pointer"
                          />
                          <span className="text-slate-300 group-hover:text-white transition-colors">Comprehensive</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group text-sm font-semibold">
                          <input
                            type="radio"
                            name="insuranceType"
                            value="Third Party"
                            checked={formData.insuranceType === 'Third Party'}
                            onChange={handleInputChange}
                            className="w-4 h-4 accent-yellow-500 cursor-pointer"
                          />
                          <span className="text-slate-300 group-hover:text-white transition-colors">Third Party Only</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-2xl shadow-xl hover:shadow-yellow-500/15 transition-all text-sm font-extrabold disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4.5 w-4.5 border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default LeadFormPage
