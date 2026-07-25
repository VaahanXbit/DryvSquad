// backend/src/tools/evRangeCalculator/evRangeCalculator.tripDistanceLookup.js
/*
================================================================================
File Name : evRangeCalculator.tripDistanceLookup.js
Description : Powers the Trip Planner's optional "From / To" convenience
              fields — resolves a rough city-to-city distance so the user
              doesn't have to know the exact km figure. This is a MOCK
              lookup table, separate from vehicle data (never touches the
              EV database). The canonical value the calculation engine
              actually uses is always the explicit Trip Distance field the
              user can see and edit directly.

              SWAP POINT: replace this lookup with a real routing provider
              (Google Maps Distance Matrix API, Mapbox Directions, etc.)
              when available — nothing else needs to change.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

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

/**
 * @param {string} from
 * @param {string} to
 * @returns {number|null}
 */
const resolveTripDistance = (from, to) => {
  const key = `${String(from).trim().toLowerCase()}|${String(to).trim().toLowerCase()}`;
  const reverseKey = `${String(to).trim().toLowerCase()}|${String(from).trim().toLowerCase()}`;
  return MOCK_CITY_DISTANCES_KM[key] ?? MOCK_CITY_DISTANCES_KM[reverseKey] ?? null;
};

module.exports = {
  resolveTripDistance,
};
