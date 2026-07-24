// backend/src/tools/evRangeCalculator/constants.js
/*
================================================================================
File Name : constants.js
Description : Shared constants for the EV Range Calculator module.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  VEHICLE_NOT_FOUND: 'VEHICLE_NOT_FOUND',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
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

// Placeholder city-to-city distances (km, one-way road distance) powering
// the Trip Planner's "From / To" fields. This is a mock lookup table — the
// intended swap-out point is a real routing provider (Google Maps Distance
// Matrix API, Mapbox Directions, etc). Only this table (or the function
// that reads it, in evRangeCalculator.service.js -> resolveTripDistance)
// needs to change when that's wired up.
const MOCK_CITY_DISTANCES_KM = {
  'delhi|jaipur': 281,
  'delhi|agra': 233,
  'delhi|chandigarh': 243,
  'delhi|lucknow': 555,
  'mumbai|pune': 149,
  'mumbai|surat': 284,
  'mumbai|goa': 588,
  'bengaluru|chennai': 346,
  'bengaluru|mysuru': 145,
  'bengaluru|hyderabad': 569,
  'chennai|pondicherry': 162,
  'kolkata|durgapur': 172,
  'pune|nashik': 210,
  'ahmedabad|vadodara': 110,
  'jaipur|udaipur': 393,
};

module.exports = {
  ERROR_CODES,
  VALID_ROAD_TYPES,
  VALID_DRIVING_STYLES,
  VALID_AC_MODES,
  VALID_TERRAINS,
  VALID_TRAFFIC_LEVELS,
  MIN_BATTERY_PERCENT,
  MAX_BATTERY_PERCENT,
  MIN_PASSENGERS,
  MAX_PASSENGERS,
  MOCK_CITY_DISTANCES_KM,
};
