// backend/src/tools/evRangeCalculator/evRangeCalculator.tripDistanceLookup.js
/*
================================================================================
File Name : evRangeCalculator.tripDistanceLookup.js
Description :Provides a simple utility to look up predefined road 
            distances between supported city pairs (in both directions) for the EV Range Calculator, 
            returning the distance in kilometers or null if no match is found.
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
