// backend/src/tools/evRangeCalculator/evRangeCalculator.validator.js
/*
================================================================================
File Name : evRangeCalculator.validator.js
Description : Input validation for the EV Range Calculator. Kept isolated
              from the controller/service so validation rules can evolve
              independently.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const {
  VALID_ROAD_TYPES,
  VALID_DRIVING_STYLES,
  VALID_AC_MODES,
  VALID_TERRAINS,
  VALID_TRAFFIC_LEVELS,
  MIN_BATTERY_PERCENT,
  MAX_BATTERY_PERCENT,
  MIN_PASSENGERS,
  MAX_PASSENGERS,
} = require('./constants');

/**
 * @param {import('./evRangeCalculator.types').CalculateRangeInput} input
 * @returns {{ isValid: boolean, errors: string[] }}
 */
const validateCalculateInput = (input) => {
  const errors = [];
  const body = input || {};

  if (!body.vehicleId || typeof body.vehicleId !== 'string') {
    errors.push('Please select a vehicle');
  }

  const battery = Number(body.batteryPercent);
  if (Number.isNaN(battery) || battery < MIN_BATTERY_PERCENT || battery > MAX_BATTERY_PERCENT) {
    errors.push(`Battery level must be between ${MIN_BATTERY_PERCENT}% and ${MAX_BATTERY_PERCENT}%`);
  }

  if (typeof body.outsideTemperatureC !== 'number' || Number.isNaN(body.outsideTemperatureC)) {
    errors.push('Outside temperature is required');
  }

  if (!VALID_ROAD_TYPES.includes(body.roadType)) {
    errors.push('Please select a valid road type');
  }

  const speed = Number(body.averageSpeedKmh);
  if (Number.isNaN(speed) || speed <= 0) {
    errors.push('Please select a valid average speed');
  }

  if (!VALID_DRIVING_STYLES.includes(body.drivingStyle)) {
    errors.push('Please select a valid driving style');
  }

  if (!VALID_AC_MODES.includes(body.airConditioning)) {
    errors.push('Please select a valid air conditioning setting');
  }

  const passengers = Number(body.passengers);
  if (Number.isNaN(passengers) || passengers < MIN_PASSENGERS || passengers > MAX_PASSENGERS) {
    errors.push(`Passengers must be between ${MIN_PASSENGERS} and ${MAX_PASSENGERS}`);
  }

  if (!VALID_TERRAINS.includes(body.terrain)) {
    errors.push('Please select a valid terrain');
  }

  if (!VALID_TRAFFIC_LEVELS.includes(body.traffic)) {
    errors.push('Please select a valid traffic level');
  }

  if (body.advanced && body.advanced.tripDistanceKm !== undefined) {
    const tripDistance = Number(body.advanced.tripDistanceKm);
    if (Number.isNaN(tripDistance) || tripDistance <= 0) {
      errors.push('Trip distance must be a positive number');
    }
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateCalculateInput,
};
