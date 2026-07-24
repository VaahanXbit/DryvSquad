// src/components/tools/evRangeCalculator/StatMiniCard.jsx

/**
 * Small stat card reused for the Estimated Battery at Destination,
 * Recommended Max Trip Distance, and Usable Battery Used cards.
 */
const StatMiniCard = ({ icon: Icon, iconColorClass, label, value, valueColorClass = 'text-theme-primary' }) => {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColorClass}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-xs text-theme-tertiary leading-tight">{label}</span>
      </div>
      <span className={`text-xl font-bold ${valueColorClass}`}>{value}</span>
    </div>
  );
};

export default StatMiniCard;
