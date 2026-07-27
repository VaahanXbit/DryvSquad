// backend/src/tools/evRangeCalculator/evRangeCalculator.service.js
/*
================================================================================
File Name : evRangeCalculator.service.js
Description : Orchestrates the full calculation. Fetches the Variant
              document ONCE (populated with Model + Brand), parses it ONCE
              via evRangeCalculator.dataExtraction.js, then runs every
              downstream step off that single cached EvSpecData object —
              no repeated DB calls, no repeated string parsing.

              Implements the algorithm exactly as specified:
                Step 1  Official Claimed Range — read from the database,
                        never modified (see dataExtraction.js for how it's
                        located/parsed from whatever fields already exist).
                Step 2  Every selected condition -> efficiency multiplier,
                        read from evRangeCalculator.config.js (see
                        evRangeCalculator.reductionFactors.js).
                Step 3  OverallEfficiency = product of every multiplier.
                Step 4  EstimatedPracticalRange = ClaimedRange x OverallEfficiency.
                Step 5  AvailableRange = EstimatedPracticalRange x (battery% / 100).
                        This is the single canonical "Estimated Real World
                        Range" used everywhere in the UI (headline, bar,
                        Claimed-vs-Estimated graph, Difference, Total
                        Reduction) — see the note above buildResult() for
                        why Total Reduction is measured against this value
                        rather than EstimatedPracticalRange.
                Step 6  Trip Possible vs Charging Required (evRangeCalculator.tripAnalysis.js)
                Step 7  RemainingBattery% (evRangeCalculator.tripAnalysis.js)

              Internal multipliers/formulas are NEVER included in any
              response — only human-readable labels and numbers.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const Variant = require('../../models/Variant');
const Model = require('../../models/Model');
const Brand = require('../../models/Brand');

const { extractEvSpecData } = require('./evRangeCalculator.dataExtraction');
const { resolveFactors, buildReductionBreakdown } = require('./evRangeCalculator.reductionFactors');
const { analyzeTrip } = require('./evRangeCalculator.tripAnalysis');
const { calculateTripCost } = require('./evRangeCalculator.costCalculation');
const { buildAiInsight } = require('./evRangeCalculator.aiInsight');
const { RECOMMENDED_TRIP_SAFETY_FACTOR } = require('./evRangeCalculator.config');
const { ERROR_CODES, MESSAGES } = require('./constants');

// Referencing the Model/Brand exports keeps Mongoose's schema registration
// happy when this file is required in isolation (e.g. in tests) before
// app.js has had a chance to register every model.
void Model;
void Brand;

class ServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Fetches a Variant by id ONCE, with Model + Brand populated, so every
 * downstream step reads from the same in-memory document (no repeated
 * queries, no repeated parsing).
 */
const fetchVehicle = async (vehicleId) => {
  const variant = await Variant.findById(vehicleId).populate({
    path: 'modelId',
    populate: { path: 'brandId' },
  });

  if (!variant) {
    throw new ServiceError(ERROR_CODES.VEHICLE_NOT_FOUND, 'Selected vehicle was not found');
  }

  return variant;
};

/**
 * Searches the existing Variant collection for Electric vehicles matching
 * a free-text query — this IS the EV database; no separate/duplicate EV
 * dataset is introduced.
 */
