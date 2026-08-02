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

const AGE_DEPRECIATION_SCHEDULE = [
  { year: 1, rate: 0.15, label: 'Year 1 depreciation' },
  { year: 2, rate: 0.12, label: 'Year 2 depreciation' },
  { year: 3, rate: 0.10, label: 'Year 3 depreciation' },
  { year: 4, rate: 0.09, label: 'Year 4 depreciation' },
  { year: 5, rate: 0.08, label: 'Year 5 depreciation' },
];

// Applied to every year beyond the schedule above (year 6 onward).
const AGE_DEPRECIATION_RATE_BEYOND = 0.06;

// ex-showroom price, regardless of age — reflects scrap/parts value floor.
const MIN_REMAINING_VALUE_FACTOR = 0.15;

// ---------------------------------------------------------------------------
// STEP 3 — Mileage Engine
// ---------------------------------------------------------------------------
const AVERAGE_ANNUAL_KM = {
  default: 12000,
  Hatchback: 10000,
  Sedan: 12000,
  SUV: 14000,
  MUV: 15000,
  Truck: 18000,
};

const MILEAGE_PENALTY_RATE_PER_1000KM = 0.0025; // 0.25% of base price per 1000 km over
const MILEAGE_BONUS_RATE_PER_1000KM = 0.0015; // 0.15% of base price per 1000 km under

const MAX_MILEAGE_PENALTY_PERCENT = 0.15; // max 15% of base price
const MAX_MILEAGE_BONUS_PERCENT = 0.08; // max 8% of base price

// ---------------------------------------------------------------------------
// STEP 4 — Ownership Engine
// ---------------------------------------------------------------------------

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
const DEFAULT_LOCATION_MARKET_ADJUSTMENT = 0;

const CATEGORY_DEMAND_ADJUSTMENT = {
  SUV: 0.01,
  MUV: 0.005,
  Sedan: 0,
  Hatchback: -0.005,
  default: 0,
};

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

const PRICE_RANGE_SPREAD_PERCENT = 0.05;

// ---------------------------------------------------------------------------
// Valuation Confidence — Condition-Based Indicator (fixed 95 / 90 / 80)
// ---------------------------------------------------------------------------

const CONFIDENCE_LEVELS = {
  BEST: 95,
  MIXED: 90,
  POOR: 80,
};

const CONFIDENCE_LABELS = {
  95: 'High Confidence',
  90: 'Good Confidence',
  80: 'Low Confidence',
};

const CONFIDENCE_AGE_BANDS = {
  bestMaxYears: 3, // 0-3 years -> BEST
  averageMaxYears: 7, // 4-7 years -> AVERAGE; beyond -> POOR
};

// Owner Number
const CONFIDENCE_OWNER_BANDS = {
  bestMaxOwner: 1, // 1st owner -> BEST
  averageMaxOwner: 2, // 2nd owner -> AVERAGE; 3rd+ -> POOR
};

// Mileage — compared against Expected KM (Vehicle Age x Average Annual KM,
// from mileageEngine.js).
const CONFIDENCE_MILEAGE_TOLERANCE = {
  averageMaxOveragePercent: 0.20,
};

// Advanced Details 
const CONFIDENCE_CONDITION_BUCKETS = {
  exteriorCondition: { Excellent: 'BEST', Good: 'AVERAGE', Fair: 'POOR', Poor: 'POOR' },
  engineCondition: { Excellent: 'BEST', Good: 'AVERAGE', Fair: 'POOR', Poor: 'POOR' },
  accidentHistory: { 'No Accident': 'BEST', 'Minor Accident': 'AVERAGE', 'Major Accident': 'POOR' },
  serviceHistory: { 'Regularly Serviced': 'BEST', 'Partially Serviced': 'AVERAGE', 'No Service Record': 'POOR' },
  insuranceStatus: { Active: 'BEST', Expired: 'POOR', 'Not Available': 'POOR' },
  loanStatus: { 'No Loan': 'BEST', 'Loan Active': 'AVERAGE' },
};

// ---------------------------------------------------------------------------
// STEP 6 — Optional Advanced Details (Phase 2 fields, all optional)
// ---------------------------------------------------------------------------

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

const CHANNEL_ADJUSTMENT = {
  dealerExchange: { label: 'Dealer Exchange', rate: -0.08 },
  directBuyer: { label: 'Direct Buyer', rate: 0 },
  onlineMarketplace: { label: 'Online Marketplace', rate: 0.04 },
  auction: { label: 'Auction', rate: -0.06 },
};

// ---------------------------------------------------------------------------
// Price Trend (Last 12 Months)
// ---------------------------------------------------------------------------
const PRICE_TREND_DEMO_MONTHLY_MULTIPLIERS = [
  1.10, 1.09, 1.07, 1.06, 1.045, 1.03, 1.02, 1.01, 1.00, 1.005, 1.00, 1.00,
];

// ---------------------------------------------------------------------------
// Similar Cars in Market
// ---------------------------------------------------------------------------
const SIMILAR_CARS_LIMIT = 3;

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
  CONFIDENCE_LEVELS,
  CONFIDENCE_LABELS,
  CONFIDENCE_AGE_BANDS,
  CONFIDENCE_OWNER_BANDS,
  CONFIDENCE_MILEAGE_TOLERANCE,
  CONFIDENCE_CONDITION_BUCKETS,
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