// src/components/tools/evRangeCalculator/CostEstimateCard.jsx
import { Route, Zap, Home, Building2 } from 'lucide-react';

const CostItem = ({ icon: Icon, label, value, sublabel }) => (
  <div>
    <span className="flex items-center gap-1.5 text-xs text-theme-tertiary mb-1">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
    <p className="font-bold text-theme-primary">{value}</p>
    {sublabel && <p className="text-xs text-theme-tertiary">{sublabel}</p>}
  </div>
);

/**
 * "Cost Estimate for this Trip" — trip distance, energy used, and cost at
 * home vs public charging rates.
 */
const CostEstimateCard = ({ costEstimate }) => {
  const { tripDistanceKm, energyUsedKwh, homeChargingCost, publicChargingCost, homeChargingRatePerKwh, publicChargingRatePerKwh } = costEstimate;

  return (
    <div className="card p-5 sm:p-6 h-full">
      <h3 className="font-semibold text-theme-primary mb-4">Cost Estimate for this Trip</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <CostItem icon={Route} label="Trip Distance" value={`${tripDistanceKm} km`} />
        <CostItem icon={Zap} label="Energy Used" value={`${energyUsedKwh} kWh`} />
        <CostItem icon={Home} label="Home Charging" value={`₹${homeChargingCost}`} sublabel={`@ ₹${homeChargingRatePerKwh} /kWh`} />
        <CostItem icon={Building2} label="Public Charging" value={`₹${publicChargingCost}`} sublabel={`@ ₹${publicChargingRatePerKwh} /kWh`} />
      </div>
    </div>
  );
};

export default CostEstimateCard;
