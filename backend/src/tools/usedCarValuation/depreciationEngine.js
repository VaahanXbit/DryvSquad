// backend/src/tools/usedCarValuation/depreciationEngine.js
/*
================================================================================
File Name : depreciationEngine.js
Description : Age Depreciation. Pure function: vehicle age in, a
              fully-explained depreciation result out. Every rate is read
              from usedCarValuation.config.js.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const {
  AGE_DEPRECIATION_SCHEDULE,
  AGE_DEPRECIATION_RATE_BEYOND,
  MIN_REMAINING_VALUE_FACTOR,
} = require('./usedCarValuation.config');

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {number} basePrice - original ex-showroom price
 * @param {number} vehicleAge - current year - registration year (>= 0)
 * @returns {{
 *   vehicleAge: number,
 *   ageFactor: number,
 *   remainingValue: number,
 *   ageDepreciationAmount: number,
 *   label: string,
 *   reason: string
 * }}
 */
const calculateAgeDepreciation = (basePrice, vehicleAge) => {
  const age = Math.max(0, Math.floor(vehicleAge));

  let remainingFactor = 1;
  for (let year = 1; year <= age; year += 1) {
    const scheduled = AGE_DEPRECIATION_SCHEDULE.find((entry) => entry.year === year);
    const rate = scheduled ? scheduled.rate : AGE_DEPRECIATION_RATE_BEYOND;
    remainingFactor *= (1 - rate);
  }

  // Floor so a very old vehicle never depreciates to (near) zero.
  const ageFactor = Math.max(remainingFactor, MIN_REMAINING_VALUE_FACTOR);

  const remainingValue = round2(basePrice * ageFactor);
  const ageDepreciationAmount = round2(basePrice - remainingValue);

  return {
    vehicleAge: age,
    ageFactor: round2(ageFactor),
    remainingValue,
    ageDepreciationAmount,
    label: 'Vehicle Age',
    reason: age === 0
      ? 'Registered this year — no age-based depreciation applied yet.'
      : `${age} year${age > 1 ? 's' : ''} old — depreciation reduces value as the vehicle ages.`,
  };
};

module.exports = {
  calculateAgeDepreciation,
};
