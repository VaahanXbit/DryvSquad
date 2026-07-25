// src/components/tools/InterestRateSlider.jsx
/*
================================================================================
File Name : InterestRateSlider.jsx
Description : Interest Rate (%) input — compact slider + number input.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useTheme } from '../../context/ThemeContext'

const MIN = 1
const MAX = 20
const STEP = 0.1

const InterestRateSlider = ({ value, onChange }) => {
  const { isDark } = useTheme()

  const handleNumberChange = (e) => {
    const raw = e.target.value
    if (raw === '') return onChange(0)
    const num = Number(raw)
    if (Number.isNaN(num)) return
    onChange(Math.min(MAX, Math.max(0, num)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor="interestRate" className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Interest Rate
        </label>
        <div className="relative">
          <input
            id="interestRate"
            type="number"
            step={STEP}
            min={0}
            value={value}
            onChange={handleNumberChange}
            aria-label="Annual interest rate percentage"
            className={`w-20 pl-2.5 pr-6 py-1.5 rounded-md text-sm font-semibold text-right focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors ${
              isDark ? 'bg-dark-900 border border-dark-700 text-white' : 'bg-white border border-gray-300 text-gray-900'
            }`}
          />
          <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            %
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
        aria-label="Interest rate slider"
        className="w-full accent-yellow-500 cursor-pointer h-1.5"
      />

      <div className={`flex items-center justify-between mt-0.5 text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
        <span>{MIN}%</span>
        <span>{MAX}%</span>
      </div>
    </div>
  )
}

export default InterestRateSlider