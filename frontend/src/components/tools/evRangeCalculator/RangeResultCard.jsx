// src/components/tools/evRangeCalculator/RangeResultCard.jsx
import { Info } from 'lucide-react';

/**
 * The big green headline number — Estimated Real World Range — with the
 * progress bar showing it relative to the manufacturer's claimed range.
 */
const RangeResultCard = ({ estimatedRangeKm, claimedRangeKm, batteryPercent, rangeBarPercent }) => {
  return (
    <div className="card p-5 sm:p-6">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        Estimated Real World Range
        <Info className="w-3.5 h-3.5 text-theme-tertiary" />
      </span>

      <div className="flex items-baseline gap-2">
        <span className="text-5xl sm:text-6xl font-extrabold text-green-600 dark:text-green-400">
          {estimatedRangeKm}
        </span>
        <span className="text-2xl font-semibold text-green-600 dark:text-green-400">km</span>
      </div>
      <p className="text-sm text-theme-tertiary mt-1 mb-4">
        This is how far you can go with {batteryPercent}% battery
      </p>

      <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${rangeBarPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-theme-tertiary mt-1.5">
        <span>0 km</span>
        <span>{claimedRangeKm} km (Claimed Range)</span>
      </div>
    </div>
  );
};

export default RangeResultCard;
