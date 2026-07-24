// src/components/tools/evRangeCalculator/BatterySlider.jsx
import { BatteryMedium } from 'lucide-react';
import { MIN_BATTERY_PERCENT, MAX_BATTERY_PERCENT } from '../../../constants/evRangeCalculator';

/**
 * "Current Battery Level" slider — battery icon + live percentage readout
 * above a range input, with min/max labels below.
 */
const BatterySlider = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-theme-secondary mb-2">Current Battery Level</label>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-bold text-theme-primary whitespace-nowrap">
          <BatteryMedium className="w-5 h-5" style={{ color: 'var(--brand-navy)' }} />
          {value}%
        </span>
        <input
          type="range"
          min={MIN_BATTERY_PERCENT}
          max={MAX_BATTERY_PERCENT}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-current"
          style={{ accentColor: 'var(--brand-navy)' }}
          aria-label="Current battery percentage"
        />
      </div>
      <div className="flex justify-between text-xs text-theme-tertiary mt-1">
        <span>{MIN_BATTERY_PERCENT}%</span>
        <span>{MAX_BATTERY_PERCENT}%</span>
      </div>
    </div>
  );
};

export default BatterySlider;
