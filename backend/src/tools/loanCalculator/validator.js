/*
================================================================================
File Name : backend/src/tools/loanCalculator/validator.js
Description : Validates input for POST /api/tools/loan/emi. Follows the same
              "throw a typed error with a statusCode, let the controller
              catch it" pattern already used by utils/paymentValidator.js.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

/**
 * Validates the EMI calculator request body.
 * @param {Object} body
 * @throws {ValidationError} if any field is missing or out of range
 */
function validateLoanInput(body = {}) {
  const { loanAmount, interestRate, tenureMonths } = body;

  if (loanAmount === undefined || loanAmount === null || loanAmount === '') {
    throw new ValidationError('loanAmount is required');
  }
  if (interestRate === undefined || interestRate === null || interestRate === '') {
    throw new ValidationError('interestRate is required');
  }
  if (tenureMonths === undefined || tenureMonths === null || tenureMonths === '') {
    throw new ValidationError('tenureMonths is required');
  }

  const amount = Number(loanAmount);
  const rate = Number(interestRate);
  const tenure = Number(tenureMonths);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new ValidationError('loanAmount must be a number greater than 0');
  }
  if (Number.isNaN(rate) || rate <= 0) {
    throw new ValidationError('interestRate must be a number greater than 0');
  }
  if (Number.isNaN(tenure) || tenure <= 0 || !Number.isInteger(tenure)) {
    throw new ValidationError('tenureMonths must be a whole number greater than 0');
  }

  return { loanAmount: amount, interestRate: rate, tenureMonths: tenure };
}

module.exports = { validateLoanInput, ValidationError };
