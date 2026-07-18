/*
================================================================================
File: backend/src/services/paymentService.js
Responsibility: The core of the Payment Module. Contains every piece of
                business logic common to ALL payments regardless of provider
                or calling feature — creating a record + provider order,
                verifying signatures, reading status/history. It NEVER
                branches on resourceType ("if AI_CHAT do X") — that decision
                belongs to the feature, not the module.
================================================================================
*/

const Payment = require('../models/Payment');
const razorpayService = require('./razorpayService');
const { PAYMENT_STATUS, PAYMENT_PROVIDERS } = require('../utils/paymentConstants');
const { ValidationError } = require('../utils/paymentValidator');

// Maps a provider name to its service module. Every provider module must
// expose { createOrder, verifyPayment }. This is the ONLY place you touch
// to plug in a new payment provider — nothing else in this file changes.
const PROVIDER_REGISTRY = {
  [PAYMENT_PROVIDERS.RAZORPAY]: razorpayService,
  // [PAYMENT_PROVIDERS.STRIPE]: require('./stripeService'),
  // [PAYMENT_PROVIDERS.CASHFREE]: require('./cashfreeService'),
  // [PAYMENT_PROVIDERS.PHONEPE]: require('./phonepeService'),
};

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}

function getProvider(providerName) {
  const provider = PROVIDER_REGISTRY[providerName];
  if (!provider) {
    const err = new Error(`Unsupported payment provider: ${providerName}`);
    err.statusCode = 400;
    throw err;
  }
  return provider;
}

async function createOrder(
  userId,
  {
    resourceType,
    resourceId,
    resourceName,
    amount,
    currency = 'INR',
    metadata = {},
    provider = PAYMENT_PROVIDERS.RAZORPAY,
  }
) {
  const providerService = getProvider(provider);

  // Create the local record first so we always have an audit trail, even
  // if the provider call itself fails.
  const payment = await Payment.create({
    userId,
    resourceType,
    resourceId,
    resourceName,
    amount,
    currency,
    provider,
    providerOrderId: 'PENDING',
    status: PAYMENT_STATUS.CREATED,
    metadata,
  });

  try {
    const order = await providerService.createOrder({
      amount,
      currency,
      receipt: payment._id.toString(),
      notes: { resourceType, resourceId: resourceId || '', paymentId: payment._id.toString() },
    });

    payment.providerOrderId = order.id;
    payment.status = PAYMENT_STATUS.PENDING;
    await payment.save();

    return { order, paymentId: payment._id.toString() };
  } catch (err) {
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = err.message;
    await payment.save();
    throw err;
  }
}

async function verifyPayment(userId, { paymentId, providerOrderId, providerPaymentId, providerSignature }) {
  const payment = await Payment.findById(paymentId);

  if (!payment) throw new NotFoundError('Payment not found');
  if (payment.userId.toString() !== userId.toString()) {
    throw new ForbiddenError('This payment does not belong to the current user');
  }
  if (payment.providerOrderId !== providerOrderId) {
    throw new ValidationError('providerOrderId does not match the order created for this payment');
  }

  const providerService = getProvider(payment.provider);
  const isValid = providerService.verifyPayment({ providerOrderId, providerPaymentId, providerSignature });

  if (!isValid) {
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = 'Signature verification failed';
    await payment.save();

    const err = new Error('Payment verification failed');
    err.statusCode = 400;
    throw err;
  }

  payment.status = PAYMENT_STATUS.SUCCESS;
  payment.providerPaymentId = providerPaymentId;
  payment.providerSignature = providerSignature;
  await payment.save();

  return payment;
}

async function getStatus(userId, paymentId) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new NotFoundError('Payment not found');
  if (payment.userId.toString() !== userId.toString()) {
    throw new ForbiddenError('This payment does not belong to the current user');
  }
  return payment;
}

async function getHistory(userId, { page = 1, limit = 20, resourceType } = {}) {
  const query = { userId };
  if (resourceType) query.resourceType = resourceType;

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Payment.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Payment.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

module.exports = { createOrder, verifyPayment, getStatus, getHistory };