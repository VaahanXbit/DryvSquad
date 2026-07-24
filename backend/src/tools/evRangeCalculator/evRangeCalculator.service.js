// backend/src/tools/evRangeCalculator/evRangeCalculator.service.js
/*
================================================================================
File Name : evRangeCalculator.service.js
Description : The calculation engine. Implements the algorithm exactly as
              specified:

                Step 1  Read Official Claimed Range (never modified)
                Step 2  Convert each selected condition into an efficiency
                        multiplier (read from evRangeCalculator.config.js —
                        never hardcoded here)
                Step 3  OverallEfficiency = product of all multipliers
                Step 4  EstimatedPracticalRange = ClaimedRange x OverallEfficiency
                Step 5  AvailableRange = EstimatedPracticalRange x (battery% / 100)
                Step 6  Trip Possible vs Charging Required
                Step 7  RemainingBattery %, clamped 0-100

              Every other result card (Recommended Max Trip Distance, Usable
              Battery Used, Cost Estimate, AI Insight, Trip Planner) is
              layered on top of that same Step 1-7 output — nothing recomputes
              the base range differently. See README at the repo root for
              the full mapping of formula -> UI card.

              Internal multipliers/factors are NEVER included in any
              response payload — only human-readable labels and numbers the
              approved UI is allowed to show.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { findVehicleById } = require('./evRangeCalculator.vehicles');
const {
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
} = require('./evRangeCalculator.config');
const { ERROR_CODES, MOCK_CITY_DISTANCES_KM } = require('./constants');

class ServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const round1 = (value) => Math.round(value * 10) / 10;

const getBandFactor = (bands, value) => {
  const band = bands.find((b) => value < b.max) || bands[bands.length - 1];
  return band;
};

const getPassengerFactor = (passengers) => {
  const keys = Object.keys(PASSENGER_FACTORS).map(Number).sort((a, b) => a - b);
  const cappedCount = Math.min(passengers, keys[keys.length - 1]);
  const matchedKey = keys.find((k) => k >= cappedCount) ?? keys[keys.length - 1];
  return PASSENGER_FACTORS[matchedKey];
};

/**
 * Step 2 + Step 3 — resolves every condition to a factor and multiplies
 * them together. Also returns the individual (label, factor) pairs so the
 * breakdown/AI insight can be built from the SAME numbers used in the math
 * (single source of truth — the UI never recomputes anything itself).
 */
