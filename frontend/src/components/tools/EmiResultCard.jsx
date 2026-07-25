// src/components/tools/EmiResultCard.jsx
/*
================================================================================
File Name : EmiResultCard.jsx
Description : Displays the live-calculated EMI result — Monthly EMI (the
              headline figure), Total Interest, and Total Payment — with
              Indian-locale currency formatting.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useTheme } from '../../context/ThemeContext'
import { formatINR } from '../../utils/emiCalculator'

const EmiResultCard = ({ monthlyEmi, totalInterest, totalAmount }) => {
  const { isDark } = useTheme()

  return (
    <div
      className={`rounded-2xl p-6 sm:p-7 border ${
        isDark
          ? 'bg-gradient-to-br from-dark-900 to-black border-dark-700'
          : 'bg-gradient-to-br from-yellow-50 to-white border-yellow-200'
      }`}
    >
      {/* Headline: Monthly EMI */}
      <div className="text-center pb-6 mb-6 border-b border-dashed border-yellow-500/30">
        <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Monthly EMI
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold text-yellow-500">
          {formatINR(monthlyEmi)}
          <span className={`text-base font-semibold ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            / month
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Total Interest
          </div>
          <div className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatINR(totalInterest)}
          </div>
        </div>
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Total Payment
          </div>
          <div className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatINR(totalAmount)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmiResultCard
