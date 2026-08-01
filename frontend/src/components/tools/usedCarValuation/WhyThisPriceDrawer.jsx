// src/components/tools/usedCarValuation/WhyThisPriceDrawer.jsx
/*
================================================================================
File Name : WhyThisPriceDrawer.jsx
Description : Side drawer opened by the "Why This Price?" link beside the
              Estimated Market Value — replaces the old permanently-visible
              Price Breakdown per the product review.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { X } from 'lucide-react';
import { ArrowDown , ArrowUp, Minus} from 'lucide-react';
const WhyThisPriceDrawer = ({ isOpen, onClose, rows }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - positioned relative to parent container */}
      <div
        className="absolute inset-0 z-[90] bg-black/50 rounded-2xl"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer - positioned relative to parent container */}
      <div className="absolute top-0 right-0 z-[91] w-full sm:w-[440px] bg-theme-primary shadow-2xl overflow-y-auto rounded-r-2xl sm:rounded-2xl max-h-full">
        <div className="sticky top-0 bg-theme-primary border-b px-5 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="font-bold text-theme-primary">Why This Price?</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-theme-tertiary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-theme-tertiary" />
          </button>
        </div>

        {/* Content with comfortable spacing and text wrapping */}
        <div className="p-5 sm:p-6">
          <p className="text-sm text-theme-tertiary mb-5">
            Here&apos;s exactly how we arrived at your estimated market value, step by step.
          </p>
          
          {/* Spacious breakdown with proper text wrapping */}
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-1 pb-2 text-xs font-semibold text-theme-tertiary border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <span>Reason</span>
              <span className="text-right">Impact</span>
              <span className="text-right">Running Total</span>
            </div>
            
            {rows.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === rows.length - 1;
              const isNegative = item.impact < 0;
              const isPositive = item.impact > 0 && !isFirst;

              return (
                <div
                  key={`${item.label}-${index}`}
                  className={`grid grid-cols-[1fr_auto_auto] gap-4 items-start px-1 py-3 ${
                    isLast ? 'border-t mt-2 pt-3' : ''
                  }`}
                  style={isLast ? { borderColor: 'var(--border-primary)' } : undefined}
                >
                  <div className="min-w-0">
                    <p className={`text-sm ${isLast ? 'font-bold text-theme-primary' : 'font-medium text-theme-primary'}`}>
                      {item.label}
                    </p>
                    {/* Reason text with proper wrapping - full text visible */}
                    <p className="text-xs text-theme-tertiary break-words whitespace-normal leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                  
                  <span
                    className={`text-sm font-semibold whitespace-nowrap flex items-center justify-end gap-1 pt-0.5 ${
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
                    className={`text-sm whitespace-nowrap text-right pt-0.5 ${
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
        </div>
      </div>
    </>
  );
};

// Helper function to format impact with arrow indicators
const formatImpact = (impact) => {
  if (impact === 0) return '₹0';
  const formatted = formatRupeesShort(Math.abs(impact));
  if (impact > 0) return `+${formatted}`;
  return `-${formatted}`;
};

// Helper function to format rupees (re-exported from constants)
const formatRupeesShort = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) {
    return `₹${(absAmount / 10000000).toFixed(2)} Cr`;
  }
  if (absAmount >= 100000) {
    return `₹${(absAmount / 100000).toFixed(2)} L`;
  }
  if (absAmount >= 1000) {
    return `₹${(absAmount / 1000).toFixed(1)}k`;
  }
  return `₹${absAmount}`;
};

export default WhyThisPriceDrawer;