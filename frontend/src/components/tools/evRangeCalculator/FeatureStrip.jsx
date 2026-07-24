// src/components/tools/evRangeCalculator/FeatureStrip.jsx
import { Gauge, Target, Zap, IndianRupee, Sparkles, MapPinned } from 'lucide-react';

const FEATURES = [
  { icon: Gauge, label: 'Real World Conditions' },
  { icon: Target, label: 'Accurate Estimation' },
  { icon: Zap, label: 'Charging Recommendation' },
  { icon: IndianRupee, label: 'Cost Calculation' },
  { icon: Sparkles, label: 'AI Insights & Smart Tips' },
  { icon: MapPinned, label: 'Trip Planning Made Easy' },
];

/**
 * Bottom highlights strip — purely marketing/trust copy, no data behind it.
 */
const FeatureStrip = () => {
  return (
    <div className="border-t" style={{ borderColor: 'var(--border-primary)' }}>
      <div className="container-custom py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {FEATURES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left">
            <span
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <Icon className="w-4 h-4" style={{ color: 'var(--brand-navy)' }} />
            </span>
            <span className="text-xs font-medium text-theme-secondary">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureStrip;
