// src/components/tools/usedCarValuation/DepreciationSummaryCard.jsx
/*
================================================================================
File Name : DepreciationSummaryCard.jsx
Description : "Depreciation Summary" — Original Price -> Current
              Estimated Value -> Total Depreciation -> Depreciation %.
              Renders the backend's `depreciationSummary` object as-is.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { ArrowDown } from 'lucide-react';
import { formatRupeesShort } from '../../../constants/usedCarValuation';

const DepreciationSummaryCard = ({ summary }) => {
  return (
    <div className="card p-5 sm:p-6 h-full">
      <h3 className="font-bold text-theme-primary mb-4">Depreciation Summary</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-theme-secondary">Original Price (Ex-Showroom)</span>
          <span className="text-sm font-bold text-theme-primary">{formatRupeesShort(summary.originalPrice)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-theme-secondary">Current Estimated Value</span>
          <span className="text-sm font-bold text-theme-primary">{formatRupeesShort(summary.currentEstimatedValue)}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <span className="text-sm text-theme-secondary">Total Depreciation</span>
          <span className="text-sm font-bold text-theme-primary">{formatRupeesShort(summary.totalDepreciation)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-theme-secondary">Depreciation Percentage</span>
          <span className="flex items-center gap-1 text-sm font-bold text-red-600 dark:text-red-400">
            <ArrowDown className="w-3.5 h-3.5" />
            {summary.depreciationPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default DepreciationSummaryCard;
