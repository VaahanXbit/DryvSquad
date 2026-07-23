// src/components/tools/EmiResultCard.jsx
/*
================================================================================
File Name : EmiResultCard.jsx
Description : EMI Summary card. Simplified to only what a finance tool
              needs: Monthly EMI (the one highlighted value), then Principal,
              Interest, and Total Payment as plain line items. No breakdown
              bar, no gradients, no oversized numbers — just a clean,
              dense summary.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useTheme } from '../../context/ThemeContext'
import { formatINR } from '../../utils/emiCalculator'

const EmiResultCard = ({ loanAmount, monthlyEmi, totalInterest, totalAmount }) => {
  const { isDark } = useTheme()

  return (
    <div className={`rounded-xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
      {/* EMI — the one highlighted value */}
      <div className={`px-4 py-3.5 border-b ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
        <div className={`text-[11px] font-semibold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          Monthly EMI
        </div>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className={`text-2xl font-bold text-yellow-500`}>{formatINR(monthlyEmi)}</span>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/ month</span>
        </div>
      </div>

      {/* Plain line items */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Principal Amount</span>
          <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{formatINR(loanAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Interest Amount</span>
          <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{formatINR(totalInterest)}</span>
        </div>
        <div className={`flex items-center justify-between text-sm pt-2 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Total Payment</span>
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatINR(totalAmount)}</span>
        </div>
      </div>
    </div>
  )
}

export default EmiResultCard