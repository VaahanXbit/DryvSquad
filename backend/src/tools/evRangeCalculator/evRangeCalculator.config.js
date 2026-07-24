// backend/src/tools/evRangeCalculator/evRangeCalculator.config.js
/*
================================================================================
File Name : evRangeCalculator.config.js
Description : Every efficiency multiplier used by the calculation engine
              lives here — NOT hardcoded inside evRangeCalculator.service.js.
              This is the file your team recalibrates after real-world
              testing/telemetry, without touching any business logic.

              Multiplier meaning: 1.00 = no effect on range. Below 1.00 =
              reduces range by that percentage. Above 1.00 = slightly
              improves range (e.g. eco driving, light traffic).

              Every "neutral" bucket (the one matching typical/average
              conditions) is intentionally set to 1.00, so the Range
              Reduction Breakdown UI only surfaces factors that actually
              move the needle — matching the approved design, which never
              shows a reduction line for a condition that isn't hurting
              range.
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

// Bucketed by outside temperature in °C. `max` is exclusive.
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
// factor (i.e. 5+ passengers all use the "5" bucket below).
const PASSENGER_FACTORS = {
  1: 1.00,
  2: 0.99,
  3: 0.985,
  4: 0.98,
  5: 0.97,
};

// Used for "Recommended Max Trip Distance" — a safety margin subtracted
// from the estimated real-world range so the recommendation always leaves
// a buffer rather than cutting it exactly at empty.
const RECOMMENDED_TRIP_SAFETY_FACTOR = 0.895;

// Defaults for the fields that live inside the collapsed "Advanced
// Settings" panel (not itemized in the approved design mock, so sensible
// defaults are configured here — recalibrate freely).
const ADVANCED_SETTINGS_DEFAULTS = {
  tripDistanceKm: 220,
  homeChargingRatePerKwh: 8,
  publicChargingRatePerKwh: 20.7,
  reserveBatteryBufferPercent: 10,
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
  ADVANCED_SETTINGS_DEFAULTS,
};
