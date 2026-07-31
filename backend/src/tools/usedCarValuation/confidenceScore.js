// backend/src/tools/usedCarValuation/confidenceScore.js
/*
================================================================================
File Name : confidenceScore.js
Description : "Valuation Confidence" — a Valuation Reliability Index, not
              a form-completion score. Answers ONE question: "how
              trustworthy is this estimated market value?" — modeled on
              how commercial valuation platforms (Cars24, Spinny,
              CarDekho, KBB, Edmunds) communicate confidence: start from a
              realistic ceiling (CONFIDENCE_BASE_SCORE, e.g. 98 — never
              100, since this is a rule-based engine, not a
              transaction-backed statistical model) and subtract points
              for genuine uncertainty signals. It never checks "does this
              field exist in the database" — every signal below reflects
              something a person actually cares about when deciding
              whether to trust a number.

              Seven signal groups, each independently penalized (every
              threshold/point value lives in CONFIDENCE_PENALTIES in
              usedCarValuation.config.js — nothing here is a magic
              number):

                1. Vehicle Identification  — exact match vs. inferred/fallback
                2. Pricing Reliability     — official, variant-specific, well-catalogued
                3. Market Reliability      — real city/brand/category data vs. generic defaults
                4. Vehicle Predictability  — age, mileage, rarity, luxury, discontinued, commercial
                5. User Input Quality      — required fields are the baseline; optional
                                             details only shave a SMALL penalty, never grant
                                             a bonus above the base score
                6. Execution Quality       — did every valuation stage contribute with real
                                             signal, or fall through to a generic default?
                7. Comparable Availability — catalog-derived today; swappable for real
                                             transaction/listing data later without this
                                             module's shape changing

              This module does NOT touch, read, or influence the
              estimated value, price range, or any calculation engine —
              it only interprets already-computed results as reliability
              signals. Extensible by design: a future signal (historical
              transactions, live market demand, dealer sales, a real
              statistical confidence interval/standard error, AI
              prediction uncertainty) plugs in as one more penalized
              group — the frontend response shape never needs to change.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const {
  CONFIDENCE_BASE_SCORE,
  CONFIDENCE_MIN_SCORE,
  CONFIDENCE_LABEL_BANDS,
  CONFIDENCE_PENALTIES,
} = require('./usedCarValuation.config');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const round1 = (value) => Math.round(value * 10) / 10;

const resolveLabel = (score) => {
  const band = CONFIDENCE_LABEL_BANDS.find((b) => score >= b.min);
  return band ? band.label : CONFIDENCE_LABEL_BANDS[CONFIDENCE_LABEL_BANDS.length - 1].label;
};

/**
 * @param {Object} signals
 * -- Vehicle Identification --
 * @param {boolean} signals.hasExactBrand
 * @param {boolean} signals.hasExactModel
 * @param {boolean} signals.hasExactVariant
 * @param {boolean} [signals.isInferredVehicle] - reserved for a future "closest match" flow
 * -- Pricing Reliability --
 * @param {boolean} signals.hasOfficialPrice
 * @param {boolean} signals.hasVariantSpecificPrice
 * @param {boolean} signals.isWellCatalogedModel - has a known body category on record
 * @param {boolean} signals.isSupportedSegment - category has a dedicated (non-`default`) demand-adjustment entry
 * -- Market Reliability --
 * @param {boolean} signals.hasCityMarketAdjustment - resolved against a matched Location document
 * @param {boolean} signals.hasBrandResaleAdjustment - brand has a dedicated (non-`default`) resale entry
 * @param {boolean} signals.hasCategoryDemandAdjustment - category has a dedicated (non-`default`) demand entry
 * -- Vehicle Predictability --
 * @param {number}  signals.vehicleAgeYears
 * @param {number}  signals.kilometersDriven
 * @param {number}  signals.comparableVariantCount - sibling variants under the same model
 * @param {boolean} signals.isDiscontinuedModel
 * @param {boolean} signals.isLuxuryBrand
 * @param {boolean} signals.isCommercialCategory
 * -- User Input Quality --
 * @param {number}  signals.optionalDetailsFilledCount
 * @param {number}  signals.optionalDetailsTotalCount
 * -- Execution Quality --
 * @param {boolean} signals.ageStageExecuted
 * @param {boolean} signals.mileageStageUsedRealNorm - a location-specific averageAnnualKm was used, not the generic body-type default
 * @param {boolean} signals.ownershipStageExecuted
 * @param {boolean} signals.marketStageContributed - the combined market adjustment was non-zero (some real signal found)
 * @param {boolean} signals.optionalStageContributed - at least one Advanced Details field influenced the price
 * @returns {{ score: number, label: string, description: string, positiveFactors: string[], negativeFactors: string[], breakdown: Object }}
 */
