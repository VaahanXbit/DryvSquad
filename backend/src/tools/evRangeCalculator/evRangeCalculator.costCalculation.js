// backend/src/tools/evRangeCalculator/evRangeCalculator.costCalculation.js
/*
================================================================================
File Name : evRangeCalculator.costCalculation.js
Description : Energy consumption and charging cost for a trip. Entirely
              derived from EstimatedPracticalRange (kWh-per-km) and
              TripDistance.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { CHARGING_RATES } = require('./evRangeCalculator.config');

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * @param {Object} params
 * @param {number} params.batteryCapacityKwh
 * @param {number} params.estimatedPracticalRangeKm - range at 100% battery, current conditions
 * @param {number} params.tripDistanceKm
 * @param {number} params.availableRangeKm
 * @returns {{ tripDistanceKm: number, energyUsedKwh: number, homeChargingCost: number, publicChargingCost: number, homeChargingRatePerKwh: number, publicChargingRatePerKwh: number }}
 */
const calculateTripCost = ({ batteryCapacityKwh, estimatedPracticalRangeKm, tripDistanceKm, availableRangeKm }) => {
  const kwhPerKm = batteryCapacityKwh / estimatedPracticalRangeKm;
  const energyUsedKwh = round1(kwhPerKm * Math.min(tripDistanceKm, availableRangeKm));

  return {
    tripDistanceKm,
    energyUsedKwh,
    homeChargingCost: Math.round(energyUsedKwh * CHARGING_RATES.homeChargingRatePerKwh),
    publicChargingCost: Math.round(energyUsedKwh * CHARGING_RATES.publicChargingRatePerKwh),
    homeChargingRatePerKwh: CHARGING_RATES.homeChargingRatePerKwh,
    publicChargingRatePerKwh: CHARGING_RATES.publicChargingRatePerKwh,
  };
};

module.exports = {
  calculateTripCost,
};
