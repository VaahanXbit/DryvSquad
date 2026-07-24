// src/components/tools/evRangeCalculator/ClaimedVsEstimatedChart.jsx

/**
 * "Claimed vs Estimated" bar comparison. Built with plain CSS bars rather
 * than a charting library, keeping this feature dependency-free and
 * consistent with the rest of the codebase.
 */
const ClaimedVsEstimatedChart = ({ claimedRangeKm, estimatedRangeKm, differenceKm }) => {
  const maxValue = Math.max(claimedRangeKm, estimatedRangeKm);
  const claimedHeight = (claimedRangeKm / maxValue) * 100;
  const estimatedHeight = (estimatedRangeKm / maxValue) * 100;

  return (
    <div className="card p-5 sm:p-6 h-full flex flex-col">
      <h3 className="font-semibold text-theme-primary mb-5">Claimed vs Estimated</h3>

      <div className="flex-1 flex items-end justify-center gap-10 px-4" style={{ minHeight: '160px' }}>
        <div className="flex flex-col items-center justify-end h-40">
          <span className="text-sm font-bold text-theme-primary mb-1.5">{claimedRangeKm} km</span>
          <div
            className="w-16 rounded-t-md"
            style={{ height: `${claimedHeight}%`, backgroundColor: 'var(--bg-tertiary)' }}
          />
        </div>
        <div className="flex flex-col items-center justify-end h-40">
          <span className="text-sm font-bold text-green-600 dark:text-green-400 mb-1.5">{estimatedRangeKm} km</span>
          <div className="w-16 rounded-t-md bg-green-500" style={{ height: `${estimatedHeight}%` }} />
        </div>
      </div>

      <div className="flex justify-center gap-10 mt-3 text-xs text-theme-tertiary text-center">
        <span className="w-16">Claimed Range<br />(ARAI)</span>
        <span className="w-16">Estimated Range<br />(Today)</span>
      </div>

      <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'var(--border-primary)' }}>
        <p className="text-xs text-theme-tertiary mb-0.5">Difference</p>
        <p className="font-bold text-red-600 dark:text-red-400">-{differenceKm} km</p>
      </div>
    </div>
  );
};

export default ClaimedVsEstimatedChart;
