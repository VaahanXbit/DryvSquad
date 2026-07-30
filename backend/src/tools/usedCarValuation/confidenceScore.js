// backend/src/tools/usedCarValuation/confidenceScore.js
/*
================================================================================
File Name : confidenceScore.js
Description : "Valuation Confidence" — how TRUSTWORTHY the estimated
              market value is, from the user's point of view. This is
              deliberately NOT "did we find a row in the database" (that
              was the old model, and it scored ~100% for almost every
              vehicle since a found row was nearly always fully populated
              — not a meaningful signal to show a user). It's rebuilt
              around four weighted categories, each scored independently
              so the number actually moves based on what's true about
              THIS specific valuation:

                1. Vehicle Identification (25%) — exact Brand, Model and
                   Variant match (not an inferred/fallback vehicle).
                2. Input Completeness (25%) — the required fields are
                   always present (enforced by the validator before this
                   ever runs), so they anchor a baseline; the remaining
                   weight is earned by how many OPTIONAL Advanced Details
                   fields the user actually filled in.
                3. Pricing Reliability (30%) — official ex-showroom price
                   present, and it belongs to an exact, well-catalogued
                   variant (has a known body category) rather than a thin
                   record.
                4. Market Coverage (20%) — how many of the valuation's
                   adjustment factors (age, mileage, ownership, location,
                   optional conditions) were backed by real, matched data
                   rather than a generic fallback default.

              Every weight and label band lives in
              usedCarValuation.config.js (CONFIDENCE_WEIGHTS /
              CONFIDENCE_LABEL_BANDS) — nothing here is a magic number.
              `factors` in the return value lists the individual
              user-facing reasons behind the score (what helped, what
              didn't) — written in plain language, never implementation
              detail like "database matching" — so a drawer/tooltip can
              surface them later without this module changing.

              Extensible by design: to fold in a future signal (e.g. real
              transaction data, live market trend confidence), add one
              more weighted category the same way these four are built —
              nothing else in the valuation engine needs to change.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { CONFIDENCE_WEIGHTS, CONFIDENCE_LABEL_BANDS } = require('./usedCarValuation.config');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const round1 = (value) => Math.round(value * 10) / 10;

const resolveLabel = (score) => {
  const band = CONFIDENCE_LABEL_BANDS.find((b) => score >= b.min);
  return band ? band.label : CONFIDENCE_LABEL_BANDS[CONFIDENCE_LABEL_BANDS.length - 1].label;
};

/**
 * @param {Object} signals
 * @param {boolean} signals.hasExactBrand - Brand resolved (not "Unknown")
 * @param {boolean} signals.hasExactModel - Model resolved (not "Unknown")
 * @param {boolean} signals.hasExactVariant - Variant name resolved
 * @param {boolean} signals.hasRegistrationYear
 * @param {boolean} signals.hasKilometersDriven
 * @param {boolean} signals.hasOwnership
 * @param {boolean} signals.hasCity
 * @param {number}  signals.optionalDetailsFilledCount - how many of the 6 Advanced Details fields were filled
 * @param {number}  signals.optionalDetailsTotalCount - total optional fields available (usually 6)
 * @param {boolean} signals.hasOfficialPrice - ex-showroom price present on the vehicle record
 * @param {boolean} signals.hasWellCatalogedVariant - variant belongs to a Model with a known body category (a thin/incomplete catalog entry lowers reliability)
 * @param {boolean} signals.ageAdjustmentApplied
 * @param {boolean} signals.mileageAdjustmentApplied
 * @param {boolean} signals.ownershipAdjustmentApplied
 * @param {boolean} signals.locationAdjustmentApplied - resolved against a matched Location document (not a generic city fallback)
 * @param {boolean} signals.optionalAdjustmentApplied - at least one Advanced Details field influenced the price
 * @returns {{ score: number, label: string, description: string, categories: Object, factors: string[] }}
 */
