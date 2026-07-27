// src/components/tools/evRangeCalculator/TemperatureInput.jsx
import { Thermometer } from 'lucide-react';
import FieldHint from './FieldHint';
import { MIN_TEMPERATURE_C, MAX_TEMPERATURE_C } from '../../../constants/evRangeCalculator';

/**
 * "Outside Temperature" — free numeric entry (any °C value), replacing the
 * old fixed dropdown. The backend maps whatever value is entered to the
 * matching reduction factor, so no dropdown list needs to be kept in sync.
 */
const TemperatureInput = ({ value, onChange, hint }) => {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        <Thermometer className="w-4 h-4 text-theme-tertiary" />
        Outside Temperature
      </label>
      <div className="relative">
        <input
          type="number"
          min={MIN_TEMPERATURE_C}
          max={MAX_TEMPERATURE_C}
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className="input-field w-full pr-10"
          placeholder="e.g. 38"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-theme-tertiary">°C</span>
      </div>
      <FieldHint>{hint}</FieldHint>
    </div>
  );
};

export default TemperatureInput;
