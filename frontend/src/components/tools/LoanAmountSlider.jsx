// src/components/tools/LoanAmountSlider.jsx
/*
================================================================================
File Name : LoanAmountSlider.jsx
Description : Loan Amount input — compact slider + number input, matched to
              finance-site density (tight label/value row, minimal vertical
              gap). Same value/onChange contract as before.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useTheme } from '../../context/ThemeContext'
import { formatINR } from '../../utils/emiCalculator'

const MIN = 50000
const MAX = 10000000
const STEP = 10000

const LoanAmountSlider = ({ value, onChange }) => {
  const { isDark } = useTheme()

  const handleNumberChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const num = raw === '' ? 0 : Number(raw)
    onChange(Math.min(MAX, num))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor="loanAmount" className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Loan Amount
        </label>
        <div className="relative">
          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            ₹
          </span>
          <input
            id="loanAmount"
            type="text"
            inputMode="numeric"
            value={value.toLocaleString('en-IN')}
            onChange={handleNumberChange}
            aria-label="Loan amount in rupees"
            className={`w-32 pl-6 pr-2.5 py-1.5 rounded-md text-sm font-semibold text-right focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors ${
              isDark ? 'bg-dark-900 border border-dark-700 text-white' : 'bg-white border border-gray-300 text-gray-900'
            }`}
          />
        </div>
      </div>

      <input
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Loan amount slider"
        className="w-full accent-yellow-500 cursor-pointer h-1.5"
      />

      <div className={`flex items-center justify-between mt-0.5 text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
        <span>{formatINR(MIN)}</span>
        <span>{formatINR(MAX)}</span>
      </div>
    </div>
  )
}

export default LoanAmountSlider