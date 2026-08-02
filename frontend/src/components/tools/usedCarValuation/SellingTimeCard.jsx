// src/components/tools/usedCarValuation/SellingTimeCard.jsx
import { Clock } from 'lucide-react';

/** Reads `expectedSellingDays` straight from the backend (Location's averageSellingDays), with a generic fallback range when not yet tuned for that location. */
const SellingTimeCard = ({ expectedSellingDays }) => {
  const rangeLabel = expectedSellingDays
    ? `${Math.max(1, expectedSellingDays - 5)} - ${expectedSellingDays + 5} Days`
    : '7 - 15 Days';

  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs font-semibold text-theme-tertiary mb-2">Expected Selling Time</p>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xl font-extrabold text-theme-primary block">{rangeLabel}</span>
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">Fast Sale</span>
        </div>
        <Clock className="w-5 h-5 text-theme-tertiary" />
      </div>
    </div>
  );
};

export default SellingTimeCard;
