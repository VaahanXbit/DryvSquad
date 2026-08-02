// backend/src/tools/evRangeCalculator/evRangeCalculator.reductionFactors.js
/*
================================================================================
File Name : evRangeCalculator.reductionFactors.js
Description : Converts user-selected driving conditions into efficiency
              multipliers computes OverallEfficiency and builds the human-readable Range
              Reduction Breakdown, sorted highest-impact first.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const {
  ROAD_TYPE_FACTORS,
  TEMPERATURE_FACTOR_BANDS,
  SPEED_FACTOR_BANDS,
  DRIVING_STYLE_FACTORS,
  AC_FACTORS,
  TERRAIN_FACTORS,
  TRAFFIC_FACTORS,
  PASSENGER_FACTORS,
} = require('./evRangeCalculator.config');

const round1 = (value) => Math.round(value * 10) / 10;

const getBandFactor = (bands, value) => bands.find((b) => value < b.max) || bands[bands.length - 1];

const getPassengerFactor = (passengers) => {
  const keys = Object.keys(PASSENGER_FACTORS).map(Number).sort((a, b) => a - b);
  const cappedCount = Math.min(passengers, keys[keys.length - 1]);
  const matchedKey = keys.find((k) => k >= cappedCount) ?? keys[keys.length - 1];
  return PASSENGER_FACTORS[matchedKey];
};

const describeRoad = (roadType) => ({
  city: 'City driving',
  highway: 'Highway driving',
  mixed: 'Mixed road driving',
  hilly: 'Hilly roads',
}[roadType] || 'Road conditions');

const describeDrivingStyle = (style) => ({
  eco: 'Eco driving style',
  normal: 'Normal driving style',
  aggressive: 'Aggressive driving style',
}[style] || 'Driving style');

const describeAc = (ac) => ({
  off: 'AC off',
  mixed: 'AC used occasionally',
  on: 'AC is ON',
}[ac] || 'Air conditioning');

const describeTerrain = (terrain) => ({
  flat: 'Flat terrain',
  rolling: 'Rolling terrain',
  hilly: 'Hilly terrain',
}[terrain] || 'Terrain');

const describeTraffic = (traffic) => ({
  low: 'Light traffic',
  moderate: 'Moderate traffic',
  heavy: 'Heavy traffic',
}[traffic] || 'Traffic');

/**
 * Resolves every selected condition to a { label, insightPhrase, value }
 * factor and computes OverallEfficiency as their product.
 */
const resolveFactors = (input) => {
  const temperatureBand = getBandFactor(TEMPERATURE_FACTOR_BANDS, input.outsideTemperatureC);
  const speedBand = getBandFactor(SPEED_FACTOR_BANDS, input.averageSpeedKmh);
  const passengerFactor = getPassengerFactor(input.passengers);

  const factors = [
    { key: 'road', label: describeRoad(input.roadType), insightPhrase: describeRoad(input.roadType).toLowerCase(), value: ROAD_TYPE_FACTORS[input.roadType] },
    { key: 'speed', label: speedBand.label, insightPhrase: speedBand.label.toLowerCase(), value: speedBand.factor },
    { key: 'temperature', label: `${temperatureBand.label} (${input.outsideTemperatureC}°C)`, insightPhrase: `${temperatureBand.label.toLowerCase()} outside`, value: temperatureBand.factor },
    { key: 'terrain', label: describeTerrain(input.terrain), insightPhrase: describeTerrain(input.terrain).toLowerCase(), value: TERRAIN_FACTORS[input.terrain] },
    { key: 'drivingStyle', label: describeDrivingStyle(input.drivingStyle), insightPhrase: describeDrivingStyle(input.drivingStyle).toLowerCase(), value: DRIVING_STYLE_FACTORS[input.drivingStyle] },
    { key: 'ac', label: describeAc(input.airConditioning), insightPhrase: 'continuous air conditioning usage', value: AC_FACTORS[input.airConditioning] },
    { key: 'traffic', label: describeTraffic(input.traffic), insightPhrase: describeTraffic(input.traffic).toLowerCase(), value: TRAFFIC_FACTORS[input.traffic] },
    { key: 'passengers', label: `${input.passengers} Passenger${input.passengers > 1 ? 's' : ''}`, insightPhrase: 'extra passenger load', value: passengerFactor },
  ];

  const overallEfficiency = factors.reduce((product, f) => product * f.value, 1);

  return { factors, overallEfficiency, speedBand, temperatureBand };
};

/**
 * Builds the Range Reduction Breakdown — only factors that actually reduce
 * range (value < 1), sorted highest-impact first, per spec.
 */
const buildReductionBreakdown = (factors) => {
  return factors
    .filter((f) => f.value < 1)
    .map((f) => ({ label: f.label, insightPhrase: f.insightPhrase, reductionPercent: round1((1 - f.value) * 100) }))
    .sort((a, b) => b.reductionPercent - a.reductionPercent);
};

module.exports = {
  resolveFactors,
  buildReductionBreakdown,
};
