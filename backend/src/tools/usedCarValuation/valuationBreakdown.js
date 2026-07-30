// backend/src/tools/usedCarValuation/valuationBreakdown.js
/*
================================================================================
File Name : valuationBreakdown.js
Description : Combines the output of every engine (depreciationEngine,
              mileageEngine, ownerEngine, marketAdjustment,
              optionalAdjustments) into the Final Formula and the
              "Why This Price?" drawer's row data — the single source of
              truth for "how did we get this number". The main result
              screen never shows this permanently (per product review);
              it's rendered only inside the drawer, and only as these six
              named categories (individual Advanced Details fields are
              combined into one "Optional Adjustments" line, per spec):

                Original Price
                Age Impact
                Mileage Impact
                Ownership Impact
                City Impact
                Optional Adjustments

                Estimated Value =
                  Base Price
                  - Age Depreciation
                  +/- Mileage Adjustment
                  - Ownership Adjustment
                  + City Impact
                  +/- Optional Adjustments (Advanced Details, if provided)

              Each row returns { label, reason, impact, finalContribution }
              — `impact` is that row's own signed amount, `finalContribution`
              is the running total after that row.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {number} basePrice
 * @param {ReturnType<import('./depreciationEngine').calculateAgeDepreciation>} ageResult
 * @param {ReturnType<import('./mileageEngine').calculateMileageImpact>} mileageResult
 * @param {ReturnType<import('./ownerEngine').calculateOwnershipAdjustment>} ownerResult
 * @param {ReturnType<import('./marketAdjustment').calculateMarketAdjustment>} marketResult
 * @param {ReturnType<import('./optionalAdjustments').calculateOptionalAdjustments>} optionalResult
 */
const buildValuationBreakdown = (basePrice, ageResult, mileageResult, ownerResult, marketResult, optionalResult) => {
  const mileageSignedValue = mileageResult.type === 'penalty'
    ? -mileageResult.mileageImpactAmount
    : mileageResult.type === 'bonus'
      ? mileageResult.mileageImpactAmount
      : 0;

  const ownershipSignedValue = -ownerResult.ownershipAdjustment;
  const citySignedValue = marketResult.marketAdjustmentAmount;
  const optionalSignedValue = optionalResult?.totalAdjustmentAmount || 0;
  const optionalReason = optionalResult?.filledCount
    ? optionalResult.items.map((item) => `${item.label}: ${item.selection}`).join('; ')
    : 'No optional Advanced Details were provided.';

  let runningTotal = round2(basePrice);
  const rows = [{ label: 'Original Price', impact: round2(basePrice), reason: 'Original ex-showroom price of this vehicle.', finalContribution: runningTotal }];

  const pushRow = (label, impact, reason) => {
    runningTotal = round2(runningTotal + impact);
    rows.push({ label, impact: round2(impact), reason, finalContribution: runningTotal });
  };

  pushRow('Age Impact', -ageResult.ageDepreciationAmount, ageResult.reason);
  pushRow('Mileage Impact', mileageSignedValue, mileageResult.reason);
  pushRow('Ownership Impact', ownershipSignedValue, ownerResult.reason);
  pushRow('City Impact', citySignedValue, marketResult.reason);
  pushRow('Optional Adjustments', optionalSignedValue, optionalReason);

  const estimatedValue = runningTotal;

  return {
    estimatedValue,
    // Exactly the six categories the "Why This Price?" drawer shows —
    // Advanced Details fields are combined into one "Optional
    // Adjustments" line rather than listed individually.
    drawerRows: rows,
  };
};

module.exports = {
  buildValuationBreakdown,
};
