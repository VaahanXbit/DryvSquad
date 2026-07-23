// src/components/tools/LoanQuoteCTA.jsx
/*
================================================================================
File Name : LoanQuoteCTA.jsx
Description : The single CTA on this page. A plain, compact finance-style
              card — not a promotional banner: one line of copy, one button.
              Routes to the existing Loan Lead Form at /lead-loan
              (<LeadFormPage type="auto-loan" />) — no new form.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

const LoanQuoteCTA = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const handleClick = () => {
    navigate('/lead-loan', { state: { fromArticle: '/auto-loan-emi-calculator' } })
  }

  return (
    <div className={`rounded-xl border p-4 flex items-center justify-between gap-3 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
      <div>
        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Get Auto Loan Quotes
        </h3>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          Compare rates from our lending partners
        </p>
      </div>
      <button
        onClick={handleClick}
        className="shrink-0 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-semibold rounded-lg text-sm transition-colors"
      >
        Get Quotes
      </button>
    </div>
  )
}

export default LoanQuoteCTA