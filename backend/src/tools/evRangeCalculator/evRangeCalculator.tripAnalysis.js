// backend/src/tools/evRangeCalculator/evRangeCalculator.tripAnalysis.js
/*
================================================================================
File Name : evRangeCalculator.tripAnalysis.js
Description : Trip feasibility and remaining-battery calculation. Pure functions operating on
              the AvailableRange + TripDistance already computed by the
              calculation engine.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { MESSAGES } = require('./constants');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * @param {number} availableRangeKm
 * @param {number} tripDistanceKm
 * @returns {{ tripPossible: boolean, chargingRequired: boolean, remainingBatteryPercent: number, message: string }}
 */
const analyzeTrip = (availableRangeKm, tripDistanceKm) => {
  const tripPossible = availableRangeKm >= tripDistanceKm;

  const remainingBatteryPercent = Math.round(
    clamp(((availableRangeKm - tripDistanceKm) / availableRangeKm) * 100, 0, 100)
  );

  return {
    tripPossible,
    chargingRequired: !tripPossible,
    remainingBatteryPercent,
    message: tripPossible ? MESSAGES.NO_CHARGING_REQUIRED : MESSAGES.CHARGING_REQUIRED,
  };
};

module.exports = {
  analyzeTrip,
};