const resolveFactors = (input) => {
  const temperatureBand = getBandFactor(TEMPERATURE_FACTOR_BANDS, input.outsideTemperatureC);
  const speedBand = getBandFactor(SPEED_FACTOR_BANDS, input.averageSpeedKmh);
  const passengerFactor = getPassengerFactor(input.passengers);

  const factors = [
    { key: 'road', label: describeRoad(input.roadType), insightPhrase: describeRoad(input.roadType).toLowerCase(), value: ROAD_TYPE_FACTORS[input.roadType] },
    { key: 'temperature', label: `${temperatureBand.label} (${input.outsideTemperatureC}°C)`, insightPhrase: `${temperatureBand.label.toLowerCase()} outside`, value: temperatureBand.factor },
    { key: 'speed', label: speedBand.label, insightPhrase: speedBand.label.toLowerCase(), value: speedBand.factor },
    { key: 'drivingStyle', label: describeDrivingStyle(input.drivingStyle), insightPhrase: describeDrivingStyle(input.drivingStyle).toLowerCase(), value: DRIVING_STYLE_FACTORS[input.drivingStyle] },
    { key: 'ac', label: describeAc(input.airConditioning), insightPhrase: 'continuous air conditioning usage', value: AC_FACTORS[input.airConditioning] },
    { key: 'terrain', label: describeTerrain(input.terrain), insightPhrase: describeTerrain(input.terrain).toLowerCase(), value: TERRAIN_FACTORS[input.terrain] },
    { key: 'traffic', label: describeTraffic(input.traffic), insightPhrase: describeTraffic(input.traffic).toLowerCase(), value: TRAFFIC_FACTORS[input.traffic] },
    { key: 'passengers', label: `${input.passengers} Passenger${input.passengers > 1 ? 's' : ''}`, insightPhrase: 'extra passenger load', value: passengerFactor },
  ];

  const overallEfficiency = factors.reduce((product, f) => product * f.value, 1);

  return { factors, overallEfficiency };
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
 * Builds the human-readable Range Reduction Breakdown — only factors that
 * actually reduce range (value < 1) are shown, matching the approved
 * design where neutral/beneficial conditions don't get a line item.
 */
const buildReductionBreakdown = (factors) => {
  const items = factors
    .filter((f) => f.value < 1)
    .map((f) => ({ label: f.label, insightPhrase: f.insightPhrase, reductionPercent: round1((1 - f.value) * 100) }))
    .sort((a, b) => b.reductionPercent - a.reductionPercent);

  return items;
};

/**
 * Generates the natural-language AI Insight sentence from the top 2-3
 * reduction contributors. No formulas, multipliers or internal numbers are
 * ever surfaced here — human-readable only, per spec.
 */
const buildAiInsight = (breakdown, totalReductionPercent, speedBand, input) => {
  if (!breakdown.length) {
    return "Today's conditions closely match ideal driving conditions, so your practical range is close to the manufacturer's claimed range.";
  }

  const top = breakdown.slice(0, 3).map((b) => b.insightPhrase);
  const conditionsPhrase = top.length > 1
    ? `${top.slice(0, -1).join(', ')} and ${top[top.length - 1]}`
    : top[0];

  let speedNote = '';
  if (speedBand.factor < 1 && input.averageSpeedKmh > 100) {
    const suggestedSpeed = 80;
    speedNote = ` Driving at around ${suggestedSpeed} km/h instead of ${input.averageSpeedKmh} km/h could meaningfully improve your range.`;
  }

  return `Today's ${conditionsPhrase} reduce your practical range by around ${Math.round(totalReductionPercent)}% compared to the manufacturer's claimed range.${speedNote}`;
};

/**
 * Resolves a trip distance for the Trip Planner "From / To" fields using
 * the mock city-distance table. Falls back to null (unresolved) if the
 * route isn't in the table — the frontend then asks the user to enter the
 * distance manually via Advanced Settings.
 *
 * SWAP POINT: replace this lookup with a real routing provider call
 * (Google Maps Distance Matrix API, Mapbox Directions, etc) when available.
 * Nothing else in the engine needs to change.
 */
const resolveTripDistance = (from, to) => {
  const key = `${String(from).trim().toLowerCase()}|${String(to).trim().toLowerCase()}`;
  const reverseKey = `${String(to).trim().toLowerCase()}|${String(from).trim().toLowerCase()}`;
  return MOCK_CITY_DISTANCES_KM[key] ?? MOCK_CITY_DISTANCES_KM[reverseKey] ?? null;
};

/**
 * Runs the full Step 1-7 algorithm and assembles every result card's data.
 * @param {import('./evRangeCalculator.types').CalculateRangeInput} input
 * @returns {import('./evRangeCalculator.types').CalculateRangeResult}
 */
const calculateRange = (input) => {
  const vehicle = findVehicleById(input.vehicleId);
  if (!vehicle) {
    throw new ServiceError(ERROR_CODES.VEHICLE_NOT_FOUND, 'Selected vehicle was not found');
  }

  const advanced = { ...ADVANCED_SETTINGS_DEFAULTS, ...(input.advanced || {}) };

  // ---- Step 1 ----
  const claimedRangeKm = vehicle.officialClaimedRangeKm;

  // ---- Step 2 + 3 ----
  const { factors, overallEfficiency } = resolveFactors(input);
  const speedBand = getBandFactor(SPEED_FACTOR_BANDS, input.averageSpeedKmh);

  // ---- Step 4 ----
  const estimatedPracticalRangeKm = claimedRangeKm * overallEfficiency;

  // ---- Step 5 ----
  const availableRangeKm = estimatedPracticalRangeKm * (input.batteryPercent / 100);

  // ---- Step 6 & 7 (Trip Planner / trip feasibility) ----
  const tripDistanceKm = advanced.tripDistanceKm;
  const tripPossible = availableRangeKm >= tripDistanceKm;
  const remainingBatteryPercent = clamp(
    ((availableRangeKm - tripDistanceKm) / availableRangeKm) * 100,
    0,
    100
  );

  // ---- Derived result cards ----
  const kwhPerKm = vehicle.batteryCapacityKwh / estimatedPracticalRangeKm;
  const usableBatteryUsedKwh = round1(kwhPerKm * Math.min(tripDistanceKm, availableRangeKm));

  const recommendedMaxTripDistanceKm = Math.round(availableRangeKm * RECOMMENDED_TRIP_SAFETY_FACTOR);

  const estimatedBatteryAtDestinationPercent = Math.round(
    clamp(input.batteryPercent - (usableBatteryUsedKwh / vehicle.batteryCapacityKwh) * 100, 0, 100)
  );

  const rangeReductionBreakdown = buildReductionBreakdown(factors);
  const totalReductionPercent = round1((1 - overallEfficiency) * 100);

  const rangeBarPercent = clamp(round1((availableRangeKm / claimedRangeKm) * 100), 0, 100);

  const costEstimate = {
    tripDistanceKm,
    energyUsedKwh: usableBatteryUsedKwh,
    homeChargingCost: Math.round(usableBatteryUsedKwh * advanced.homeChargingRatePerKwh),
    publicChargingCost: Math.round(usableBatteryUsedKwh * advanced.publicChargingRatePerKwh),
    homeChargingRatePerKwh: advanced.homeChargingRatePerKwh,
    publicChargingRatePerKwh: advanced.publicChargingRatePerKwh,
  };

  // Simple, transparent confidence heuristic: starts high, nudged down as
  // conditions move further from "ideal" (bigger total reduction). Purely
  // a UX signal, not a statistical model.
  const confidencePercent = Math.round(clamp(97 - totalReductionPercent * 0.35, 70, 97));

  const aiInsight = buildAiInsight(rangeReductionBreakdown, totalReductionPercent, speedBand, input);
  const publicRangeReductionBreakdown = rangeReductionBreakdown.map(({ label, reductionPercent }) => ({ label, reductionPercent }));

  return {
    vehicle: {
      id: vehicle.id,
      manufacturer: vehicle.manufacturer,
      model: vehicle.model,
      variant: vehicle.variant,
      batteryCapacityKwh: vehicle.batteryCapacityKwh,
      drivetrain: vehicle.drivetrain,
      image: vehicle.image,
    },
    confidencePercent,
    claimedRangeKm: Math.round(claimedRangeKm),
    estimatedRealWorldRangeKm: Math.round(availableRangeKm),
    rangeBarPercent,
    estimatedBatteryAtDestinationPercent,
    recommendedMaxTripDistanceKm,
    usableBatteryUsedKwh,
    rangeReductionBreakdown: publicRangeReductionBreakdown,
    totalReductionPercent,
    claimedVsEstimated: {
      claimedRangeKm: Math.round(claimedRangeKm),
      estimatedRangeKm: Math.round(availableRangeKm),
      differenceKm: Math.round(claimedRangeKm - availableRangeKm),
    },
    costEstimate,
    aiInsight,
    tripPlanner: {
      tripDistanceKm,
      tripPossible,
      chargingRequired: !tripPossible,
      remainingBatteryPercent: Math.round(remainingBatteryPercent),
    },
  };
};

module.exports = {
  calculateRange,
  resolveTripDistance,
  ServiceError,
};
