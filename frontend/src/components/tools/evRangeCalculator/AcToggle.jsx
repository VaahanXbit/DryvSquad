// src/components/tools/evRangeCalculator/AcToggle.jsx
import { Snowflake } from 'lucide-react';
import { AC_OPTIONS } from '../../../constants/evRangeCalculator';
import FieldHint from './FieldHint';

/**
 * "Air Conditioning" field — a 3-way segmented control (OFF / Mixed / ON).
 */
const AcToggle = ({ value, onChange, hint }) => {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        <Snowflake className="w-4 h-4 text-theme-tertiary" />
        Air Conditioning
      </label>
      <div
        className="inline-flex rounded-full p-1 w-full"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
        role="radiogroup"
        aria-label="Air conditioning"
      >
        {AC_OPTIONS.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(opt.value)}
              className={`flex-1 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                isActive ? 'bg-yellow-500 text-brand-navy dark:text-black' : 'text-theme-tertiary'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <FieldHint>{hint}</FieldHint>
    </div>
  );
};

export default AcToggle;