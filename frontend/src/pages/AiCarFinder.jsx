import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useDsLocation } from '../context/LocationContext'
import { api } from '../services/api'
import { jsPDF } from 'jspdf'
import { 
  Sparkles, 
  Search, 
  ChevronDown, 
  Loader2, 
  ChevronRight,
  ChevronLeft,
  Car, 
  Users, 
  Compass, 
  HelpCircle,
  Lock,
  Unlock,
  FileText,
  X,
  CheckCircle2,
  DollarSign,
  Calendar,
  AlertCircle,
  MapPin
} from 'lucide-react'
import AuthModal from '../components/AuthModal'
import PaymentButton from '../components/PaymentButton'

const getBaseModelName = (name, brand) => {
  if (!name) return ''
  let base = name
  
  if (brand && base.toLowerCase().startsWith(brand.toLowerCase())) {
    base = base.substring(brand.length).trim()
  }
  
  base = base.replace(/\b(1\.\d|2\.\d)\s*(l|turbo|diesel|petrol|hybrid|puretech|tgdi|gdi)?\b/gi, '')
  base = base.replace(/\b(dct|cvt|amt|at|mt|ivt|tc|manual|automatic|dsg)\b/gi, '')
  base = base.replace(/\b(smart hybrid|hybrid|mild hybrid|strong hybrid)\b/gi, '')
  base = base.replace(/\b(4wd|awd|2wd|fwd|rwd)\b/gi, '')
  base = base.replace(/\b(technology|sportback|quattro|luxury|premium|prestige|exclusive|style|active|ambition|select|executive)\b/gi, '')
  base = base.replace(/\b(zx|vx|v|zxi|vxi|lxi|s|sx|sxi|ex|dx|lx|mx|gx|ax|zeta|alpha|delta|sigma|k15c|k12n|k10c|110)\b/gi, '')
  
  return base.replace(/\s+/g, ' ').trim()
}

