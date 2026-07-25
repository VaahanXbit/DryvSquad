// backend/src/tools/evRangeCalculator/constants.js
/*
================================================================================
File Name : constants.js
Description : Shared constants for the EV Range Calculator module, including
              the exact user-facing validation copy required by spec.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  VEHICLE_NOT_FOUND: 'VEHICLE_NOT_FOUND',
  NOT_ELECTRIC: 'NOT_ELECTRIC',
  MISSING_CLAIMED_RANGE: 'MISSING_CLAIMED_RANGE',
  SERVER_ERROR: 'SERVER_ERROR',
};

// Exact copy required by spec — surfaced as-is in API error responses so
// the frontend never has to hardcode/duplicate this wording.
const MESSAGES = {
  NOT_ELECTRIC: 'This calculator is available only for Electric Vehicles. Please select an EV model.',
  MISSING_CLAIMED_RANGE:
    "Official claimed driving range is not available for this vehicle. We cannot calculate an accurate real-world range until the manufacturer publishes this specification.",
  MISSING_BATTERY_CAPACITY:
    'Battery capacity information is unavailable for this EV. Some advanced calculations such as charging cost and energy usage may be unavailable.',
  MISSING_CHARGING_INFO:
    'Charging specifications are not available for this vehicle. Range estimation is still available. Charging recommendations cannot be calculated.',
  CHARGING_REQUIRED: 'Charging stop required before reaching your destination.',
  NO_CHARGING_REQUIRED: 'No charging required.',
};

const VALID_ROAD_TYPES = ['city', 'highway', 'mixed', 'hilly'];
const VALID_DRIVING_STYLES = ['eco', 'normal', 'aggressive'];
const VALID_AC_MODES = ['off', 'mixed', 'on'];
const VALID_TERRAINS = ['flat', 'rolling', 'hilly'];
const VALID_TRAFFIC_LEVELS = ['low', 'moderate', 'heavy'];

const MIN_BATTERY_PERCENT = 10;
const MAX_BATTERY_PERCENT = 100;
const MIN_PASSENGERS = 1;
const MAX_PASSENGERS = 7;
const MIN_TRIP_DISTANCE_KM = 1;
const MIN_TEMPERATURE_C = -30;
const MAX_TEMPERATURE_C = 55;

module.exports = {
  ERROR_CODES,
  MESSAGES,
  VALID_ROAD_TYPES,
  VALID_DRIVING_STYLES,
  VALID_AC_MODES,
  VALID_TERRAINS,
  VALID_TRAFFIC_LEVELS,
  MIN_BATTERY_PERCENT,
  MAX_BATTERY_PERCENT,
  MIN_PASSENGERS,
  MAX_PASSENGERS,
  MIN_TRIP_DISTANCE_KM,
  MIN_TEMPERATURE_C,
  MAX_TEMPERATURE_C,
};
