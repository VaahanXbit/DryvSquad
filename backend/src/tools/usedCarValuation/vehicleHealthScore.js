// backend/src/tools/usedCarValuation/vehicleHealthScore.js
/*
================================================================================
File Name : vehicleHealthScore.js
Description : "Vehicle Health Score" mini card. Built ONLY from whichever
              Advanced Details condition fields the user filled in
              (Exterior/Engine Condition, Accident/Service History) —
              config-driven weights and per-option sub-scores live in
              usedCarValuation.config.js.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const {
  VEHICLE_HEALTH_SCORE_WEIGHTS,
  VEHICLE_HEALTH_SCORE_OPTIONS,
  DEFAULT_VEHICLE_HEALTH_SCORE,
  VEHICLE_HEALTH_LABEL_BANDS,
} = require('./usedCarValuation.config');

const resolveLabel = (score) => {
  const band = VEHICLE_HEALTH_LABEL_BANDS.find((b) => score >= b.min);
  return band ? band.label : VEHICLE_HEALTH_LABEL_BANDS[VEHICLE_HEALTH_LABEL_BANDS.length - 1].label;
};

/**
 * @param {Object} advancedDetails
 * @returns {{ score: number, label: string, isEstimated: boolean }}
 */
const calculateVehicleHealthScore = (advancedDetails = {}) => {
  const fields = Object.keys(VEHICLE_HEALTH_SCORE_WEIGHTS).filter(
    (field) => advancedDetails?.[field] && VEHICLE_HEALTH_SCORE_OPTIONS[field]?.[advancedDetails[field]] !== undefined
  );

  if (fields.length === 0) {
    return { score: DEFAULT_VEHICLE_HEALTH_SCORE, label: resolveLabel(DEFAULT_VEHICLE_HEALTH_SCORE), isEstimated: true };
  }

  const usedWeightTotal = fields.reduce((sum, field) => sum + VEHICLE_HEALTH_SCORE_WEIGHTS[field], 0);
  const weightedSum = fields.reduce((sum, field) => {
    const subScore = VEHICLE_HEALTH_SCORE_OPTIONS[field][advancedDetails[field]];
    return sum + subScore * VEHICLE_HEALTH_SCORE_WEIGHTS[field];
  }, 0);

  const score = Math.round(weightedSum / usedWeightTotal);
  return { score, label: resolveLabel(score), isEstimated: false };
};

module.exports = { calculateVehicleHealthScore };
