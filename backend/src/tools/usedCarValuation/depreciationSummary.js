// backend/src/tools/usedCarValuation/depreciationSummary.js
/*
================================================================================
File Name : depreciationSummary.js
Description : "Depreciation Summary" card — Original Price -> Current
              Estimated Value -> Total Depreciation -> Depreciation %.
              Pure arithmetic over numbers the engine already computed;
              introduces no new business rule of its own.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {number} basePrice - original ex-showroom price
 * @param {number} estimatedValue - final estimated value
 * @returns {{ originalPrice: number, currentEstimatedValue: number, totalDepreciation: number, depreciationPercentage: number }}
 */
const buildDepreciationSummary = (basePrice, estimatedValue) => {
  const totalDepreciation = round2(basePrice - estimatedValue);
  const depreciationPercentage = basePrice > 0 ? round2((totalDepreciation / basePrice) * 100) : 0;

  return {
    originalPrice: round2(basePrice),
    currentEstimatedValue: round2(estimatedValue),
    totalDepreciation,
    depreciationPercentage,
  };
};

module.exports = { buildDepreciationSummary };
