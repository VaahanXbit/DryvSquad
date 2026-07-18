/*
================================================================================
File: backend/src/utils/paymentConstants.js
Responsibility: Single source of truth for every enum-like value the Payment
                Module uses. Adding a new resource type or provider means
                editing ONLY this file — nothing else in the module changes.
================================================================================
*/

const PAYMENT_STATUS = {
  CREATED: 'CREATED',   // Payment record created locally, provider order not yet confirmed
  PENDING: 'PENDING',   // Provider order created, waiting for user to pay
  SUCCESS: 'SUCCESS',   // Signature verified, payment complete
  FAILED: 'FAILED',     // Provider error or signature verification failed
  REFUNDED: 'REFUNDED', // Reserved for future refund support
};

const PAYMENT_PROVIDERS = {
  RAZORPAY: 'RAZORPAY',
  STRIPE: 'STRIPE',     // not implemented yet — reserved
  CASHFREE: 'CASHFREE', // not implemented yet — reserved
  PHONEPE: 'PHONEPE',   // not implemented yet — reserved
};

// Every feature that will ever charge a user must have an entry here.
// The Payment Module does not care what these mean — it only stores them.
const RESOURCE_TYPES = {
  PDF: 'PDF',
  AI_CHAT: 'AI_CHAT',
  MEMBERSHIP: 'MEMBERSHIP',
  REPORT: 'REPORT',
  LOAN: 'LOAN',
  INSURANCE: 'INSURANCE',
  FUTURE_FEATURE: 'FUTURE_FEATURE',
};

module.exports = { PAYMENT_STATUS, PAYMENT_PROVIDERS, RESOURCE_TYPES };