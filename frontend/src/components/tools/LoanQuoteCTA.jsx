// src/components/tools/LoanQuoteCTA.jsx
/*
================================================================================
File Name : LoanQuoteCTA.jsx
Description : Prominent "Get Auto Loan Quotes" CTA shown below the EMI
              result. Deliberately does NOT render a new form — it routes to
              the existing Loan Lead Form at /lead-loan
              (<LeadFormPage type="auto-loan" />, registered in App.jsx),
              the same form used elsewhere in the app. `fromArticle` state
              is passed so the lead form's "Back" link returns the user to
              this calculator instead of its default /ai-mode fallback.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

const LoanQuoteCTA = () => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/lead-loan', { state: { fromArticle: '/auto-loan-emi-calculator' } })
  }

  return (
    <button
      onClick={handleClick}
      className="group w-full flex items-center justify-center gap-2 py-4 px-6 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold rounded-2xl shadow-xl hover:shadow-yellow-500/20 transition-all text-sm sm:text-base"
    >
      <Sparkles className="w-4 h-4" />
      <span>Get Auto Loan Quotes</span>
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </button>
  )
}

export default LoanQuoteCTA