const searchElectricVehicles = async (search) => {
  const variantQuery = { fuelType: 'Electric' };

  const variants = await Variant.find(variantQuery)
    .populate({ path: 'modelId', populate: { path: 'brandId' } })
    .limit(200);

  const normalizedSearch = String(search || '').trim().toLowerCase();

  const results = variants
    .map((variant) => extractEvSpecData(variant))
    .filter((ev) => {
      if (!normalizedSearch) return true;
      const haystack = `${ev.manufacturer} ${ev.model} ${ev.variant}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });

  return results;
};

/**
 * Runs Steps 1-7 plus every derived card, given already-validated request
 * input and an already-fetched vehicle document.
 */
const calculateRange = async (input) => {
  const variantDoc = await fetchVehicle(input.vehicleId);
  const evData = extractEvSpecData(variantDoc); // parsed ONCE, reused for every step below

  if (!evData.isElectric) {
    throw new ServiceError(ERROR_CODES.NOT_ELECTRIC, MESSAGES.NOT_ELECTRIC);
  }

  // ---- Step 1 ----
  if (evData.officialClaimedRangeKm === null) {
    // Developer warning already logged inside dataExtraction.js.
    throw new ServiceError(ERROR_CODES.MISSING_CLAIMED_RANGE, MESSAGES.MISSING_CLAIMED_RANGE);
  }
  const claimedRangeKm = evData.officialClaimedRangeKm;

  // ---- Step 2 + 3 ----
  const { factors, overallEfficiency, speedBand } = resolveFactors(input);

  // ---- Step 4 ----
  const estimatedPracticalRangeKm = claimedRangeKm * overallEfficiency;

  // ---- Step 5 ----
  // This is the single number used everywhere downstream as "Estimated
  // Real World Range" — see the file header for why Total Reduction is
  // measured against this (battery-scaled) value rather than Step 4's
  // conditions-only value: it keeps the headline number, the progress
  // bar, the Claimed-vs-Estimated graph, the Difference figure, and Total
  // Reduction all derived from one shared number, so they can never drift
  // out of sync with each other.
  const availableRangeKm = estimatedPracticalRangeKm * (input.batteryPercent / 100);

  // ---- Step 6 & 7 ----
  const tripAnalysis = analyzeTrip(availableRangeKm, input.tripDistanceKm);

  // ---- Range Reduction Breakdown (condition factors only — battery level
  // is a separate, already-visible input, not a "reduction" being
  // explained here) ----
  const rangeReductionBreakdownInternal = buildReductionBreakdown(factors);
  const rangeReductionBreakdown = rangeReductionBreakdownInternal.map(({ label, reductionPercent }) => ({ label, reductionPercent }));

  // ---- Total Reduction — per spec's exact formula, measured against the
  // same availableRangeKm used everywhere else ----
  const totalReductionPercent = round1(((claimedRangeKm - availableRangeKm) / claimedRangeKm) * 100);

  const recommendedMaxTripDistanceKm = Math.round(availableRangeKm * RECOMMENDED_TRIP_SAFETY_FACTOR);
  const rangeBarPercent = clamp(round1((availableRangeKm / claimedRangeKm) * 100), 0, 100);

  // ---- Energy / cost (requires battery capacity — skipped gracefully if missing) ----
  let costEstimate = null;
  let usableBatteryUsedKwh = null;
  let energyCalculationAvailable = false;

  if (evData.batteryCapacityKwh !== null) {
    costEstimate = calculateTripCost({
      batteryCapacityKwh: evData.batteryCapacityKwh,
      estimatedPracticalRangeKm,
      tripDistanceKm: input.tripDistanceKm,
      availableRangeKm,
    });
    usableBatteryUsedKwh = costEstimate.energyUsedKwh;
    energyCalculationAvailable = true;
  }

  // ---- AI Insight — dynamic, from the same breakdown used on screen ----
  const aiInsight = buildAiInsight(rangeReductionBreakdownInternal, totalReductionPercent, speedBand, input);

  // Simple, transparent confidence heuristic — a UX signal, not a
  // statistical model. Reduced slightly further when charging/battery
  // data is incomplete, since some downstream numbers are then estimates
  // of a smaller, less-complete picture.
  let confidencePercent = clamp(97 - totalReductionPercent * 0.35, 70, 97);
  if (!energyCalculationAvailable) confidencePercent -= 5;
  if (!evData.hasChargingInfo) confidencePercent -= 3;
  confidencePercent = Math.round(clamp(confidencePercent, 60, 97));

  return {
    vehicle: {
      id: evData.id,
      manufacturer: evData.manufacturer,
      model: evData.model,
      variant: evData.variant,
      image: evData.image,
      batteryCapacityKwh: evData.batteryCapacityKwh,
      batteryType: evData.batteryType,
      chargingPort: evData.chargingPort,
      rangeStandard: evData.rangeStandard,
    },
    confidencePercent,
    claimedRangeKm: Math.round(claimedRangeKm),
    estimatedRealWorldRangeKm: Math.round(availableRangeKm),
    rangeBarPercent,
    recommendedMaxTripDistanceKm,
    estimatedBatteryAtDestinationPercent: tripAnalysis.remainingBatteryPercent,
    usableBatteryUsedKwh,
    rangeReductionBreakdown,
    totalReductionPercent,
    claimedVsEstimated: {
      claimedRangeKm: Math.round(claimedRangeKm),
      estimatedRangeKm: Math.round(availableRangeKm),
      differenceKm: Math.round(claimedRangeKm - availableRangeKm),
    },
    costEstimate,
    energyCalculationAvailable,
    chargingInfoAvailable: evData.hasChargingInfo,
    aiInsight,
    tripPlanner: {
      tripDistanceKm: input.tripDistanceKm,
      tripPossible: tripAnalysis.tripPossible,
      chargingRequired: tripAnalysis.chargingRequired,
      remainingBatteryPercent: tripAnalysis.remainingBatteryPercent,
      message: tripAnalysis.message,
    },
    warnings: {
      batteryCapacityMissing: !energyCalculationAvailable ? MESSAGES.MISSING_BATTERY_CAPACITY : null,
      chargingInfoMissing: !evData.hasChargingInfo ? MESSAGES.MISSING_CHARGING_INFO : null,
    },
  };
};

module.exports = {
  calculateRange,
  searchElectricVehicles,
  fetchVehicle,
  ServiceError,
};
