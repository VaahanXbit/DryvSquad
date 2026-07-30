// src/components/tools/usedCarValuation/SimilarCarsTable.jsx
/*
================================================================================
File Name : SimilarCarsTable.jsx
Description : "Similar Cars in Market". Renders the backend's
              `similarCars` array — sourced from the same Variant/Model
              collections as the rest of this tool (see similarCars.js).
              KM Driven / Days Listed are demo-jittered values, clearly
              flagged as such in the footnote, until a real used-listings
              feed is available.

              Model Name is clickable — calls `onSelectCar(car)`, which
              the hook's `selectSimilarCar()` uses to repopulate Brand /
              Model / Variant and recalculate the valuation on this same
              page (no navigation to another page).
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { formatRupeesShort } from '../../../constants/usedCarValuation';

const SimilarCarsTable = ({ cars, onSelectCar }) => {
  if (!cars?.length) return null;

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-bold text-theme-primary mb-4">Similar Cars in Market</h3>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-xs font-semibold text-theme-tertiary border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <th className="py-2 px-2 font-semibold">Model</th>
              <th className="py-2 px-2 font-semibold">Year</th>
              <th className="py-2 px-2 font-semibold">KM Driven</th>
              <th className="py-2 px-2 font-semibold">Price</th>
              <th className="py-2 px-2 font-semibold">Location</th>
              <th className="py-2 px-2 font-semibold">Days Listed</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} className="border-b last:border-0" style={{ borderColor: 'var(--border-primary)' }}>
                <td className="py-2.5 px-2 whitespace-nowrap">
                  {car.brandId && car.modelId && car.variantId ? (
                    <button
                      type="button"
                      onClick={() => onSelectCar?.(car)}
                      className="font-medium hover:underline text-left"
                      style={{ color: 'var(--brand-navy)' }}
                      title="View valuation for this vehicle"
                    >
                      {car.model}
                    </button>
                  ) : (
                    <span className="font-medium text-theme-primary">{car.model}</span>
                  )}
                </td>
                <td className="py-2.5 px-2 text-theme-secondary">{car.year}</td>
                <td className="py-2.5 px-2 text-theme-secondary whitespace-nowrap">{car.kilometersDriven.toLocaleString('en-IN')} km</td>
                <td className="py-2.5 px-2 font-semibold text-theme-primary whitespace-nowrap">{formatRupeesShort(car.price)}</td>
                <td className="py-2.5 px-2 text-theme-secondary">{car.location}</td>
                <td className="py-2.5 px-2 text-theme-secondary">{car.daysListed} Days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-theme-tertiary mt-3">
        KM driven and days listed are illustrative estimates. Prices updated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.
      </p>
    </div>
  );
};

export default SimilarCarsTable;
