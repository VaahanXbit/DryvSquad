/*
================================================================================
File: backend/src/utils/paymentValidator.js
Responsibility: Validates the two request shapes the Payment Module accepts
                (create-order, verify). Kept out of the controller so rules
                are testable in isolation and reusable if you ever add a
                second entry point (e.g. a webhook handler).
================================================================================
*/

const { RESOURCE_TYPES } = require('./paymentConstants');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

function validateCreateOrderInput(body) {
  const { resourceType, amount, currency } = body || {};

  if (!resourceType || !Object.values(RESOURCE_TYPES).includes(resourceType)) {
    throw new ValidationError(
      `resourceType is required and must be one of: ${Object.values(RESOURCE_TYPES).join(', ')}`
    );
  }

  if (amount === undefined || amount === null || isNaN(amount) || Number(amount) <= 0) {
    throw new ValidationError('amount is required and must be a positive number');
  }

  if (currency !== undefined && typeof currency !== 'string') {
    throw new ValidationError('currency must be a string (e.g. "INR")');
  }
}

function validateVerifyInput(body) {
  const { paymentId, providerOrderId, providerPaymentId, providerSignature } = body || {};

  if (!paymentId) throw new ValidationError('paymentId is required');
  if (!providerOrderId) throw new ValidationError('providerOrderId is required');
  if (!providerPaymentId) throw new ValidationError('providerPaymentId is required');
  if (!providerSignature) throw new ValidationError('providerSignature is required');
}

module.exports = { validateCreateOrderInput, validateVerifyInput, ValidationError };