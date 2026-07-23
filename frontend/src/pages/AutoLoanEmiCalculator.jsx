// src/pages/AutoLoanEmiCalculator.jsx
/*
================================================================================
File Name : AutoLoanEmiCalculator.jsx
Description : Auto Loan EMI Calculator page (/auto-loan-emi-calculator).
              UI-only redesign toward a dense, professional finance-tool
              look (CarDekho/ZigWheels-style density) — functionality,
              EMI math, routing, and the backend endpoint are unchanged.

              Sections, in order: minimal hero -> two-column calculator
              (inputs + EMI summary, above the fold) -> Loan Quote CTA ->
              FAQ -> Related Tools. No other sections.

              EMI math is still client-side via utils/emiCalculator.js
              (mirrors backend/src/tools/loanCalculator/calculator.js), no
              Calculate button, updates live. Backend endpoint
              (POST /api/tools/loan/emi) is untouched.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { calculateEmi, roundEmiResult } from '../utils/emiCalculator'
import LoanAmountSlider from '../components/tools/LoanAmountSlider'
import InterestRateSlider from '../components/tools/InterestRateSlider'
import TenureSlider from '../components/tools/TenureSlider'
import EmiResultCard from '../components/tools/EmiResultCard'
import LoanQuoteCTA from '../components/tools/LoanQuoteCTA'

const PAGE_TITLE = 'Auto Loan EMI Calculator | Vaahan'
const PAGE_DESCRIPTION =
  'Calculate your monthly car loan EMI instantly. Estimate monthly EMI, total interest and total repayment before applying for your next car loan.'

// Sets document title + meta description for this route. No react-helmet
// dependency exists in the codebase, so this mirrors the lightweight
// manual approach rather than adding a new package for one page.
const usePageSeo = (title, description) => {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    let meta = document.querySelector('meta[name="description"]')
    const createdMeta = !meta
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    const previousDescription = meta.getAttribute('content')
    meta.setAttribute('content', description)

    return () => {
      document.title = previousTitle
      if (createdMeta) {
        meta.remove()
      } else if (previousDescription !== null) {
        meta.setAttribute('content', previousDescription)
      }
    }
  }, [title, description])
}

const FAQS = [
  {
    q: 'How is car loan EMI calculated?',
    a: 'EMI is calculated using the reducing-balance formula: EMI = P × R × (1+R)^N / ((1+R)^N − 1), where P is the loan amount, R is the monthly interest rate (annual rate ÷ 12 ÷ 100), and N is the tenure in months.',
  },
  {
    q: 'Does a higher down payment reduce my EMI?',
    a: 'Yes. A higher down payment lowers your loan amount, which reduces both your monthly EMI and the total interest paid over the tenure.',
  },
  {
    q: 'What loan tenure should I choose?',
    a: 'A shorter tenure means a higher EMI but lower total interest. A longer tenure lowers your EMI but increases total interest paid.',
  },
  {
    q: 'Is the EMI shown here exactly what my bank will offer?',
    a: 'This is an estimate. Your actual EMI may vary by lender based on processing fees, credit profile, and final approved rate.',
  },
]

const RELATED_TOOLS = [
  { name: 'Auto Loan EMI Calculator', href: '/auto-loan-emi-calculator', active: true },
  { name: 'Mileage Calculator', href: null },
  { name: 'EV Range Calculator', href: null },
  { name: 'Running Cost Calculator', href: null },
]

const AutoLoanEmiCalculator = () => {
  const { isDark } = useTheme()
  usePageSeo(PAGE_TITLE, PAGE_DESCRIPTION)

  const [loanAmount, setLoanAmount] = useState(1200000)
  const [interestRate, setInterestRate] = useState(8.5)
  const [tenureMonths, setTenureMonths] = useState(60)
  const [openFaq, setOpenFaq] = useState(0)

  // Recomputed on every render whenever an input changes — no Calculate
  // button, no API round trip, purely client-side for instant UX.
  const result = useMemo(
    () => roundEmiResult(calculateEmi({ loanAmount, interestRate, tenureMonths })),
    [loanAmount, interestRate, tenureMonths]
  )

  return (
    <div className={`min-h-screen transition-colors duration-150 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      {/* ==================== Minimal header ==================== */}
      <div className={`pt-20 sm:pt-24 pb-3 px-4 sm:px-6 lg:px-8 border-b ${isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-100'}`}>
        <div className="max-w-5xl mx-auto">
          <nav className={`text-[11px] mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} aria-label="Breadcrumb">
            <Link to="/" className="hover:text-yellow-500 transition-colors">Home</Link>
            <span className="mx-1">/</span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Auto Loan EMI Calculator</span>
          </nav>
          <h1 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Auto Loan EMI Calculator
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Calculate your monthly car loan EMI instantly.
          </p>
        </div>
      </div>

      {/* ==================== Calculator — two-column, above the fold ==================== */}
      <section className="px-4 sm:px-6 lg:px-8 pt-5 pb-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Inputs */}
          <div className="lg:col-span-3">
            <div className={`rounded-xl border p-3 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
              <div className="space-y-2">
                <LoanAmountSlider value={loanAmount} onChange={setLoanAmount} />
                <InterestRateSlider value={interestRate} onChange={setInterestRate} />
                <TenureSlider value={tenureMonths} onChange={setTenureMonths} />
              </div>
            </div>
          </div>

          {/* Results sidebar */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-3">
              <EmiResultCard
                loanAmount={loanAmount}
                monthlyEmi={result.monthlyEmi}
                totalInterest={result.totalInterest}
                totalAmount={result.totalAmount}
              />
              <LoanQuoteCTA />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      {/* Uses the same max-w-5xl / 5-col grid as the calculator above, and
          sits in the lg:col-span-3 slot, so its left edge and width line up
          exactly with the loan-inputs card rather than being independently
          centered in a narrower container. */}
      <section className={`px-4 sm:px-6 lg:px-8 py-6 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <h2 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Frequently asked questions
            </h2>
            <div className={`rounded-xl border divide-y ${isDark ? 'bg-dark-800 border-dark-700 divide-dark-700' : 'bg-white border-gray-200 divide-gray-100'}`}>
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div key={item.q}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-3 text-left px-4 py-3"
                    >
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-yellow-500' : (isDark ? 'text-gray-500' : 'text-gray-400')}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3">
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Related Tools ==================== */}
      <section className={`px-4 sm:px-6 lg:px-8 py-6 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            More tools
          </h2>
          <div className="flex flex-wrap gap-2">
            {RELATED_TOOLS.map(({ name, href, active }) => {
              const className = `text-xs font-medium px-3 py-1.5 rounded-lg border ${
                active
                  ? 'border-yellow-500/40 text-yellow-500 bg-yellow-500/5'
                  : isDark
                    ? 'border-dark-700 text-gray-500'
                    : 'border-gray-200 text-gray-400'
              }`
              return href ? (
                <Link key={name} to={href} className={className}>{name}</Link>
              ) : (
                <span key={name} className={`${className} cursor-not-allowed`}>{name} · Soon</span>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AutoLoanEmiCalculator