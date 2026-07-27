// src/components/tools/evRangeCalculator/TripDistanceInput.jsx
import { Route } from 'lucide-react';
import FieldHint from './FieldHint';

/**
 * "Trip Distance" — moved up to Priority 1 per the latest review, since
 * it's one of the most important parameters (decides trip feasibility and
 * drives the Cost Estimate / Charging Recommendation cards).
 */
const TripDistanceInput = ({ value, onChange, hint }) => {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        <Route className="w-4 h-4 text-theme-tertiary" />
        Trip Distance
      </label>
      <div className="relative">
        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className="input-field w-full pr-12"
          placeholder="e.g. 220"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-theme-tertiary">km</span>
      </div>
      <FieldHint>{hint}</FieldHint>
    </div>
  );
};

export default TripDistanceInput;