const calculateConfidenceScore = (signals) => {
  const {
    hasExactBrand, hasExactModel, hasExactVariant,
    hasRegistrationYear, hasKilometersDriven, hasOwnership, hasCity,
    optionalDetailsFilledCount = 0, optionalDetailsTotalCount = 6,
    hasOfficialPrice, hasWellCatalogedVariant,
    ageAdjustmentApplied, mileageAdjustmentApplied, ownershipAdjustmentApplied,
    locationAdjustmentApplied, optionalAdjustmentApplied,
  } = signals;

  const factors = [];

  // ---- 1. Vehicle Identification (25%) ----
  const idWeight = CONFIDENCE_WEIGHTS.vehicleIdentification;
  const idChecks = [hasExactBrand, hasExactModel, hasExactVariant];
  const idRatio = idChecks.filter(Boolean).length / idChecks.length;
  const vehicleIdentificationScore = idWeight * idRatio;
  if (idRatio === 1) {
    factors.push({ type: 'positive', text: 'Exact brand, model and variant were matched.' });
  } else {
    factors.push({ type: 'negative', text: 'Some vehicle details could not be exactly matched.' });
  }

  // ---- 2. Input Completeness (25%) — required fields anchor a baseline, optional details earn the rest ----
  const completenessWeight = CONFIDENCE_WEIGHTS.inputCompleteness;
  const requiredChecks = [hasRegistrationYear, hasKilometersDriven, hasOwnership, hasCity];
  const requiredRatio = requiredChecks.filter(Boolean).length / requiredChecks.length;
  const requiredShare = 0.7; // required fields can earn up to 70% of this category
  const optionalShare = 1 - requiredShare;
  const optionalRatio = optionalDetailsTotalCount > 0
    ? clamp(optionalDetailsFilledCount / optionalDetailsTotalCount, 0, 1)
    : 0;
  const inputCompletenessScore = completenessWeight * ((requiredRatio * requiredShare) + (optionalRatio * optionalShare));
  if (optionalDetailsFilledCount === 0) {
    factors.push({ type: 'negative', text: 'No optional condition details (Advanced Details) were provided — add them for a more precise estimate.' });
  } else if (optionalDetailsFilledCount < optionalDetailsTotalCount) {
    factors.push({ type: 'positive', text: `${optionalDetailsFilledCount} of ${optionalDetailsTotalCount} optional condition details were provided.` });
  } else {
    factors.push({ type: 'positive', text: 'All optional condition details were provided.' });
  }

  // ---- 3. Pricing Reliability (30%) ----
  const pricingWeight = CONFIDENCE_WEIGHTS.pricingReliability;
  const pricingChecks = [
    { pass: hasOfficialPrice, share: 0.65 },
    { pass: hasWellCatalogedVariant, share: 0.35 },
  ];
  const pricingRatio = pricingChecks.reduce((sum, c) => sum + (c.pass ? c.share : 0), 0);
  const pricingReliabilityScore = pricingWeight * pricingRatio;
  if (!hasOfficialPrice) {
    factors.push({ type: 'negative', text: 'Official ex-showroom pricing was not available for this exact vehicle.' });
  } else {
    factors.push({ type: 'positive', text: 'Based on official ex-showroom pricing for this exact variant.' });
  }
  if (!hasWellCatalogedVariant) {
    factors.push({ type: 'negative', text: 'Limited catalog information is available for this vehicle.' });
  }

  // ---- 4. Market Coverage (20%) ----
  const coverageWeight = CONFIDENCE_WEIGHTS.marketCoverage;
  const coverageChecks = [ageAdjustmentApplied, mileageAdjustmentApplied, ownershipAdjustmentApplied, locationAdjustmentApplied, optionalAdjustmentApplied];
  const coverageRatio = coverageChecks.filter(Boolean).length / coverageChecks.length;
  const marketCoverageScore = coverageWeight * coverageRatio;
  if (!locationAdjustmentApplied) {
    factors.push({ type: 'negative', text: 'Local market data for the selected city is limited — a general estimate was used instead.' });
  } else {
    factors.push({ type: 'positive', text: 'Local market data for the selected city was applied.' });
  }

  const score = Math.round(clamp(
    vehicleIdentificationScore + inputCompletenessScore + pricingReliabilityScore + marketCoverageScore,
    0, 100
  ));
  const label = resolveLabel(score);

  return {
    score,
    label,
    description: 'Reflects how trustworthy this estimate is, based on vehicle identification, the details you provided, pricing data, and market information available for your area.',
    categories: {
      vehicleIdentification: { weight: idWeight, score: round1(vehicleIdentificationScore) },
      inputCompleteness: { weight: completenessWeight, score: round1(inputCompletenessScore) },
      pricingReliability: { weight: pricingWeight, score: round1(pricingReliabilityScore) },
      marketCoverage: { weight: coverageWeight, score: round1(marketCoverageScore) },
    },
    // Plain-language reasons the score went up or down — safe to surface
    // directly in a UI (e.g. the "Why This Price?" drawer) without
    // exposing any implementation detail.
    factors: factors.map((f) => f.text),
  };
};

module.exports = {
  calculateConfidenceScore,
};