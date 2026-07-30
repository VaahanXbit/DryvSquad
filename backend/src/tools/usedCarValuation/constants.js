// backend/src/tools/usedCarValuation/constants.js
/*
================================================================================
File Name : constants.js
Description : Shared constants for the Used Car Valuation module — error
              codes, user-facing messages, and request-shape limits. Business
              tuning values (rates, factors, adjustments) do NOT live here —
              those belong in usedCarValuation.config.js. This file only
              holds things that are structural, not something a business
              user would tune (matches the evRangeCalculator convention).
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  BRAND_NOT_FOUND: 'BRAND_NOT_FOUND',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  VARIANT_NOT_FOUND: 'VARIANT_NOT_FOUND',
  MISSING_BASE_PRICE: 'MISSING_BASE_PRICE',
  SERVER_ERROR: 'SERVER_ERROR',
};

const MESSAGES = {
  VARIANT_NOT_FOUND: 'Selected vehicle could not be found. Please choose brand, model and variant again.',
  MISSING_BASE_PRICE:
    'Original ex-showroom price is not available for this vehicle. We cannot estimate a resale value until this is added to the vehicle record.',
  INVALID_INPUT: 'Please check the details you entered and try again.',
};

const MIN_REGISTRATION_YEAR = 2000;
const MIN_OWNER_NUMBER = 1;
const MAX_OWNER_NUMBER = 5;
const MIN_KILOMETERS = 0;
const MAX_KILOMETERS = 500000;

module.exports = {
  ERROR_CODES,
  MESSAGES,
  MIN_REGISTRATION_YEAR,
  MIN_OWNER_NUMBER,
  MAX_OWNER_NUMBER,
  MIN_KILOMETERS,
  MAX_KILOMETERS,
};
