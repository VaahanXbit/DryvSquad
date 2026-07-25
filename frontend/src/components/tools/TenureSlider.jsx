// src/components/tools/TenureSlider.jsx
/*
================================================================================
File Name : TenureSlider.jsx
Description : Loan Tenure (months) input — compact slider + number input.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useTheme } from '../../context/ThemeContext'

const MIN = 6
const MAX = 84
const STEP = 1

const TenureSlider = ({ value, onChange }) => {
  const { isDark } = useTheme()

  const handleNumberChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const num = raw === '' ? 0 : Number(raw)
    onChange(Math.min(MAX, num))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor="tenureMonths" className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Loan Tenure
        </label>
        <div className="relative">
          <input
            id="tenureMonths"
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleNumberChange}
            aria-label="Loan tenure in months"
            className={`w-20 pl-2.5 pr-9 py-1.5 rounded-md text-sm font-semibold text-right focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors ${
              isDark ? 'bg-dark-900 border border-dark-700 text-white' : 'bg-white border border-gray-300 text-gray-900'
            }`}
          />
          <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            mo
          </span>
        </div>
      </div>

      <input
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Loan tenure slider"
        className="w-full accent-yellow-500 cursor-pointer h-1.5"
      />

      <div className={`flex items-center justify-between mt-0.5 text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
        <span>{MIN} mo</span>
        <span>{MAX} mo</span>
      </div>
    </div>
  )
}

export default TenureSlider