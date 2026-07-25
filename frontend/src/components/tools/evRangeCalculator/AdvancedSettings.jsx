// src/components/tools/evRangeCalculator/AdvancedSettings.jsx
import { useState } from 'react';
import { ChevronRight, ChevronDown, CircleDot } from 'lucide-react';

// Lowest-priority, not-yet-active factors — shown collapsed, disabled,
// clearly labeled "Coming Soon" so it's obvious they don't affect the
// calculation yet. Adding a real one later only means adding its config
// in evRangeCalculator.config.js and one entry in the reduction-factors
// engine — no UI restructuring needed.
const FUTURE_SETTINGS = ['Roof Box', 'Trailer', 'Tyre Pressure', 'Headwind', 'Rain', 'Snow'];

/**
 * "Advanced Settings" — collapsed by default, lowest priority per the
 * latest review. Currently a roadmap of future factors, since Trip
 * Distance and charging rates have moved elsewhere (Trip Distance is now
 * a primary input; charging rates are backend config, not user-facing).
 */
const AdvancedSettings = () => {
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
        <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <p className="text-xs text-theme-tertiary mb-3">More precision factors, coming soon:</p>
          <div className="grid grid-cols-2 gap-2">
            {FUTURE_SETTINGS.map((label) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-xs text-theme-tertiary px-2.5 py-1.5 rounded-md opacity-60"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <CircleDot className="w-3 h-3" />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;
