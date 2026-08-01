// src/components/tools/usedCarValuation/AdvancedDetailsSection.jsx
/*
================================================================================
File Name : AdvancedDetailsSection.jsx
Description : "Advanced Details (Optional)" — expanded by default per
              the latest product review (users may still collapse it
              manually).
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState } from 'react';
import {
  AlertTriangle, ChevronDown, Cog, Car, FileText, ShieldCheck, Wrench, RefreshCw,
} from 'lucide-react';
import { ADVANCED_FIELD_OPTIONS } from '../../../constants/usedCarValuation';

const ICONS = {
  car: Car,
  alert: AlertTriangle,
  engine: Cog,
  wrench: Wrench,
  shield: ShieldCheck,
  file: FileText,
};

const AdvancedDetailsSection = ({ values, onChange }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="card p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-4"
      >
        <div className="flex items-center gap-2 text-left">
          <RefreshCw className="w-4 h-4 text-theme-tertiary flex-shrink-0" />
          <div>
            <span className="font-semibold text-theme-primary text-sm block">Advanced Details (Optional)</span>
            {!isOpen && <span className="text-xs text-theme-tertiary">Add more details for a more accurate valuation</span>}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-theme-tertiary flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 sm:px-5 pb-5 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          {Object.entries(ADVANCED_FIELD_OPTIONS).map(([key, field]) => {
            const Icon = ICONS[field.icon] || FileText;
            return (
              <div key={key} className="pt-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-theme-secondary mb-2">
                  <Icon className="w-3.5 h-3.5 text-theme-tertiary" />
                  {field.label}
                </label>
                <select
                  value={values[key] || ''}
                  onChange={(e) => onChange(key, e.target.value)}
                  className="input-field w-full text-sm"
                >
                  <option value="">Not specified</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvancedDetailsSection;
