// src/components/tools/evRangeCalculator/PassengerCounter.jsx
import { Users, Minus, Plus } from 'lucide-react';
import { MIN_PASSENGERS, MAX_PASSENGERS } from '../../../constants/evRangeCalculator';
import FieldHint from './FieldHint';

/**
 * "Passengers" field — a simple +/- counter.
 */
const PassengerCounter = ({ value, onChange, hint }) => {
  const decrement = () => onChange(Math.max(MIN_PASSENGERS, value - 1));
  const increment = () => onChange(Math.min(MAX_PASSENGERS, value + 1));

  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        <Users className="w-4 h-4 text-theme-tertiary" />
        Passengers
      </label>
      <div className="flex items-center justify-between input-field w-full">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= MIN_PASSENGERS}
          aria-label="Decrease passengers"
          className="w-7 h-7 flex items-center justify-center rounded-full disabled:opacity-40"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-semibold text-theme-primary">{value}</span>
        <button
          type="button"
          onClick={increment}
          disabled={value >= MAX_PASSENGERS}
          aria-label="Increase passengers"
          className="w-7 h-7 flex items-center justify-center rounded-full disabled:opacity-40"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <FieldHint>{hint}</FieldHint>
    </div>
  );
};

export default PassengerCounter;
