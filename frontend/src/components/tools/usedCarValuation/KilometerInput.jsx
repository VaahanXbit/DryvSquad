// src/components/tools/usedCarValuation/KilometerInput.jsx
import { Gauge } from 'lucide-react';
import { MIN_KILOMETERS, MAX_KILOMETERS } from '../../../constants/usedCarValuation';

const KilometerInput = ({ value, onChange }) => {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        <Gauge className="w-4 h-4 text-theme-tertiary" />
        Kilometers Driven
      </label>
      <div className="relative">
        <input
          type="number"
          min={MIN_KILOMETERS}
          max={MAX_KILOMETERS}
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className="input-field w-full pr-12"
          placeholder="e.g. 40000"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-theme-tertiary">km</span>
      </div>
    </div>
  );
};

export default KilometerInput;
