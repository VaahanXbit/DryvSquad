// src/components/tools/usedCarValuation/MarketDemandCard.jsx
import { TrendingUp } from 'lucide-react';

const DEMAND_STYLES = {
  high: { label: 'High', color: 'text-green-600 dark:text-green-400' },
  medium: { label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' },
  low: { label: 'Low', color: 'text-red-600 dark:text-red-400' },
};

/** Reads `marketDemand` straight from the backend, which itself reads it from the resolved Location document. */
const MarketDemandCard = ({ marketDemand }) => {
  const style = DEMAND_STYLES[marketDemand] || DEMAND_STYLES.medium;

  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs font-semibold text-theme-tertiary mb-2">Market Demand</p>
      <div className="flex items-center justify-between">
        <span className={`text-xl font-extrabold ${style.color}`}>{style.label}</span>
        <TrendingUp className={`w-5 h-5 ${style.color}`} />
      </div>
    </div>
  );
};

export default MarketDemandCard;
