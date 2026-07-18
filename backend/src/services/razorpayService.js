/*
================================================================================
File: backend/src/services/razorpayService.js
Responsibility: The ONLY file in the codebase that talks to the Razorpay SDK.
                Implements the common provider interface — createOrder() and
                verifyPayment() — that paymentService.js depends on. To add
                Stripe/Cashfree/PhonePe later, create a sibling file with the
                same two exports and register it in paymentService.js; this
                file and everything upstream of it stays untouched.
================================================================================
*/

const Razorpay = require('razorpay');
const { verifyRazorpaySignature } = require('../utils/signatureVerifier');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Creates a Razorpay order.
 * @param {Object} params
 * @param {number} params.amount   - amount in the currency's major unit (e.g. rupees)
 * @param {string} params.currency
 * @param {string} params.receipt  - internal reference (Payment._id)
 * @param {Object} params.notes    - arbitrary metadata Razorpay echoes back
 */
async function createOrder({ amount, currency, receipt, notes }) {
  const order = await razorpayInstance.orders.create({
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency,
    receipt,
    notes,
  });

  // The public key is attached here (not stored) purely so the frontend
  // checkout widget has what it needs — this is Razorpay's own requirement,
  // not something paymentService.js needs to know about.
  return { ...order, key: process.env.RAZORPAY_KEY_ID };
}

/**
 * Verifies a Razorpay checkout signature.
 */
function verifyPayment({ providerOrderId, providerPaymentId, providerSignature }) {
  return verifyRazorpaySignature({
    orderId: providerOrderId,
    paymentId: providerPaymentId,
    signature: providerSignature,
    secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

module.exports = { createOrder, verifyPayment };