// src/components/tools/evRangeCalculator/ResultsPanel.jsx
import { BatteryCharging, Route, Zap } from 'lucide-react';
import RangeResultCard from './RangeResultCard';
import StatMiniCard from './StatMiniCard';
import RangeReductionBreakdown from './RangeReductionBreakdown';
import ClaimedVsEstimatedChart from './ClaimedVsEstimatedChart';
import CostEstimateCard from './CostEstimateCard';
import AiInsightCard from './AiInsightCard';

/**
 * "Your Results" — everything driven by a single `result` object returned
 * from POST /calculate. No card recomputes anything itself.
 */
const ResultsPanel = ({ result, batteryPercent }) => {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: 'var(--brand-navy)' }}
          >
            2
          </span>
          <h2 className="font-bold text-theme-primary">Your Results</h2>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-extrabold" style={{ color: 'var(--brand-navy)' }}>{result.confidencePercent}%</p>
          <p className="text-xs text-theme-tertiary">Confidence</p>
        </div>
      </div>
      <p className="text-sm text-theme-tertiary mb-5 ml-8">
        Based on {batteryPercent}% battery and current conditions
      </p>

      <div className="space-y-5">
        <RangeResultCard
          estimatedRangeKm={result.estimatedRealWorldRangeKm}
          claimedRangeKm={result.claimedRangeKm}
          batteryPercent={batteryPercent}
          rangeBarPercent={result.rangeBarPercent}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatMiniCard
            icon={BatteryCharging}
            iconColorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            label="Estimated Battery at Destination"
            value={`${result.estimatedBatteryAtDestinationPercent}%`}
          />
          <StatMiniCard
            icon={Route}
            iconColorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            label="Recommended Max Trip Distance"
            value={`${result.recommendedMaxTripDistanceKm} km`}
          />
          <StatMiniCard
            icon={Zap}
            iconColorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            label="Usable Battery Used"
            value={`${result.usableBatteryUsedKwh} kWh`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RangeReductionBreakdown items={result.rangeReductionBreakdown} totalReductionPercent={result.totalReductionPercent} />
          <ClaimedVsEstimatedChart
            claimedRangeKm={result.claimedVsEstimated.claimedRangeKm}
            estimatedRangeKm={result.claimedVsEstimated.estimatedRangeKm}
            differenceKm={result.claimedVsEstimated.differenceKm}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CostEstimateCard costEstimate={result.costEstimate} />
          <AiInsightCard insight={result.aiInsight} />
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
