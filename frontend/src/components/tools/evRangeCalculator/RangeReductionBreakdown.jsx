// src/components/tools/evRangeCalculator/RangeReductionBreakdown.jsx
import {
  Car, Snowflake, Thermometer, Users, Mountain, TrafficCone, Gauge, Leaf,
} from 'lucide-react';

// Best-effort icon match by keyword in the label — purely decorative.
const pickIcon = (label) => {
  const lower = label.toLowerCase();
  if (lower.includes('highway') || lower.includes('city') || lower.includes('mixed')) return Car;
  if (lower.includes('ac') || lower.includes('air')) return Snowflake;
  if (lower.includes('temperature')) return Thermometer;
  if (lower.includes('passenger')) return Users;
  if (lower.includes('terrain') || lower.includes('hilly')) return Mountain;
  if (lower.includes('traffic')) return TrafficCone;
  if (lower.includes('speed')) return Gauge;
  return Leaf;
};

/**
 * "Range Reduction Breakdown" — explains each contributing factor
 * individually, plus a combined total. Never shows internal
 * multipliers/formulas.
 *
 * The total shown here ("Total Estimated Impact") is deliberately the sum
 * of just the items listed above it — not the backend's overall
 * totalReductionPercent, which also factors in current battery level and
 * so won't match a simple sum of the condition-based items. Showing the
 * sum of what's visible avoids the "why don't these numbers add up"
 * confusion; the final Estimated Real World Range card is still the
 * authoritative number, computed by the full engine.
 */
const RangeReductionBreakdown = ({ items }) => {
  const totalEstimatedImpact = items.reduce((sum, item) => sum + item.reductionPercent, 0);

  return (
    <div className="card p-5 sm:p-6 h-full">
      <h3 className="font-semibold text-theme-primary">Range Reduction Breakdown</h3>
      <p className="text-sm text-theme-tertiary mb-4">Why is the range lower than claimed?</p>

      {items.length === 0 ? (
        <p className="text-sm text-theme-tertiary">
          Current conditions closely match ideal driving conditions.
        </p>
      ) : (
        <div className="space-y-3 mb-4">
          {items.map((item) => {
            const Icon = pickIcon(item.label);
            return (
              <div key={item.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-theme-secondary">
                  <Icon className="w-4 h-4 text-theme-tertiary flex-shrink-0" />
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  -{item.reductionPercent}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-theme-primary">Total Estimated Impact</span>
          <span className="font-bold text-red-600 dark:text-red-400">-{Math.round(totalEstimatedImpact)}%</span>
        </div>
        <p className="text-xs text-theme-tertiary mt-1.5 leading-snug">
          The above percentages represent the major factors affecting today&apos;s estimated range. The
          final estimated range is calculated using the complete calculation engine.
        </p>
      </div>
    </div>
  );
};

export default RangeReductionBreakdown;