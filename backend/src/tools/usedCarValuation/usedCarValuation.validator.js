// backend/src/tools/usedCarValuation/usedCarValuation.validator.js
/*
================================================================================
File Name : usedCarValuation.validator.js
Description : Validates the shape/ranges of incoming request data (NOT
              vehicle data completeness — that's usedCarValuation.service.js
              reading the fetched Variant document).
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const {
  MIN_REGISTRATION_YEAR,
  MIN_OWNER_NUMBER,
  MAX_OWNER_NUMBER,
  MIN_KILOMETERS,
  MAX_KILOMETERS,
} = require('./constants');

/**
 * @param {Object} input
 * @returns {{ isValid: boolean, errors: string[] }}
 */
const validateValuationInput = (input) => {
  const errors = [];
  const body = input || {};
  const currentYear = new Date().getFullYear();

  // Registration Year is validated FIRST — every downstream field (Model,
  // Variant) depends on it. usedCarValuation.service.js additionally
  // rejects a variantId whose launch year is after this year (the
  // "2015 + XUV700" case) — that check needs the fetched Variant document
  // so it happens in the service, not here.
  const registrationYear = Number(body.registrationYear);
  if (Number.isNaN(registrationYear) || registrationYear < MIN_REGISTRATION_YEAR || registrationYear > currentYear) {
    errors.push(`Registration year must be between ${MIN_REGISTRATION_YEAR} and ${currentYear}`);
  }

  if (!body.variantId || typeof body.variantId !== 'string') {
    errors.push('Please select brand, model and variant');
  }

  if (!body.location || typeof body.location !== 'object' || !body.location.city || !String(body.location.city).trim()) {
    errors.push('Please set your location — used to estimate resale value for your area');
  }

  const kilometers = Number(body.kilometersDriven);
  if (Number.isNaN(kilometers) || kilometers < MIN_KILOMETERS || kilometers > MAX_KILOMETERS) {
    errors.push(`Kilometers driven must be between ${MIN_KILOMETERS} and ${MAX_KILOMETERS.toLocaleString('en-IN')}`);
  }

  const ownerNumber = Number(body.ownerNumber);
  if (Number.isNaN(ownerNumber) || ownerNumber < MIN_OWNER_NUMBER || ownerNumber > MAX_OWNER_NUMBER) {
    errors.push(`Owner number must be between ${MIN_OWNER_NUMBER} and ${MAX_OWNER_NUMBER}`);
  }

  // Advanced Details are entirely optional — only validate its shape if
  // the field was sent at all, never require it or any key inside it.
  if (body.advancedDetails !== undefined && body.advancedDetails !== null) {
    if (typeof body.advancedDetails !== 'object' || Array.isArray(body.advancedDetails)) {
      errors.push('Advanced details, if provided, must be a set of key-value selections');
    }
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateValuationInput,
};
