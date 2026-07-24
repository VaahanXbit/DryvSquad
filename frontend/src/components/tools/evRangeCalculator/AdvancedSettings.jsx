// src/components/tools/evRangeCalculator/AdvancedSettings.jsx
import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

/**
 * "Advanced Settings" — collapsed by default, per spec. Holds the fields
 * that aren't part of the main approved form but are needed by the
 * calculation engine: trip distance and charging rates.
 */
const AdvancedSettings = ({ advanced, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg" style={{ borderColor: 'var(--border-primary)' }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-theme-secondary"
        aria-expanded={isOpen}
      >
        Advanced Settings
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="pt-4">
            <label className="block text-sm text-theme-tertiary mb-1.5">Trip Distance (km)</label>
            <input
              type="number"
              min={1}
              value={advanced.tripDistanceKm}
              onChange={(e) => onChange('tripDistanceKm', Number(e.target.value))}
              className="input-field w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-theme-tertiary mb-1.5">Home Rate (₹/kWh)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={advanced.homeChargingRatePerKwh}
                onChange={(e) => onChange('homeChargingRatePerKwh', Number(e.target.value))}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-theme-tertiary mb-1.5">Public Rate (₹/kWh)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={advanced.publicChargingRatePerKwh}
                onChange={(e) => onChange('publicChargingRatePerKwh', Number(e.target.value))}
                className="input-field w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;
