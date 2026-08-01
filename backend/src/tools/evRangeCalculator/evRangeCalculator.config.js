// backend/src/tools/evRangeCalculator/evRangeCalculator.config.js
/*
================================================================================
File Name : evRangeCalculator.config.js
Description :The configuration of the EV range data.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const ROAD_TYPE_FACTORS = {
  city: 1.00,
  highway: 0.88,
  mixed: 0.94,
  hilly: 0.85,
};

// Bucketed by outside temperature in °C. `max` is exclusive. Since the
// frontend now accepts any numeric temperature, this band table is what
// makes "any numeric temperature" resolve to a factor dynamically.
const TEMPERATURE_FACTOR_BANDS = [
  { max: 0, factor: 0.82, label: 'Freezing temperature' },
  { max: 10, factor: 0.90, label: 'Cold temperature' },
  { max: 25, factor: 1.00, label: 'Mild temperature' },
  { max: 35, factor: 0.98, label: 'Warm temperature' },
  { max: 40, factor: 0.97, label: 'High temperature' },
  { max: Infinity, factor: 0.90, label: 'Extreme temperature' },
];

// Bucketed by average speed in km/h. `max` is exclusive.
const SPEED_FACTOR_BANDS = [
  { max: 40, factor: 0.95, label: 'Low average speed (stop-go)' },
  { max: 80, factor: 1.00, label: 'Efficient cruising speed' },
  { max: 100, factor: 1.00, label: 'Highway cruising speed' },
  { max: 120, factor: 0.90, label: 'High speed driving' },
  { max: Infinity, factor: 0.82, label: 'Very high speed driving' },
];

const DRIVING_STYLE_FACTORS = {
  eco: 1.05,
  normal: 1.00,
  aggressive: 0.85,
};

const AC_FACTORS = {
  off: 1.00,
  mixed: 0.97,
  on: 0.95,
};

const TERRAIN_FACTORS = {
  flat: 1.00,
  rolling: 0.95,
  hilly: 0.94,
};

const TRAFFIC_FACTORS = {
  low: 1.02,
  moderate: 1.00,
  heavy: 0.90,
};

// Keyed by passenger count; anything above the highest key uses that key's
// factor.
const PASSENGER_FACTORS = {
  1: 1.00,
  2: 0.99,
  3: 0.985,
  4: 0.98,
  5: 0.97,
};

// Safety margin subtracted from the estimated real-world range for the
// "Recommended Max Trip Distance" card.
const RECOMMENDED_TRIP_SAFETY_FACTOR = 0.895;

// Charging rates used for Cost Estimate. These are business config (not a
// per-vehicle spec, and no longer a user-facing input per the latest
// review — the visible inputs are all driving-condition fields).
const CHARGING_RATES = {
  homeChargingRatePerKwh: 8,
  publicChargingRatePerKwh: 20.7,
};

module.exports = {
  ROAD_TYPE_FACTORS,
  TEMPERATURE_FACTOR_BANDS,
  SPEED_FACTOR_BANDS,
  DRIVING_STYLE_FACTORS,
  AC_FACTORS,
  TERRAIN_FACTORS,
  TRAFFIC_FACTORS,
  PASSENGER_FACTORS,
  RECOMMENDED_TRIP_SAFETY_FACTOR,
  CHARGING_RATES,
};
