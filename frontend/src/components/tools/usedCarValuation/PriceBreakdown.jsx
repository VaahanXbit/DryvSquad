// src/components/tools/usedCarValuation/PriceBreakdown.jsx
/*
================================================================================
File Name : PriceBreakdown.jsx
Description : Row renderer for the "Why This Price?" drawer ONLY — per
              the product review, this is no longer shown permanently on
              the main result screen. Renders the backend's `drawerRows`
              array automatically: each row is already
              { label, impact, reason, finalContribution } — this
              component never computes anything, only displays.
              
              Updated with better spacing and clearer visual hierarchy.
================================================================================
*/

import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { formatRupeesShort } from '../../../constants/usedCarValuation';

const PriceBreakdown = ({ items }) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-1 pb-2 text-xs font-semibold text-theme-tertiary border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <span>Reason</span>
        <span className="text-right">Impact</span>
        <span className="text-right">Running Total</span>
      </div>
      
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const isNegative = item.impact < 0;
        const isPositive = item.impact > 0 && !isFirst;

        return (
          <div
            key={`${item.label}-${index}`}
            className={`grid grid-cols-[1fr_auto_auto] gap-4 items-center px-1 py-3 ${
              isLast ? 'border-t mt-2 pt-3' : ''
            }`}
            style={isLast ? { borderColor: 'var(--border-primary)' } : undefined}
          >
            <div className="min-w-0">
              <p className={`text-sm ${isLast ? 'font-bold text-theme-primary' : 'font-medium text-theme-primary'}`}>
                {item.label}
              </p>
              <p className="text-xs text-theme-tertiary truncate">{item.reason}</p>
            </div>
            
            <span
              className={`text-sm font-semibold whitespace-nowrap flex items-center justify-end gap-1 ${
                isFirst || isLast
                  ? 'text-theme-primary'
                  : isNegative
                    ? 'text-red-600 dark:text-red-400'
                    : isPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-theme-tertiary'
              }`}
            >
              {!isFirst && !isLast && (
                isNegative ? <ArrowDown className="w-3 h-3" /> : 
                isPositive ? <ArrowUp className="w-3 h-3" /> : 
                <Minus className="w-3 h-3" />
              )}
              {formatRupeesShort(item.impact)}
            </span>
            
            <span 
              className={`text-sm whitespace-nowrap text-right ${
                isLast ? 'font-extrabold text-base' : 'text-theme-secondary'
              }`} 
              style={isLast ? { color: 'var(--brand-navy)' } : undefined}
            >
              {formatRupeesShort(item.finalContribution)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PriceBreakdown;