const AiCarFinder = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const { location, ensureLocationForFeature } = useDsLocation()
  const [pendingSearch, setPendingSearch] = useState(false)

  // --- WIZARD STATES ---
  const [currentStep, setCurrentStep] = useState(1)
  const [budgetSlider, setBudgetSlider] = useState(12)
  const [emiComfort, setEmiComfort] = useState('₹8K-₹12K')
  const [monthlyMaintSpend, setMonthlyMaintSpend] = useState('₹3K-₹6K')
  const city = location?.city || location?.district || location?.state || 'Delhi'
  const [lifeProfile, setLifeProfile] = useState('solo_commuter')
  const [dailyReality, setDailyReality] = useState(['Daily office commute (city)'])
  const [nonNegotiables, setNonNegotiables] = useState([])
  const [keepDuration, setKeepDuration] = useState('4-6 years')
  const [fuelPref, setFuelPref] = useState('No preference')
  const [resaleImportance, setResaleImportance] = useState('Prefer good resale')
  const [relaxedNonNegotiables, setRelaxedNonNegotiables] = useState(false)

  // --- PDF CHECKOUT FORM STATES ---
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    email: '',
    phone: '',
    downpayment: 200000,
    tenure: '5 Years',
    annualRun: '10,000 - 20,000 km',
    ownershipYears: '5 Years',
    insuranceType: 'Comprehensive',
    selectedCar: ''
  })
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfSuccess, setPdfSuccess] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [premiumUnlocked, setPremiumUnlocked] = useState(() => {
    return localStorage.getItem('dryvsquad_pdf_unlocked') === 'true'
  })
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // --- RESULTS STATES ---
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [noExactMatch, setNoExactMatch] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  const scrollContainerRef = useRef(null)

  // Load finder state from sessionStorage on mount
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('dryvsquad_car_finder_state')
      if (cached) {
        const state = JSON.parse(cached)
        if (state.currentStep) setCurrentStep(state.currentStep)
        if (state.budgetSlider) setBudgetSlider(state.budgetSlider)
        if (state.emiComfort) setEmiComfort(state.emiComfort)
        if (state.monthlyMaintSpend) setMonthlyMaintSpend(state.monthlyMaintSpend)
        if (state.lifeProfile) setLifeProfile(state.lifeProfile)
        if (state.dailyReality) setDailyReality(state.dailyReality)
        if (state.nonNegotiables) setNonNegotiables(state.nonNegotiables)
        if (state.keepDuration) setKeepDuration(state.keepDuration)
        if (state.fuelPref) setFuelPref(state.fuelPref)
        if (state.resaleImportance) setResaleImportance(state.resaleImportance)
        if (state.recommendations) setRecommendations(state.recommendations)
        if (state.noExactMatch !== undefined) setNoExactMatch(state.noExactMatch)
        if (state.relaxedNonNegotiables !== undefined) setRelaxedNonNegotiables(state.relaxedNonNegotiables)
        if (state.searched !== undefined) setSearched(state.searched)
      }
    } catch (e) {
      console.error('Failed to load cached finder state:', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Synchronize token state on mount
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'))
      setPremiumUnlocked(localStorage.getItem('dryvsquad_pdf_unlocked') === 'true')
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Auto-save finder state to sessionStorage on any state change (only after load)
  useEffect(() => {
    if (!isLoaded) return
    try {
      const state = {
        currentStep,
        budgetSlider,
        emiComfort,
        monthlyMaintSpend,
        city,
        lifeProfile,
        dailyReality,
        nonNegotiables,
        keepDuration,
        fuelPref,
        resaleImportance,
        recommendations,
        noExactMatch,
        relaxedNonNegotiables,
        searched
      }
      sessionStorage.setItem('dryvsquad_car_finder_state', JSON.stringify(state))
    } catch (e) {
      // Ignore incognito quota errors
    }
  }, [isLoaded, currentStep, budgetSlider, emiComfort, monthlyMaintSpend, city, lifeProfile, dailyReality, nonNegotiables, keepDuration, fuelPref, resaleImportance, recommendations, noExactMatch, relaxedNonNegotiables, searched])

  const classifyCity = (cityName) => {
    if (!cityName) return 'Tier 1';
    const c = cityName.toLowerCase().trim();
    const tier1 = ["mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "ahmedabad", "chennai", "kolkata", "pune"];
    const tier2 = ["jaipur", "lucknow", "kanpur", "nagpur", "indore", "thane", "bhopal", "visakhapatnam", "vizag", "patna", "vadodara", "ghaziabad", "ludhiana", "agra", "nashik", "faridabad", "meerut", "rajkot", "varanasi", "srinagar", "aurangabad", "dhanbad", "amritsar", "navi mumbai", "allahabad", "prayagraj", "ranchi", "howrah", "coimbatore", "jabalpur", "gwalior", "vijayawada", "jodhpur", "madurai", "raipur", "kota", "guwahati", "chandigarh", "solapur", "hubli", "dharwad", "bareilly", "moradabad", "mysore", "mysuru", "gurgaon", "gurugram", "aligarh", "jalandhar", "tiruchirappalli", "bhubaneswar", "salem", "warangal", "guntur", "bhilai", "amravati", "noida", "jamshedpur", "bikaner", "kochi", "cuttack", "dehradun", "kolhapur", "ajmer", "jammu", "mangalore", "mangaluru", "udaipur", "shimla", "panaji"];
    
    if (tier1.some(ct => c.includes(ct))) return 'Tier 1';
    if (tier2.some(ct => c.includes(ct))) return 'Tier 2';
    if (c.includes("rural") || c.includes("village") || c.includes("town")) return 'Rural';
    return 'Tier 3';
  };

  const navigateToVariants = (car) => {
    const mappedBudget = budgetSlider >= 80 ? "80L+" : `${budgetSlider}L`
    navigate(`/model-variants/${car.slug}`, {
      state: {
        modelName: car.displayName || (car.brand + " " + getBaseModelName(car.name, car.brand)),
        brand: car.brand,
        verdict: car.verdict,
        focus: car.focus,
        image: car.image,
        matchingVariants: car.matchingVariants || [],
        recommendedVariant: car.recommendedVariant || '',
        searchParams: { 
          budget: mappedBudget, 
          seating: lifeProfile === 'joint_family' ? '7 Seats' : '5 Seats', 
          usage: dailyReality.join(' + '), 
          terrain: (nonNegotiables.includes('High ground clearance') || dailyReality.includes('Off-road / adventure')) ? 'Rough' : 'Smooth', 
          driver: lifeProfile === 'new_driver' ? 'Beginner' : lifeProfile === 'senior_citizen' ? 'Senior' : 'Experienced', 
          city 
        }
      }
    })
  }

  const handleLockClick = () => {
    setIsAuthModalOpen(true)
  }

  const handleReset = () => {
    setCurrentStep(1)
    setBudgetSlider(12)
    setEmiComfort('₹8K-₹12K')
    setMonthlyMaintSpend('₹3K-₹6K')
    setLifeProfile('solo_commuter')
    setDailyReality(['Daily office commute (city)'])
    setNonNegotiables([])
    setKeepDuration('4-6 years')
    setFuelPref('No preference')
    setResaleImportance('Prefer good resale')
    setRecommendations([])
    setNoExactMatch(false)
    setRelaxedNonNegotiables(false)
    setSearched(false)
    setError('')
    try {
      sessionStorage.removeItem('dryvsquad_car_finder_state')
    } catch (e) {
      console.error(e)
    }
  }

  const handleSearch = async () => {
    if (!location) {
      setPendingSearch(true)
      ensureLocationForFeature()
      return
    }

    setLoading(true)
    setError('')
    setSearched(true)
    
    setTimeout(() => {
      window.scrollTo({
        top: window.innerHeight * 0.8,
        behavior: 'smooth'
      });
    }, 100);

    try {
      const payload = {
        budget: budgetSlider >= 80 ? "80L+" : `up to ${budgetSlider}L`,
        seating: lifeProfile === 'joint_family' ? '7 Seats' : '5 Seats',
        usage: dailyReality,
        terrain: (nonNegotiables.includes('High ground clearance') || dailyReality.includes('Off-road / adventure')) ? 'Rough' : 'Smooth',
        driver: lifeProfile === 'new_driver' ? 'Beginner' : lifeProfile === 'senior_citizen' ? 'Senior' : 'Experienced',
        city: city,
        state: (() => {
          if (!location?.stateCode) {
            console.warn("⚠️ [Location Warning] location.stateCode is falsy. Falling back to DL for pricing rules.");
          }
          return location?.stateCode || 'DL';
        })(),
        lifeProfile: lifeProfile,
        tenure: keepDuration,
        fuelPref: fuelPref,
        resaleImportance: resaleImportance,
        monthlyOpexBand: monthlyMaintSpend,
        nonNegotiables: nonNegotiables.map(chip => {
          if (chip === '6+ airbags (safety first)') return 'airbags_6';
          if (chip === 'Automatic transmission only') return 'automatic';
          if (chip === 'EV / electric') return 'ev';
          if (chip === '4WD / AWD') return 'awd_4wd';
          if (chip === 'High ground clearance') return 'high_clearance';
          if (chip === 'Low service cost') return 'low_service_cost';
          if (chip === 'Strong resale value') return 'resale_value';
          return chip;
        })
      };

      const result = await api.getAiCarFinderRecommendations(payload);
      
      if (result && result.success) {
        const rawRecs = result.recommendations || []
        setNoExactMatch(!!result.noExactMatch)
        setRelaxedNonNegotiables(!!result.relaxedNonNegotiables)
        
        const seenModels = new Set()
        const uniqueRecs = []
        for (const car of rawRecs) {
          const baseName = (car.displayName || `${car.brand} ${getBaseModelName(car.name, car.brand)}`).toLowerCase().trim()
          if (!seenModels.has(baseName)) {
            seenModels.add(baseName)
            uniqueRecs.push(car)
          }
        }
        
        setRecommendations(uniqueRecs)
        if (uniqueRecs.length > 0) {
          const firstCarName = uniqueRecs[0].displayName || `${uniqueRecs[0].brand} ${getBaseModelName(uniqueRecs[0].name, uniqueRecs[0].brand)}`
          setCheckoutData(prev => ({ 
            ...prev, 
            selectedCar: firstCarName
          }))
        }
      } else {
        setError('The advisory server returned an empty recommendation block. Please modify budget limits.')
      }
    } catch (err) {
      console.error(err)
      setError('Advisory recommendations failed to compile. Please check network connections.')
    } finally {
      setLoading(false)
    }
  }

  // Trigger search automatically once location is selected
  useEffect(() => {
    if (location && pendingSearch) {
      setPendingSearch(false)
      handleSearch()
    }
  }, [location, pendingSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 340, behavior: 'smooth' })
  }

  // --- PDF GENERATION WITH jspdf ---
  const generatePdfReport = () => {
    setIsGeneratingPdf(true)
    
    setTimeout(() => {
      try {
        const doc = new jsPDF()
        const carName = checkoutData.selectedCar || (recommendations[0] ? `${recommendations[0].brand} ${recommendations[0].name}` : 'Selected Car')
        
        // Colors & Theme Branding (Deep Slate Blue & Amber Gold)
        const primaryColor = '#000000' // brand black
        const accentColor = '#eab308'  // yellow-500
        
        // Page 1: Cover Page
        doc.setFillColor(15, 23, 42)
        doc.rect(0, 0, 210, 297, 'F')
        
        // Gold accent band
        doc.setFillColor(234, 179, 8)
        doc.rect(0, 140, 210, 15, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(28)
        doc.text('DRYVSQUAD PREMIUM REPORT', 20, 80)
        
        doc.setFontSize(16)
        doc.text('Personalized Vehicle Ownership & Financial Analysis', 20, 95)
        
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(220, 220, 220)
        doc.text(`Target Model: ${carName}`, 20, 115)
        doc.text(`Prepared For: ${checkoutData.name}`, 20, 123)
        doc.text(`Email: ${checkoutData.email}`, 20, 131)
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.text('© Vaahan International. All Rights Reserved.', 20, 270)
        
        // Page 2: Financial & EMI Analysis
        doc.addPage()
        doc.setTextColor(15, 23, 42)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        doc.text('Section 1: Financial & Loan Analysis', 20, 30)
        doc.setLineWidth(0.5)
        doc.setDrawColor(234, 179, 8)
        doc.line(20, 35, 190, 35)
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        doc.text(`Your selected target model: ${carName}`, 20, 50)
        
        // Loan Calculation
        const matchedCar = recommendations.find(r => 
          (r.displayName && r.displayName.toLowerCase().trim() === carName.toLowerCase().trim()) ||
          (`${r.brand} ${r.name}`.toLowerCase().trim() === carName.toLowerCase().trim())
        )
        const carPrice = matchedCar && matchedCar.minPrice ? matchedCar.minPrice : 800000
        const downpaymentVal = parseInt(checkoutData.downpayment) || 200000
        const loanAmount = Math.max(50000, carPrice - downpaymentVal)
        const rate = 8.75 // Interest rate
        const tenureYears = parseInt(checkoutData.tenure) || 5
        const n = tenureYears * 12
        const r = (rate / 12) / 100
        const emi = Math.round((loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
        
        doc.setFont('helvetica', 'bold')
        doc.text('Calculated Loan Parameter Breakdown:', 20, 65)
        doc.setFont('helvetica', 'normal')
        doc.text(`• Downpayment Paid: Rs. ${checkoutData.downpayment.toLocaleString('en-IN')}`, 20, 75)
        doc.text(`• Estimated Principal Loan: Rs. ${loanAmount.toLocaleString('en-IN')}`, 20, 83)
        doc.text(`• Interest Rate: ${rate}% per annum`, 20, 91)
        doc.text(`• Repayment Tenure: ${checkoutData.tenure}`, 20, 99)
        
        // Highlighting EMI
        doc.setFillColor(248, 250, 252)
        doc.rect(20, 110, 170, 30, 'F')
        doc.setDrawColor(226, 232, 240)
        doc.rect(20, 110, 170, 30, 'S')
        doc.setTextColor(220, 38, 38)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`Estimated Monthly EMI: Rs. ${emi.toLocaleString('en-IN')} / month`, 25, 128)
        
        // Bank Comparison Table
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Available Interest Rates Across Major Banks:', 20, 160)
        
        doc.setFontSize(10)
        doc.setFillColor(15, 23, 42)
        doc.rect(20, 170, 170, 8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.text('Bank Name', 25, 176)
        doc.text('Interest Rate', 90, 176)
        doc.text('Estimated EMI', 145, 176)
        
        doc.setTextColor(15, 23, 42)
        // Row 1
        doc.rect(20, 178, 170, 8, 'S')
        doc.text('State Bank of India (SBI)', 25, 184)
        doc.text('8.65% - 9.15%', 90, 184)
        doc.text(`Rs. ${Math.round(emi * 0.99).toLocaleString('en-IN')}`, 145, 184)
        // Row 2
        doc.rect(20, 186, 170, 8, 'S')
        doc.text('HDFC Bank', 25, 192)
        doc.text('8.75% - 9.25%', 90, 192)
        doc.text(`Rs. ${emi.toLocaleString('en-IN')}`, 145, 192)
        // Row 3
        doc.rect(20, 194, 170, 8, 'S')
        doc.text('ICICI Bank', 25, 200)
        doc.text('8.80% - 9.40%', 90, 200)
        doc.text(`Rs. ${Math.round(emi * 1.01).toLocaleString('en-IN')}`, 145, 200)
        
        // Page 3: Depreciation & Maintenance
        doc.addPage()
        doc.setTextColor(15, 23, 42)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        doc.text('Section 2: Maintenance & Resale Predictions', 20, 30)
        doc.setLineWidth(0.5)
        doc.setDrawColor(234, 179, 8)
        doc.line(20, 35, 190, 35)
        
        doc.setFontSize(12)
        doc.text('Projected Resale Value Retention Timeline:', 20, 50)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text('Below is the predicted market value depreciation curve based on your planned', 20, 58)
        doc.text(`ownership timeframe of ${checkoutData.ownershipYears} and standard brand benchmarks:`, 20, 64)
        
        // Depreciation list
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('• Year 1 (Excellent Condition):', 25, 80)
        doc.setFont('helvetica', 'normal')
        doc.text('Retains ~85% of initial value.', 85, 80)
        
        doc.setFont('helvetica', 'bold')
        doc.text('• Year 3 (Standard Upgrade Cycle):', 25, 90)
        doc.setFont('helvetica', 'normal')
        doc.text('Retains ~68% of initial value.', 85, 90)
        
        doc.setFont('helvetica', 'bold')
        doc.text('• Year 5 (Typical Resale Point):', 25, 100)
        doc.setFont('helvetica', 'normal')
        doc.text('Retains ~54% of initial value.', 85, 100)
        
        doc.setFont('helvetica', 'bold')
        doc.text('• Year 7 (Extended Maintenance):', 25, 110)
        doc.setFont('helvetica', 'normal')
        doc.text('Retains ~42% of initial value.', 85, 110)
        
        // Maintenance Table
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text('Estimated 5-Year Maintenance Service Schedule:', 20, 135)
        
        doc.setFontSize(10)
        doc.setFillColor(15, 23, 42)
        doc.rect(20, 145, 170, 8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.text('Service Interval', 25, 151)
        doc.text('Standard Replacements', 80, 151)
        doc.text('Average Cost', 150, 151)
        
        doc.setTextColor(15, 23, 42)
        // Row 1
        doc.rect(20, 153, 170, 8, 'S')
        doc.text('10,000 km (First Year)', 25, 159)
        doc.text('Engine Oil, Oil Filter, Inspection', 80, 159)
        doc.text('Rs. 3,500', 150, 159)
        // Row 2
        doc.rect(20, 161, 170, 8, 'S')
        doc.text('20,000 km (Second Year)', 25, 167)
        doc.text('Cabin Air Filter, Brake Fluids', 80, 167)
        doc.text('Rs. 4,800', 150, 167)
        // Row 3
        doc.rect(20, 169, 170, 8, 'S')
        doc.text('40,000 km (Fourth Year)', 25, 175)
        doc.text('Spark plugs, coolant flush, pad wear', 80, 175)
        doc.text('Rs. 8,200', 150, 175)
        
        // Page 4: Insurance Advisor & Sign-off
        doc.addPage()
        doc.setTextColor(15, 23, 42)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        doc.text('Section 3: Insurance Advisor Recommendations', 20, 30)
        doc.setLineWidth(0.5)
        doc.setDrawColor(234, 179, 8)
        doc.line(20, 35, 190, 35)
        
        doc.setFontSize(12)
        doc.text(`Policy Recommendation Type: ${checkoutData.insuranceType}`, 20, 50)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text('Given your profile, we highly recommend selecting a Zero Depreciation Rider', 20, 58)
        doc.text('alongside your comprehensive policy to avoid paying out-of-pocket for plastic parts.', 20, 64)
        
        doc.setFont('helvetica', 'bold')
        doc.text('Important Insurance Clauses to Include:', 20, 80)
        doc.setFont('helvetica', 'normal')
        doc.text('1. Zero Depreciation Add-on: Critical for new cars under 5 years.', 20, 90)
        doc.text('2. Return to Invoice (RTI): Protects full invoice value in case of total theft.', 20, 98)
        doc.text('3. Engine Protection: Ensures repairs from waterlogging are fully covered.', 20, 106)
        
        // Footer Signoff
        doc.setFillColor(248, 250, 252)
        doc.rect(20, 200, 170, 45, 'F')
        doc.setDrawColor(234, 179, 8)
        doc.rect(20, 200, 170, 45, 'S')
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text('Disclaimer & Notice:', 25, 212)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text('Estimates provided in this guide are dynamic calculations generated by DryvSquad AI.', 25, 222)
        doc.text('Actual market rates, bank interest values, and dealer quotes may differ slightly.', 25, 229)
        doc.text('Always consult with certified finance representatives before completing purchase signatures.', 25, 236)
        
        // Save
        const filename = `DryvSquad_Buying_Guide_${carName.replace(/\s+/g, '_')}.pdf`
        doc.save(filename)
        
        setPdfSuccess(true)
      } catch (err) {
        console.error(err)
        alert('An error occurred while generating the PDF guide.')
      } finally {
        setIsGeneratingPdf(false)
      }
    }, 1500)
  }

  // Format verdict strings replacing markdown double asterisks with bold HTML spans
  const formatVerdict = (text) => {
    if (!text) return ''
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className={`font-extrabold ${isDark ? 'text-slate-200 dark:text-white' : 'text-slate-900 font-bold'}`}>
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  // Format quick pick verdict strings by extracting bolded keywords and joining them with ' + '
  const formatQuickPickVerdict = (text) => {
    if (!text) return ''
    const matches = [...text.matchAll(/\*\*(.*?)\*\*/g)].map(m => m[1].trim())
    if (matches.length > 0) {
      const uniqueReasons = Array.from(new Set(matches))
      return uniqueReasons.map(r => {
        return r
          .replace(/\bmmmm\b/gi, 'mm')
          .replace(/turning radius of ([\d.]+)\s*mm/gi, 'turning radius of $1 m')
      }).join(' + ')
    }
    return text.replace(/\*\*/g, '')
  }

  return (
    <div className={`min-h-screen pt-24 pb-16 transition-colors duration-300 ${
      isDark ? 'bg-dark-950 text-white' : 'bg-[#FFFDFC] text-slate-900'
    }`}>
      <div className="container-custom max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-2xl font-bold text-yellow-500 uppercase tracking-wider">
            <Sparkles className="w-4.5 h-4.5" />
            Personalised Car Suggestions
          </div>
          <p className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            Enter your lifestyle preferences, passenger capacity, and driving scenarios to find real database matched cars.
          </p>
        </div>

        {/* Search Parameters Form Card */}
        <div className={`rounded-3xl border shadow-xl p-6 sm:p-8 backdrop-blur-md transition-all duration-300 ${
          isDark ? 'bg-dark-900/40 border-dark-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 sm:gap-6 max-w-lg mx-auto mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center">
                    <div 
                      onClick={() => {
                        if (s < currentStep) setCurrentStep(s);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        s < currentStep 
                          ? 'bg-yellow-500 text-slate-950 cursor-pointer hover:scale-105' 
                          : s === currentStep 
                            ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-500 font-bold cursor-default' 
                            : isDark ? 'bg-dark-800 text-slate-500' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s}
                    </div>
                    {s < 4 && (
                      <div className={`h-[2px] w-6 sm:w-10 transition-colors ${
                        s < currentStep ? 'bg-yellow-500' : isDark ? 'bg-dark-800' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              
            </div>
            <div className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)' }}>
              {currentStep === 1 && "Step 1: Money & Budget"}
              {currentStep === 2 && "Step 2: Your Life Profile"}
              {currentStep === 3 && "Step 3: Daily Reality & Non-negotiables"}
              {currentStep === 4 && "Step 4: Ownership Plan"}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* STEP 1: MONEY & BUDGET */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>What is your maximum budget?</h4>
                    <p className="text-xs text-slate-400">Drag the slider to set your absolute limit</p>
                  </div>
                  
                  <div className="max-w-md mx-auto space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold" style={{ color: isDark ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)' }}>
                        ₹3 Lakhs
                      </span>
                      <span className="text-2xl font-black text-yellow-500">
                        {budgetSlider >= 80 ? "₹80L+" : `₹${budgetSlider} Lakhs`}
                      </span>
                      <span className="text-xs font-bold" style={{ color: isDark ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)' }}>
                        ₹80L+
                      </span>
                    </div>
                    <input 
                      type="range"
                      min="3"
                      max="80"
                      value={budgetSlider}
                      onChange={(e) => setBudgetSlider(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                  </div>

                  <div className="border-t border-slate-800/40 my-6 pt-6 space-y-4">
                    <h5 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">What is your comfortable monthly EMI?</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
                      {["Under ₹8K/month", "₹8K-₹12K", "₹12K-₹18K", "Above ₹18K", "Paying full, no EMI"].map(option => (
                        <button
                          key={option}
                          onClick={() => setEmiComfort(option)}
                          className={`p-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                            emiComfort === option
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-md'
                              : isDark ? 'border-dark-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/40 my-6 pt-6 space-y-4">
                    <h5 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">Expected monthly fuel + maintenance spend?</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                      {["Under ₹3K/month", "₹3K-₹6K", "₹6K-₹10K", "Above ₹10K"].map(option => (
                        <button
                          key={option}
                          onClick={() => setMonthlyMaintSpend(option)}
                          className={`p-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                            monthlyMaintSpend === option
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-md'
                              : isDark ? 'border-dark-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: YOUR LIFE PROFILE */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Which profile describes you best?</h4>
                    <p className="text-xs text-slate-400">Select one that matches your lifestyle</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto pt-4">
                    {(() => {
                      const tier = classifyCity(city);
                      const rawProfiles = [
                        {
                          id: 'solo_commuter',
                          title: 'Solo office commuter',
                          getSubtitle: (t) => t === 'Tier 1' 
                            ? 'Daily 20-60km, mostly alone, weekday driver' 
                            : 'Daily commute to office or business, mostly alone',
                          icon: '💼'
                        },
                        {
                          id: 'young_couple',
                          title: 'Young couple / DINK',
                          getSubtitle: () => 'Both working, weekend trips, no kids yet',
                          icon: '👫'
                        },
                        {
                          id: 'small_family',
                          title: 'Small family (1-2 kids)',
                          getSubtitle: () => 'School runs, grocery, occasional highway',
                          icon: '👨‍👩‍👧'
                        },
                        {
                          id: 'joint_family',
                          title: 'Joint family / large group',
                          getSubtitle: () => '5-7 people regularly, need 3 rows',
                          icon: '👨‍👩‍👧‍👦'
                        },
                        {
                          id: 'adventure',
                          title: 'Adventure / off-road',
                          getSubtitle: () => 'Road trips, camping, rough terrain, trekking',
                          icon: '🏕️'
                        },
                        {
                          id: 'senior_citizen',
                          title: 'Senior citizen / ease of use',
                          getSubtitle: () => 'Easy entry/exit, light steering, simple controls',
                          icon: '🧓'
                        },
                        {
                          id: 'new_driver',
                          title: 'New / learner driver',
                          getSubtitle: () => 'Just got licence, need something easy and forgiving',
                          icon: '🎓'
                        },
                        {
                          id: 'commercial',
                          title: 'Commercial / cab / delivery',
                          getSubtitle: () => 'High daily kms, durability matters most',
                          icon: '📦'
                        }
                      ];
                      
                      let profiles = [...rawProfiles];
                      if (tier !== 'Tier 1') {
                        const adv = profiles.splice(4, 1)[0];
                        const comm = profiles.splice(6, 1)[0];
                        profiles.splice(2, 0, adv, comm);
                      }
                      
                      return profiles.map(profile => (
                        <div
                          key={profile.id}
                          onClick={() => setLifeProfile(profile.id)}
                          className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col items-start gap-3 ${
                            lifeProfile === profile.id
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-md'
                              : isDark ? 'border-dark-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                          }`}
                        >
                          <span className="text-3xl">{profile.icon}</span>
                          <div>
                            <h5 className="font-bold text-sm" style={{ color: isDark ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)' }}>
                              {profile.title}
                            </h5>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{profile.getSubtitle(tier)}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* STEP 3: DAILY REALITY & NON-NEGOTIABLES */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  {/* Daily Reality */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>What is your Daily Reality / usage?</h4>
                      <p className="text-xs text-slate-400">Select up to 2 options that reflect your primary drives ({dailyReality.length}/2)</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
                      {[
                        "Daily office commute (city)",
                        "Long highway commute (100km+/day)",
                        "School runs + errands",
                        "Weekend family outings",
                        "Intercity highway travel",
                        "Off-road / adventure",
                        "Commercial / cab / high daily kms",
                        "Occasional use / second car"
                      ].map(option => {
                        const isSelected = dailyReality.includes(option);
                        const isMaxReached = dailyReality.length >= 2;
                        return (
                          <button
                            key={option}
                            onClick={() => {
                              if (isSelected) {
                                setDailyReality(dailyReality.filter(x => x !== option));
                              } else {
                                if (isMaxReached) {
                                  setDailyReality([...dailyReality.slice(1), option]);
                                } else {
                                  setDailyReality([...dailyReality, option]);
                                }
                              }
                            }}
                            className={`p-3.5 rounded-xl border text-center transition-all text-xs font-semibold ${
                              isSelected
                                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-md'
                                : isDark ? 'border-dark-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Non-negotiables */}
                  <div className="space-y-4 border-t border-slate-800/40 pt-6">
                    <div className="text-center">
                      <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Your Must-Haves (Non-negotiables)</h4>
                      <p className="text-xs text-slate-400">Select all features that you cannot compromise on</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-5xl mx-auto pt-2">
                      {(() => {
                        const tier = classifyCity(city);
                        const rawNonNegs = [
                          { id: 'automatic', label: 'Automatic transmission only' },
                          { id: 'ground_clearance', label: 'High ground clearance' },
                          { id: 'airbags', label: '6+ airbags (safety first)' },
                          { id: 'cng', label: 'CNG / low fuel cost' },
                          { id: 'ev', label: 'EV / electric' },
                          { id: 'easy_parking', label: 'Easy parking in tight lanes' },
                          { id: 'big_boot', label: 'Big boot / luggage space' },
                          { id: 'resale', label: 'Strong resale value' },
                          { id: 'low_service', label: 'Low service cost' },
                          { id: 'awd', label: '4WD / AWD' }
                        ];
                        
                        let list = [...rawNonNegs];
                        if (tier !== 'Tier 1') {
                          const gc = list.splice(1, 1)[0];
                          list.unshift(gc);
                        }
                        
                        return list.map(item => {
                          const isSelected = nonNegotiables.includes(item.label);
                          const isDisabled = item.id === 'ev' && (tier === 'Rural' || tier === 'Tier 3');
                          
                          return (
                            <div key={item.id} className="relative group">
                              <button
                                disabled={isDisabled}
                                onClick={() => {
                                  if (isSelected) {
                                    setNonNegotiables(nonNegotiables.filter(x => x !== item.label));
                                  } else {
                                    setNonNegotiables([...nonNegotiables, item.label]);
                                  }
                                }}
                                className={`w-full p-3.5 rounded-xl border text-center transition-all text-xs font-semibold flex flex-col justify-between items-center min-h-[70px] ${
                                  isDisabled
                                    ? 'border-dark-900 bg-slate-950 opacity-40 cursor-not-allowed text-slate-600'
                                    : isSelected
                                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-md'
                                      : isDark ? 'border-dark-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                                }`}
                              >
                                <span>{item.label}</span>
                                {isDisabled && (
                                  <span className="text-[9px] text-red-500 mt-1 font-bold">Limited charging infra</span>
                                )}
                              </button>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: OWNERSHIP PLAN */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Tenure */}
                  <div className="space-y-4">
                    <h5 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">How long do you plan to keep this car?</h5>
                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                      {["2-3 years", "4-6 years", "7+ years"].map(option => (
                        <button
                          key={option}
                          onClick={() => setKeepDuration(option)}
                          className={`p-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                            keepDuration === option
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-md'
                              : isDark ? 'border-dark-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fuel Preference */}
                  <div className="space-y-4 border-t border-slate-800/40 pt-6">
                    <h5 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">Preferred fuel type?</h5>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-3xl mx-auto">
                      {["Petrol", "Diesel", "CNG", "Hybrid", "Electric (EV)", "No preference"].map(option => (
                        <button
                          key={option}
                          onClick={() => setFuelPref(option)}
                          className={`p-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                            fuelPref === option
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-md'
                              : isDark ? 'border-dark-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resale Importance */}
                  <div className="space-y-4 border-t border-slate-800/40 pt-6">
                    <h5 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">How important is resale value to you?</h5>
                    <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
                      {["Critical — I will sell it", "Prefer good resale", "Don't care — keeping long"].map(option => (
                        <button
                          key={option}
                          onClick={() => setResaleImportance(option)}
                          className={`p-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                            resaleImportance === option
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-md'
                              : isDark ? 'border-dark-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Actions */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-800/40 pt-6 max-w-3xl mx-auto">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReset()}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] border ${
                      isDark 
                        ? 'bg-dark-950 border-dark-800 text-slate-400 hover:text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Reset Form
                  </button>
                </div>

                <div>
                  {currentStep < 4 ? (
                    <button
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all font-sans"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSearch()}
                      disabled={loading}
                      className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 font-sans"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Searching Matches...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Find My Car</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Main Content Layout */}
        <div className="space-y-8">
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading-spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center space-y-4"
              >
                <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mx-auto" />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Evaluating scoring matches with AI advisor...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error-box"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-center rounded-2xl"
              >
                {error}
              </motion.div>
            ) : searched && recommendations.length > 0 ? (
              <motion.div
                key="results-block"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-8"
              >
                {relaxedNonNegotiables ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>⚠️ No cars fully match all your must-haves — here are the closest options:</span>
                  </div>
                ) : noExactMatch ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>⚠️ We couldn't find an exact match within your budget. Showing the closest alternatives:</span>
                  </div>
                ) : null}
                <div className="border-b pb-2 border-slate-200 dark:border-slate-800">
                  <h2 className={`text-sm sm:text-base font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    I have found some great options for you. Here's a quick look at the best ones.
                  </h2>
                </div>

                {/* Carousel Container */}
                <div className="relative w-full">
                  <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-6 pb-6 scroll-smooth no-scrollbar select-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {recommendations.map((car, idx) => (
                      <div 
                        key={idx} 
                        className={`w-[290px] sm:w-[320px] shrink-0 rounded-3xl border overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between ${
                          isDark ? 'bg-dark-900 border-dark-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div>
                          {/* Image */}
                          <div className="h-56 bg-slate-100/80 dark:bg-dark-950 relative overflow-hidden flex items-center justify-center p-0">
                            <img 
                              src={car.image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'} 
                              alt={car.displayName || car.name} 
                              className="w-full h-full object-contain"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800' }}
                            />
                          </div>

                          {/* Info */}
                          <div className="p-5 pb-6 space-y-4">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{car.brand}</span>
                              <h3 className="text-base font-bold text-slate-800 dark:text-white mt-0.5">{car.displayName || car.name}</h3>
                              <div className="mt-1 flex items-baseline gap-1 text-xs">
                                <span className="text-yellow-500 font-bold">{car.priceRange}</span>
                                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">(Est. On-Road Price)</span>
                              </div>
                            </div>
                            
                            {/* Know More redirects to Variants page */}
                            <button
                              onClick={() => navigateToVariants(car)}
                              className="w-full py-2 bg-yellow-500 text-black hover:text-slate-950 border border-yellow-500/20 hover:border-transparent text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Know More</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {recommendations.length > 1 && (
                    <button 
                      onClick={scrollRight}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 flex items-center justify-center shadow-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-800 dark:text-white transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Quick Pick */}
                <div className="space-y-5 pt-8 border-t border-slate-150 dark:border-dark-800">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Quick pick:
                    </h3>
                  </div>

                  <ul className="space-y-4 text-xs sm:text-sm pl-1.5">
                    {recommendations.map((car, idx) => (
                      <li key={idx} className="flex items-start gap-3.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0 mt-2" />
                        <div className="text-slate-700 dark:text-gray-300">
                          <button
                            onClick={() => navigateToVariants(car)}
                            className="font-bold text-yellow-500 hover:underline cursor-pointer transition-all mr-1"
                          >
                            {car.displayName || (car.brand + " " + car.name)}
                          </button>
                          <span className={`${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            - {formatQuickPickVerdict(car.verdict)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Premium Banner at the bottom of results */}
                <div className="flex flex-col md:flex-row items-center justify-between">
                  {!token ? (
                    <button
                      onClick={handleLockClick}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all hover:scale-[1.02] shrink-0 flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Lock className="w-4 h-4 text-yellow-500" />
                      <span>Login to Download PDF Guide</span>
                    </button>
                  ) : premiumUnlocked ? (
                    <button
                      onClick={() => setShowPremiumModal(true)}
                      className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all hover:scale-[1.02] shrink-0 flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download Premium PDF Guide</span>
                    </button>
                  ) : (
                    <PaymentButton
                      resourceType="PDF"
                      resourceId="pdf-guide"
                      resourceName="Premium PDF Guide"
                      amount={99}
                      label="Pay 99 to unlock PDF guide"
                      className="px-6 py-3 bg-[#C69327] hover:bg-[#A87B1F] text-white font-bold rounded-xl text-xs sm:text-sm transition-all hover:scale-[1.02] shrink-0 flex items-center gap-2 cursor-pointer shadow-md font-sans"
                      onSuccess={(payment) => {
                        localStorage.setItem('dryvsquad_pdf_unlocked', 'true');
                        setPremiumUnlocked(true);
                        setShowPremiumModal(true);
                      }}
                    />
                  )}
                </div>

              </motion.div>
            ) : searched ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center text-slate-400"
              >
                No cars matching the preferences were found in the database. Please try adjusting your parameters and searching again.
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

      </div>

      {/* --- ₹99 PREMIUM CHECKOUT & PDF DELIVERY MODAL --- */}
      <AnimatePresence>
        {showPremiumModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPremiumModal(false)
                setPdfSuccess(false)
              }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            
            {/* Card Modal */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-black border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 relative z-10 shadow-2xl text-slate-100 flex flex-col justify-between overflow-y-auto max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setShowPremiumModal(false)
                  setPdfSuccess(false)
                }}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!pdfSuccess ? (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                      Premium Report Checkout
                    </span>
                    <h3 className="text-xl font-bold text-white">Download Premium Buying Guide PDF</h3>
                    <p className="text-xs text-slate-400">
                      Configure ownership parameters to calculate personalized loan EMIs, resale depreciation, and maintenance predictions.
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    {/* Target Model Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Target Car Model</label>
                      <input 
                        type="text" 
                        value={checkoutData.selectedCar} 
                        onChange={(e) => setCheckoutData({ ...checkoutData, selectedCar: e.target.value })}
                        placeholder="e.g. BMW X1" 
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5 col-span-2 sm:col-span-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={checkoutData.name} 
                          onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma" 
                          className="w-full bg-slate-950 border border-slate-855 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                      
                      {/* Phone */}
                      <div className="space-y-1.5 col-span-2 sm:col-span-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          value={checkoutData.phone} 
                          onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                          placeholder="e.g. +91 98765*****" 
                          className="w-full bg-slate-950 border border-slate-855 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={checkoutData.email} 
                        onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                        placeholder="e.g. name@example.com" 
                        className="w-full bg-slate-950 border border-slate-855 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>

                    {/* Downpayment slider */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <span>Financing Downpayment</span>
                        <span className="text-yellow-500">₹{checkoutData.downpayment.toLocaleString('en-IN')}</span>
                      </div>
                      <input 
                        type="range" 
                        min="50000" 
                        max="1000000" 
                        step="25000"
                        value={checkoutData.downpayment} 
                        onChange={(e) => setCheckoutData({ ...checkoutData, downpayment: parseInt(e.target.value) })}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Loan Tenure */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Loan Tenure</label>
                        <select 
                          value={checkoutData.tenure}
                          onChange={(e) => setCheckoutData({ ...checkoutData, tenure: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-855 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        >
                          <option value="3 Years">3 Years (Short Term)</option>
                          <option value="5 Years">5 Years (Standard)</option>
                          <option value="7 Years">7 Years (Extended)</option>
                        </select>
                      </div>

                      {/* Annual run */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Annual Run</label>
                        <select 
                          value={checkoutData.annualRun}
                          onChange={(e) => setCheckoutData({ ...checkoutData, annualRun: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-855 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        >
                          <option value="< 10,000 km">Under 10,000 km</option>
                          <option value="10,000 - 20,000 km">10,000 - 20,000 km</option>
                          <option value="20,000+ km">Above 20,000 km</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Planned Ownership */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Ownership Length</label>
                        <select 
                          value={checkoutData.ownershipYears}
                          onChange={(e) => setCheckoutData({ ...checkoutData, ownershipYears: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-855 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        >
                          <option value="3 Years">3 Years (Resale value focus)</option>
                          <option value="5 Years">5 Years (Standard Cycle)</option>
                          <option value="7+ Years">7+ Years (Longevity focus)</option>
                        </select>
                      </div>

                      {/* Preferred Insurance */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Insurance Choice</label>
                        <select 
                          value={checkoutData.insuranceType}
                          onChange={(e) => setCheckoutData({ ...checkoutData, insuranceType: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-855 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        >
                          <option value="Comprehensive">Comprehensive Cover</option>
                          <option value="Zero Depreciation">Zero Depreciation Add-on</option>
                          <option value="Third Party">Third Party Only</option>
                        </select>
                      </div>
                    </div>
                  </form>

                  <button
                    onClick={generatePdfReport}
                    disabled={isGeneratingPdf || !checkoutData.name || !checkoutData.email || !checkoutData.phone}
                    className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-extrabold rounded-2xl text-sm transition-all shadow-xl hover:shadow-yellow-500/10 flex items-center justify-center gap-2"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Calculating Estimates & Assembling PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Download Premium PDF Guide</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 space-y-6 animate-scale-up">
                  <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Guide Generated Successfully</h2>
                  <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Personalized buying report for <strong className="text-yellow-500">{checkoutData.selectedCar}</strong> has been downloaded to your device.
                  </p>
                  <button
                    onClick={() => {
                      setShowPremiumModal(false)
                      setPdfSuccess(false)
                    }}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false)
          setToken(localStorage.getItem('token'))
          if (localStorage.getItem('dryvsquad_pdf_unlocked') === 'true') {
            setPremiumUnlocked(true)
          }
        }}
      />

    </div>
  )
}

export default AiCarFinder
