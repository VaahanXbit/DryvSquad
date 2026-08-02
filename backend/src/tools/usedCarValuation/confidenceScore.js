// backend/src/tools/usedCarValuation/confidenceScore.js
/*
================================================================================
File Name : confidenceScore.js
Description : Calculates the vehicle's Valuation Confidence by classifying 
              key vehicle condition parameters into Best, Average, or Poor 
              categories and returning a fixed confidence score (95%, 90%, or 80%) 
              based on the dominant condition.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const {
  CONFIDENCE_LEVELS,
  CONFIDENCE_LABELS,
  CONFIDENCE_AGE_BANDS,
  CONFIDENCE_OWNER_BANDS,
  CONFIDENCE_MILEAGE_TOLERANCE,
  CONFIDENCE_CONDITION_BUCKETS,
} = require('./usedCarValuation.config');

// ---- Individual parameter classifiers — each returns 'BEST' | 'AVERAGE' | 'POOR' ----

const classifyVehicleAge = (vehicleAgeYears) => {
  const age = vehicleAgeYears ?? 0;
  if (age <= CONFIDENCE_AGE_BANDS.bestMaxYears) return 'BEST';
  if (age <= CONFIDENCE_AGE_BANDS.averageMaxYears) return 'AVERAGE';
  return 'POOR';
};

const classifyOwnerNumber = (ownerNumber) => {
  const owner = ownerNumber ?? 1;
  if (owner <= CONFIDENCE_OWNER_BANDS.bestMaxOwner) return 'BEST';
  if (owner <= CONFIDENCE_OWNER_BANDS.averageMaxOwner) return 'AVERAGE';
  return 'POOR';
};

const classifyMileage = (actualKm, expectedKm) => {
  const actual = actualKm ?? 0;
  const expected = Math.max(expectedKm ?? 0, 0);
  if (actual <= expected) return 'BEST';
  const averageCeiling = expected * (1 + CONFIDENCE_MILEAGE_TOLERANCE.averageMaxOveragePercent);
  if (actual <= averageCeiling) return 'AVERAGE';
  return 'POOR';
};

// Generic classifier for the six optional Advanced Details fields — a
// blank/unselected field returns null and is excluded from the count.
const classifyCondition = (field, value) => {
  if (!value) return null;
  const mapping = CONFIDENCE_CONDITION_BUCKETS[field];
  return mapping?.[value] ?? null;
};

// ---- Dominance decision (counts only — no points) ----
const decideConfidence = (counts) => {
  const { BEST: best, AVERAGE: average, POOR: poor } = counts;
  const max = Math.max(best, average, poor);
  const bestIsMax = best === max;
  const averageIsMax = average === max;
  const poorIsMax = poor === max;

  if (bestIsMax && !averageIsMax && !poorIsMax) return CONFIDENCE_LEVELS.BEST; // 95
  if (poorIsMax && !bestIsMax && !averageIsMax) return CONFIDENCE_LEVELS.POOR; // 80
  if (averageIsMax && !bestIsMax && !poorIsMax) return CONFIDENCE_LEVELS.MIXED; // 90
  if (poorIsMax && averageIsMax && !bestIsMax) return CONFIDENCE_LEVELS.POOR; // POOR ties AVERAGE -> 80

  // Remaining cases: BEST ties AVERAGE, BEST ties POOR, or all three tie
  // — all conservatively resolve to 90 per the sign-off above.
  return CONFIDENCE_LEVELS.MIXED;
};

const CONDITION_FIELD_LABELS = {
  exteriorCondition: 'Exterior Condition',
  engineCondition: 'Engine Condition',
  accidentHistory: 'Accident History',
  serviceHistory: 'Service History',
  insuranceStatus: 'Insurance',
  loanStatus: 'Loan Status',
};

/**
 * @param {Object} signals
 * @param {number} signals.vehicleAgeYears
 * @param {number} signals.ownerNumber
 * @param {number} signals.expectedKm - from mileageEngine.js's calculateMileageImpact()
 * @param {number} signals.actualKm
 * @param {string} [signals.exteriorCondition]
 * @param {string} [signals.engineCondition]
 * @param {string} [signals.accidentHistory]
 * @param {string} [signals.serviceHistory]
 * @param {string} [signals.insuranceStatus]
 * @param {string} [signals.loanStatus]
 * @returns {{ score: number, label: string, description: string, positiveFactors: string[], negativeFactors: string[], breakdown: Object }}
 */
const calculateConfidenceScore = (signals) => {
  const classifications = [];

  classifications.push({
    parameter: 'vehicleAge',
    label: 'Vehicle Age',
    bucket: classifyVehicleAge(signals.vehicleAgeYears),
  });
  classifications.push({
    parameter: 'ownerNumber',
    label: 'Owner Number',
    bucket: classifyOwnerNumber(signals.ownerNumber),
  });
  classifications.push({
    parameter: 'mileage',
    label: 'Mileage',
    bucket: classifyMileage(signals.actualKm, signals.expectedKm),
  });

  Object.keys(CONDITION_FIELD_LABELS).forEach((field) => {
    const bucket = classifyCondition(field, signals[field]);
    if (bucket) {
      classifications.push({ parameter: field, label: CONDITION_FIELD_LABELS[field], bucket });
    }
  });

  const counts = { BEST: 0, AVERAGE: 0, POOR: 0 };
  classifications.forEach((c) => { counts[c.bucket] += 1; });

  const score = decideConfidence(counts);
  const label = CONFIDENCE_LABELS[score];

  const positiveFactors = classifications
    .filter((c) => c.bucket === 'BEST')
    .map((c) => `${c.label} falls under Best Condition.`);
  const negativeFactors = classifications
    .filter((c) => c.bucket === 'POOR')
    .map((c) => `${c.label} falls under Poor Condition.`);

  const descriptionByScore = {
    95: 'This vehicle falls under Best Condition overall.',
    90: 'This vehicle falls under Average / Mixed Condition overall.',
    80: 'This vehicle falls under Poor Condition overall.',
  };

  return {
    score,
    label,
    description: descriptionByScore[score],
    positiveFactors,
    negativeFactors,
    // Per-bucket counts and each parameter's classification — not shown
    // to users directly, kept for internal QA/debugging.
    breakdown: {
      counts,
      classifications,
    },
  };
};

module.exports = {
  calculateConfidenceScore,
};