const calculateConfidenceScore = (signals) => {
  const P = CONFIDENCE_PENALTIES;
  const positiveFactors = [];
  const negativeFactors = [];
  const breakdown = {};

  let score = CONFIDENCE_BASE_SCORE;
  const deduct = (group, amount, reason) => {
    if (amount <= 0) return;
    score -= amount;
    breakdown[group] = (breakdown[group] || 0) + amount;
    negativeFactors.push(reason);
  };

  // ---- 1. Vehicle Identification ----
  if (!signals.hasExactBrand) deduct('vehicleIdentification', P.vehicleIdentification.missingBrand, 'The vehicle brand could not be exactly identified.');
  if (!signals.hasExactModel) deduct('vehicleIdentification', P.vehicleIdentification.missingModel, 'The vehicle model could not be exactly identified.');
  if (!signals.hasExactVariant) deduct('vehicleIdentification', P.vehicleIdentification.missingVariant, 'The exact variant could not be identified.');
  if (signals.isInferredVehicle) deduct('vehicleIdentification', P.vehicleIdentification.inferredOrFallbackVehicle, 'A closely-matched vehicle was used instead of an exact catalog match.');
  if (signals.hasExactBrand && signals.hasExactModel && signals.hasExactVariant && !signals.isInferredVehicle) {
    positiveFactors.push('Exact vehicle variant identified.');
  }

  // ---- 2. Pricing Reliability ----
  if (!signals.hasOfficialPrice) deduct('pricingReliability', P.pricingReliability.noOfficialPrice, 'Official manufacturer pricing was not available for this vehicle.');
  else positiveFactors.push('Official manufacturer pricing available.');
  if (!signals.hasVariantSpecificPrice) deduct('pricingReliability', P.pricingReliability.noVariantSpecificPrice, 'Pricing had to be estimated rather than read directly from this exact variant.');
  if (!signals.isWellCatalogedModel) deduct('pricingReliability', P.pricingReliability.poorlyCatalogedModel, 'Limited catalog information is available for this vehicle.');
  if (!signals.isSupportedSegment) deduct('pricingReliability', P.pricingReliability.unsupportedSegment, 'This vehicle segment has limited pricing coverage.');

  // ---- 3. Market Reliability ----
  const marketSignalsUsed = [signals.hasCityMarketAdjustment, signals.hasBrandResaleAdjustment, signals.hasCategoryDemandAdjustment];
  if (!signals.hasCityMarketAdjustment) deduct('marketReliability', P.marketReliability.noCityMarketAdjustment, 'Limited local market information is available for this area.');
  else positiveFactors.push('Local market adjustments applied.');
  if (!signals.hasBrandResaleAdjustment) deduct('marketReliability', P.marketReliability.noBrandResaleAdjustment, 'Generic resale assumptions were used for this brand.');
  if (!signals.hasCategoryDemandAdjustment) deduct('marketReliability', P.marketReliability.noCategoryDemandAdjustment, 'Generic demand assumptions were used for this vehicle category.');
  if (marketSignalsUsed.every((s) => !s)) {
    deduct('marketReliability', P.marketReliability.allMarketDataGeneric, 'Generic market assumptions were used where localized data was unavailable.');
  }

  // ---- 4. Vehicle Predictability ----
  const { ageYears, mileageKm, rareVariant, discontinuedModel, luxuryBrand, commercialCategory } = P.predictability;
  const age = signals.vehicleAgeYears ?? 0;
  if (age > ageYears.oldThreshold) {
    deduct('predictability', ageYears.moderatePenalty + ageYears.oldPenalty, 'This is an older vehicle, which makes resale value harder to predict precisely.');
  } else if (age > ageYears.moderateThreshold) {
    deduct('predictability', ageYears.moderatePenalty, 'This vehicle is a few years old, adding some uncertainty to the estimate.');
  } else {
    positiveFactors.push('Vehicle age falls within a well-predicted range.');
  }

  const km = signals.kilometersDriven ?? 0;
  if (km > mileageKm.veryHighThreshold) {
    deduct('predictability', mileageKm.highPenalty + mileageKm.veryHighPenalty, 'This vehicle has unusually high mileage.');
  } else if (km > mileageKm.highThreshold) {
    deduct('predictability', mileageKm.highPenalty, 'This vehicle has higher-than-typical mileage.');
  } else {
    positiveFactors.push('Mileage falls within an expected range for its age.');
  }

  if ((signals.comparableVariantCount ?? 0) <= rareVariant.maxComparableForRare) {
    deduct('predictability', rareVariant.penalty, 'This is a rare variant with few comparable vehicles.');
  }
  if (signals.isDiscontinuedModel) {
    deduct('predictability', discontinuedModel.penalty, 'This model has been discontinued, which adds resale uncertainty.');
  }
  if (signals.isLuxuryBrand) {
    deduct('predictability', luxuryBrand.penalty, 'Luxury vehicles typically have more volatile resale values.');
  }
  if (signals.isCommercialCategory) {
    deduct('predictability', commercialCategory.penalty, 'Market coverage for commercial vehicles is more limited.');
  }

  // ---- 5. User Input Quality — small effect only, never a bonus above base ----
  const totalOptional = signals.optionalDetailsTotalCount || 0;
  const filledOptional = signals.optionalDetailsFilledCount || 0;
  const filledRatio = totalOptional > 0 ? clamp(filledOptional / totalOptional, 0, 1) : 0;
  if (filledOptional === 0) {
    deduct('inputQuality', P.inputQuality.noOptionalDetailsPenalty, 'Some condition details were not provided.');
  } else if (filledRatio < 1) {
    deduct('inputQuality', round1(P.inputQuality.partialOptionalDetailsMaxPenalty * (1 - filledRatio)), 'Some condition details were not provided.');
    positiveFactors.push('Some vehicle condition details were provided.');
  } else {
    positiveFactors.push('All optional condition details were provided.');
  }

  // ---- 6. Valuation Execution Quality ----
  const executionChecks = [
    signals.ageStageExecuted,
    signals.mileageStageUsedRealNorm,
    signals.ownershipStageExecuted,
    signals.marketStageContributed,
    signals.optionalStageContributed,
  ];
  const executedRatio = executionChecks.filter(Boolean).length / executionChecks.length;
  if (executedRatio < 1) {
    deduct('executionQuality', round1(P.executionQuality.maxPenalty * (1 - executedRatio)), 'Some valuation factors used general assumptions instead of vehicle-specific data.');
  } else {
    positiveFactors.push('Multiple valuation factors were successfully analyzed.');
  }

  // ---- 7. Comparable Vehicle Availability ----
  const { highThreshold, mediumThreshold, mediumPenalty, lowPenalty } = P.comparableAvailability;
  const comparableCount = signals.comparableVariantCount ?? 0;
  if (comparableCount < mediumThreshold) {
    deduct('comparableAvailability', lowPenalty, 'Very few comparable vehicles are available for this model.');
  } else if (comparableCount < highThreshold) {
    deduct('comparableAvailability', mediumPenalty, 'A limited number of comparable vehicles are available for this model.');
  }

  const finalScore = Math.round(clamp(score, CONFIDENCE_MIN_SCORE, CONFIDENCE_BASE_SCORE));
  const label = resolveLabel(finalScore);

  return {
    score: finalScore,
    label,
    description: 'Reflects how trustworthy this estimate is, based on vehicle identification, pricing data quality, local market information, and how predictable this vehicle\u2019s resale value typically is.',
    positiveFactors,
    negativeFactors,
    // Per-group point deductions — not shown to users directly, kept for
    // internal QA/debugging and for future signals to extend cleanly.
    breakdown,
  };
};

module.exports = {
  calculateConfidenceScore,
};