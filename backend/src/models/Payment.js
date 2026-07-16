/*
================================================================================
File: backend/src/models/Payment.js
Responsibility: The ONE schema every payment in the app is stored under —
                PDF, AI Chat, Membership, Loan, Insurance, future features.
                Feature identity lives only in resourceType/resourceId/
                metadata; this model contains zero feature-specific fields
                or logic, which is what makes it reusable forever.
================================================================================
*/

const mongoose = require('mongoose');
const { PAYMENT_STATUS, PAYMENT_PROVIDERS, RESOURCE_TYPES } = require('../utils/paymentConstants');

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // What this payment is FOR — supplied by the calling feature, never
    // interpreted by the module itself.
    resourceType: {
      type: String,
      required: true,
      enum: Object.values(RESOURCE_TYPES),
      index: true,
    },
    resourceId: { type: String, default: null },
    resourceName: { type: String, default: null },

    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: 'INR' },

    provider: {
      type: String,
      required: true,
      enum: Object.values(PAYMENT_PROVIDERS),
      default: PAYMENT_PROVIDERS.RAZORPAY,
    },

    providerOrderId: { type: String, required: true, index: true },
    providerPaymentId: { type: String, default: null },
    providerSignature: { type: String, default: null },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.CREATED,
      index: true,
    },

    // Free-form bag for feature-specific data (e.g. { questionCount: 3 }).
    // Stored and returned as-is; the module never reads it.
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    failureReason: { type: String, default: null },
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);