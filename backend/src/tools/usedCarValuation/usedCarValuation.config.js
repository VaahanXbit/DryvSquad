// backend/src/tools/usedCarValuation/usedCarValuation.config.js
/*
================================================================================
File Name : usedCarValuation.config.js
Description : Every tunable number the valuation engine uses lives here —
              NEVER hardcoded inside an engine module. This is the single
              file the business edits when depreciation curves, mileage
              norms, ownership penalties or market adjustments change.
              Nothing below requires a code change to retune.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

// ---------------------------------------------------------------------------
// STEP 2 — Age Depreciation
// ---------------------------------------------------------------------------
// Year-by-year depreciation rate applied to the REMAINING value (declining
// balance), not to the original base price — this mirrors how vehicles
// actually lose value (steepest in year 1, flattening out later).
// Any year beyond the schedule falls back to AGE_DEPRECIATION_RATE_BEYOND.
const AGE_DEPRECIATION_SCHEDULE = [
  { year: 1, rate: 0.15, label: 'Year 1 depreciation' },
  { year: 2, rate: 0.12, label: 'Year 2 depreciation' },
  { year: 3, rate: 0.10, label: 'Year 3 depreciation' },
  { year: 4, rate: 0.09, label: 'Year 4 depreciation' },
  { year: 5, rate: 0.08, label: 'Year 5 depreciation' },
];

// Applied to every year beyond the schedule above (year 6 onward).
const AGE_DEPRECIATION_RATE_BEYOND = 0.06;

// Resale value never depreciates below this fraction of the original
// ex-showroom price, regardless of age — reflects scrap/parts value floor.
const MIN_REMAINING_VALUE_FACTOR = 0.15;

// ---------------------------------------------------------------------------
// STEP 3 — Mileage Engine
// ---------------------------------------------------------------------------
// Expected KM = Vehicle Age x AVERAGE_ANNUAL_KM (per body type, falls back
// to `default` when the vehicle's category isn't listed). A matched
// Location document's `averageAnnualKm` field, when set, takes priority
// over this table entirely — see mileageEngine.js.
const AVERAGE_ANNUAL_KM = {
  default: 12000,
  Hatchback: 10000,
  Sedan: 12000,
  SUV: 14000,
  MUV: 15000,
  Truck: 18000,
};

// Impact per 1,000 km of difference between Actual KM and Expected KM,
// expressed as a fraction of Base Price. Running MORE than expected costs
// more (penalty rate); running LESS than expected is worth less of a bonus
// (bonus rate) since low usage only partially offsets other wear factors.
const MILEAGE_PENALTY_RATE_PER_1000KM = 0.0025; // 0.25% of base price per 1000 km over
const MILEAGE_BONUS_RATE_PER_1000KM = 0.0015; // 0.15% of base price per 1000 km under

// Caps so a single outlier reading (e.g. odometer error) can't swing the
// valuation too far in either direction.
const MAX_MILEAGE_PENALTY_PERCENT = 0.15; // max 15% of base price
const MAX_MILEAGE_BONUS_PERCENT = 0.08; // max 8% of base price

// ---------------------------------------------------------------------------
// STEP 4 — Ownership Engine
// ---------------------------------------------------------------------------
// Adjustment as a fraction of base price, keyed by owner number. Anything
// beyond the highest key uses that key's value.
const OWNERSHIP_ADJUSTMENT = {
  1: 0,
  2: -0.05,
  3: -0.10,
  4: -0.13,
  5: -0.16,
};

const OWNERSHIP_LABELS = {
  1: '1st Owner',
  2: '2nd Owner',
  3: '3rd Owner',
  4: '4th Owner',
  5: '5th Owner or more',
};

// ---------------------------------------------------------------------------
// STEP 5 — Market Adjustment (Location + Category + Brand)
// ---------------------------------------------------------------------------
// City/location data is NOT configured here. It comes from the existing
// `Location` collection (models/Location.js), which has been extended with
// optional `marketAdjustment` / `marketDemand` / `averageAnnualKm` /
// `averageSellingDays` fields — see usedCarValuation.service.js's
// `resolveLocation()`. This fallback is only used when a matched Location
// document exists but hasn't had `marketAdjustment` tuned yet (still null).
const DEFAULT_LOCATION_MARKET_ADJUSTMENT = 0;

// Adjustment as a fraction of base price, keyed by vehicle body type
// (Model.bodyType from the vehicle document). Reflects relative resale
// demand for each body style. `default` covers any category not listed.
const CATEGORY_DEMAND_ADJUSTMENT = {
  SUV: 0.01,
  MUV: 0.005,
  Sedan: 0,
  Hatchback: -0.005,
  default: 0,
};

// Adjustment as a fraction of base price, keyed by brand name (exact match
// against Brand.name). Premium/luxury brands typically depreciate faster
// in the used market; mass-market brands with strong service networks
// tend to hold value better. `default` covers any brand not listed.
const BRAND_RESALE_ADJUSTMENT = {
  Honda: 0.02,
  Suzuki: 0.02,
  'Maruti Suzuki': 0.02,
  Hyundai: 0.01,
  Kia: 0.01,
  Tata: 0,
  Mahindra: 0,
  Jeep: -0.02,
  Audi: -0.04,
  BMW: -0.04,
  'Mercedes-Benz': -0.04,
  default: 0,
};

// ---------------------------------------------------------------------------
// Estimated Price Range
// ---------------------------------------------------------------------------
// The "Estimated Price Range" shown alongside the average value is the
// final value +/- this fraction.
const PRICE_RANGE_SPREAD_PERCENT = 0.05;

// ---------------------------------------------------------------------------
// Valuation Confidence — "Valuation Reliability Index"
// ---------------------------------------------------------------------------
// Represents how TRUSTWORTHY the estimated value is — never database
// completeness or how many fields were filled in. Modeled after how
// commercial valuation platforms (Cars24, Spinny, CarDekho, KBB, Edmunds)
// communicate confidence: start from a realistic ceiling (never 100 —
// this is a rule-based engine, not a transaction-backed statistical
// model) and subtract points for genuine uncertainty signals. See
// confidenceScore.js for how every signal below is applied; every
// threshold and point value lives here so retuning never touches code.
const CONFIDENCE_BASE_SCORE = 98; // ceiling — a perfect-signal valuation still tops out here, never 100
const CONFIDENCE_MIN_SCORE = 45; // floor — a valuation is still shown, just flagged clearly as low confidence

const CONFIDENCE_LABEL_BANDS = [
  { min: 93, label: 'High Confidence' },
  { min: 85, label: 'Good Confidence' },
  { min: 70, label: 'Medium Confidence' },
  { min: 0, label: 'Low Confidence' },
];

const CONFIDENCE_PENALTIES = {
  // 1. Vehicle Identification — inference/fallback vehicles are
  // meaningfully less trustworthy than an exact catalog match.
  vehicleIdentification: {
    missingBrand: 8,
    missingModel: 8,
    missingVariant: 6,
    inferredOrFallbackVehicle: 15, // reserved for a future "closest match" flow, unused today (this tool always resolves an exact variant)
  },

  // 2. Pricing Reliability — was the price official and variant-specific,
  // from a well-catalogued record in a supported segment?
  pricingReliability: {
    noOfficialPrice: 20, // would already fail before reaching confidence scoring; kept for completeness/extensibility
    noVariantSpecificPrice: 10, // price had to be estimated from the model/category rather than this exact variant
    poorlyCatalogedModel: 5, // no body category on record for this model
    unsupportedSegment: 4, // category has no dedicated demand-adjustment entry (falls back to `default`)
  },

  // 3. Market Reliability — how much of the Market Adjustment came from
  // real, tuned data vs. generic defaults.
  marketReliability: {
    noCityMarketAdjustment: 6, // selected location didn't match a seeded Location document
    noBrandResaleAdjustment: 3, // brand has no tuned resale entry (using `default`)
    noCategoryDemandAdjustment: 3, // category has no tuned demand entry (using `default`)
    allMarketDataGeneric: 2, // extra penalty when city, brand AND category are all untuned — no real market signal at all
  },

  // 4. Vehicle Predictability — not every vehicle is equally easy to
  // price accurately; normal mass-market vehicles with average mileage
  // should naturally land at the higher end.
  predictability: {
    ageYears: { moderateThreshold: 3, moderatePenalty: 2, oldThreshold: 10, oldPenalty: 5 }, // oldPenalty stacks on top of moderatePenalty past 10 years
    mileageKm: { highThreshold: 100000, highPenalty: 3, veryHighThreshold: 150000, veryHighPenalty: 4 }, // veryHighPenalty stacks past 150k
    rareVariant: { maxComparableForRare: 1, penalty: 4 }, // fewer than 2 sibling variants under the same model
    discontinuedModel: { penalty: 5 },
    luxuryBrand: { penalty: 6, brands: ['Audi', 'BMW', 'Mercedes-Benz'] },
    commercialCategory: { penalty: 5, categories: ['Truck'] },
  },

  // 5. User Input Quality — required fields are the baseline (already
  // enforced by the validator); optional Advanced Details only shave a
  // SMALL penalty, never grant a bonus above the base score.
  inputQuality: {
    noOptionalDetailsPenalty: 4, // none of the optional fields were filled
    partialOptionalDetailsMaxPenalty: 4, // scales down toward 0 as more optional fields are filled; fully filled = 0 penalty, never a bonus
  },

  // 6. Valuation Execution Quality — did every stage (age, mileage,
  // ownership, market, optional) contribute using real signal, or did
  // one silently fall through to a generic default?
  executionQuality: {
    maxPenalty: 4, // scaled by how many of the 5 stages executed with real (non-generic) data
  },

  // 7. Comparable Vehicle Availability — using the existing catalog as a
  // proxy today; swap the signal source for real transaction/listing
  // data later without changing this module's shape.
  comparableAvailability: {
    highThreshold: 5, // 5+ sibling variants under the same model -> no penalty
    mediumThreshold: 2, // 2-4 siblings -> small penalty
    mediumPenalty: 2,
    lowPenalty: 5, // fewer than 2 siblings
  },
};

// ---------------------------------------------------------------------------
// STEP 6 — Optional Advanced Details (Phase 2 fields, all optional)
// ---------------------------------------------------------------------------
// Each field maps a chosen option to a fraction-of-base-price adjustment.
// A field the user leaves blank contributes nothing — see
// optionalAdjustments.js. Adding a NEW optional field later (Interior
// Condition, Tyre Condition, Battery Health, etc.) means adding one more
// table here plus one line in optionalAdjustments.js — the core engine
// (depreciation/mileage/ownership/market) never changes.
const OPTIONAL_ADJUSTMENTS = {
  exteriorCondition: {
    label: 'Exterior Condition',
    options: {
      Excellent: 0.02,
      Good: 0,
      Fair: -0.03,
      Poor: -0.08,
    },
  },
  accidentHistory: {
    label: 'Accident History',
    options: {
      'No Accident': 0.01,
      'Minor Accident': -0.03,
      'Major Accident': -0.10,
    },
  },
  engineCondition: {
    label: 'Engine Condition',
    options: {
      Excellent: 0.02,
      Good: 0,
      Fair: -0.04,
      Poor: -0.10,
    },
  },
  serviceHistory: {
    label: 'Service History',
    options: {
      'Regularly Serviced': 0.015,
      'Partially Serviced': 0,
      'No Service Record': -0.03,
    },
  },
  insuranceStatus: {
    label: 'Insurance Status',
    options: {
      Active: 0.01,
      Expired: -0.01,
      'Not Available': -0.015,
    },
  },
  loanStatus: {
    label: 'Loan Status',
    options: {
      'No Loan': 0,
      'Loan Active': -0.02,
    },
  },
};

// ---------------------------------------------------------------------------
// Vehicle Health Score
// ---------------------------------------------------------------------------
// A 0-100 score built from whichever Advanced Details fields the user
// filled in (Exterior/Engine Condition, Accident/Service History). When
// none are filled, a neutral default score is shown instead of guessing.
const VEHICLE_HEALTH_SCORE_WEIGHTS = {
  exteriorCondition: 25,
  engineCondition: 30,
  accidentHistory: 25,
  serviceHistory: 20,
};

// Each option maps to a 0-100 sub-score contribution for its field.
const VEHICLE_HEALTH_SCORE_OPTIONS = {
  exteriorCondition: { Excellent: 100, Good: 80, Fair: 55, Poor: 25 },
  engineCondition: { Excellent: 100, Good: 80, Fair: 50, Poor: 20 },
  accidentHistory: { 'No Accident': 100, 'Minor Accident': 60, 'Major Accident': 20 },
  serviceHistory: { 'Regularly Serviced': 100, 'Partially Serviced': 65, 'No Service Record': 35 },
};

const DEFAULT_VEHICLE_HEALTH_SCORE = 75; // shown when no Advanced Details were provided at all

const VEHICLE_HEALTH_LABEL_BANDS = [
  { min: 85, label: 'Excellent' },
  { min: 65, label: 'Good' },
  { min: 45, label: 'Fair' },
  { min: 0, label: 'Needs Attention' },
];

// ---------------------------------------------------------------------------
// Value Comparison — Selling Channels
// ---------------------------------------------------------------------------
// Fraction applied to the final Estimated Value to approximate what each
// selling channel typically nets a seller. Config-driven so these can be
// retuned as real channel data becomes available, without touching the
// calculation module.
const CHANNEL_ADJUSTMENT = {
  dealerExchange: { label: 'Dealer Exchange', rate: -0.08 },
  directBuyer: { label: 'Direct Buyer', rate: 0 },
  onlineMarketplace: { label: 'Online Marketplace', rate: 0.04 },
  auction: { label: 'Auction', rate: -0.06 },
};

// ---------------------------------------------------------------------------
// Price Trend (Last 12 Months)
// ---------------------------------------------------------------------------
// DEMO data — a relative multiplier per month applied to the current
// Estimated Value to draw a plausible depreciation trend line until this
// tool is wired to a live market-data source. priceTrend.js is written so
// swapping this static generator for a live data source later requires no
// change to the response shape.
const PRICE_TREND_DEMO_MONTHLY_MULTIPLIERS = [
  1.10, 1.09, 1.07, 1.06, 1.045, 1.03, 1.02, 1.01, 1.00, 1.005, 1.00, 1.00,
];

// ---------------------------------------------------------------------------
// Similar Cars in Market
// ---------------------------------------------------------------------------
const SIMILAR_CARS_LIMIT = 3;
// DEMO listing-detail ranges (KM driven / days listed) since the vehicle
// catalog doesn't (yet) hold live used-listing data — see similarCars.js.
const SIMILAR_CARS_DEMO_KM_JITTER = { min: -15000, max: 15000 };
const SIMILAR_CARS_DEMO_DAYS_LISTED_RANGE = { min: 3, max: 20 };

module.exports = {
  AGE_DEPRECIATION_SCHEDULE,
  AGE_DEPRECIATION_RATE_BEYOND,
  MIN_REMAINING_VALUE_FACTOR,
  AVERAGE_ANNUAL_KM,
  MILEAGE_PENALTY_RATE_PER_1000KM,
  MILEAGE_BONUS_RATE_PER_1000KM,
  MAX_MILEAGE_PENALTY_PERCENT,
  MAX_MILEAGE_BONUS_PERCENT,
  OWNERSHIP_ADJUSTMENT,
  OWNERSHIP_LABELS,
  DEFAULT_LOCATION_MARKET_ADJUSTMENT,
  CATEGORY_DEMAND_ADJUSTMENT,
  BRAND_RESALE_ADJUSTMENT,
  PRICE_RANGE_SPREAD_PERCENT,
  CONFIDENCE_BASE_SCORE,
  CONFIDENCE_MIN_SCORE,
  CONFIDENCE_LABEL_BANDS,
  CONFIDENCE_PENALTIES,
  OPTIONAL_ADJUSTMENTS,
  VEHICLE_HEALTH_SCORE_WEIGHTS,
  VEHICLE_HEALTH_SCORE_OPTIONS,
  DEFAULT_VEHICLE_HEALTH_SCORE,
  VEHICLE_HEALTH_LABEL_BANDS,
  CHANNEL_ADJUSTMENT,
  PRICE_TREND_DEMO_MONTHLY_MULTIPLIERS,
  SIMILAR_CARS_LIMIT,
  SIMILAR_CARS_DEMO_KM_JITTER,
  SIMILAR_CARS_DEMO_DAYS_LISTED_RANGE,
};