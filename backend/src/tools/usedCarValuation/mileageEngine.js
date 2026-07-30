// backend/src/tools/usedCarValuation/mileageEngine.js
/*
================================================================================
File Name : mileageEngine.js
Description : STEP 3 — Mileage Engine. Compares Actual KM driven against
              Expected KM (Vehicle Age x Average Annual KM) and returns a
              bonus (below-expected usage) or penalty (above-expected
              usage), scaled and capped from usedCarValuation.config.js.

              Average Annual KM normally comes from the body-type table in
              config, but a resolved Location document's `averageAnnualKm`
              field (regional driving norms — e.g. higher in spread-out
              cities) takes priority when set. This engine only reads that
              already-resolved value; it never looks up or searches for a
              location itself.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const {
  AVERAGE_ANNUAL_KM,
  MILEAGE_PENALTY_RATE_PER_1000KM,
  MILEAGE_BONUS_RATE_PER_1000KM,
  MAX_MILEAGE_PENALTY_PERCENT,
  MAX_MILEAGE_BONUS_PERCENT,
} = require('./usedCarValuation.config');

const round2 = (value) => Math.round(value * 100) / 100;

const resolveAverageAnnualKm = (bodyType, location) => {
  if (location && typeof location.averageAnnualKm === 'number') {
    return location.averageAnnualKm;
  }
  return AVERAGE_ANNUAL_KM[bodyType] ?? AVERAGE_ANNUAL_KM.default;
};

/**
 * @param {number} basePrice
 * @param {number} vehicleAge
 * @param {number} actualKm
 * @param {string} bodyType - e.g. 'SUV', 'Sedan', 'Hatchback'
 * @param {{ averageAnnualKm?: number|null }} [location] - resolved Location document
 * @returns {{
 *   averageAnnualKm: number,
 *   expectedKm: number,
 *   actualKm: number,
 *   differenceKm: number,
 *   type: 'bonus'|'penalty'|'neutral',
 *   mileageImpactAmount: number,
 *   label: string,
 *   reason: string
 * }}
 */
const calculateMileageImpact = (basePrice, vehicleAge, actualKm, bodyType, location) => {
  const averageAnnualKm = resolveAverageAnnualKm(bodyType, location);
  const expectedKm = Math.round(Math.max(vehicleAge, 0) * averageAnnualKm);
  const differenceKm = Math.round(actualKm - expectedKm);

  if (differenceKm === 0) {
    return {
      averageAnnualKm,
      expectedKm,
      actualKm,
      differenceKm,
      type: 'neutral',
      mileageImpactAmount: 0,
      label: 'Kilometers Driven',
      reason: 'Matches the expected usage for this vehicle\u2019s age — no mileage adjustment applied.',
    };
  }

  if (differenceKm > 0) {
    const rawPenalty = (differenceKm / 1000) * MILEAGE_PENALTY_RATE_PER_1000KM * basePrice;
    const cappedPenalty = Math.min(rawPenalty, MAX_MILEAGE_PENALTY_PERCENT * basePrice);
    return {
      averageAnnualKm,
      expectedKm,
      actualKm,
      differenceKm,
      type: 'penalty',
      mileageImpactAmount: round2(cappedPenalty),
      label: 'Kilometers Driven',
      reason: `Driven ${differenceKm.toLocaleString('en-IN')} km more than expected for its age — higher usage reduces resale value.`,
    };
  }

  const rawBonus = (Math.abs(differenceKm) / 1000) * MILEAGE_BONUS_RATE_PER_1000KM * basePrice;
  const cappedBonus = Math.min(rawBonus, MAX_MILEAGE_BONUS_PERCENT * basePrice);
  return {
    averageAnnualKm,
    expectedKm,
    actualKm,
    differenceKm,
    type: 'bonus',
    mileageImpactAmount: round2(cappedBonus),
    label: 'Kilometers Driven',
    reason: `Driven ${Math.abs(differenceKm).toLocaleString('en-IN')} km less than expected for its age — low mileage improves resale value.`,
  };
};

module.exports = {
  calculateMileageImpact,
  resolveAverageAnnualKm,
};
