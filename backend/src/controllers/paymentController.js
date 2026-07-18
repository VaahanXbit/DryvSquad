/*
================================================================================
File: backend/src/controllers/paymentController.js
Responsibility: Thin HTTP layer. Translates req/res <-> paymentService calls
                and forwards errors to your existing global error handler in
                app.js via next(err). Contains no business logic.
================================================================================
*/

const paymentService = require('../services/paymentService');
const { validateCreateOrderInput, validateVerifyInput } = require('../utils/paymentValidator');

// Adjust here if your auth middleware attaches the user differently.
function getUserId(req) {
  return req.user?._id || req.user?.id;
}

async function createOrder(req, res, next) {
  try {
    validateCreateOrderInput(req.body);
    const userId = getUserId(req);

    const { order, paymentId } = await paymentService.createOrder(userId, req.body);

    return res.status(201).json({ success: true, order, paymentId });
  } catch (err) {
    next(err);
  }
}

async function verify(req, res, next) {
  try {
    validateVerifyInput(req.body);
    const userId = getUserId(req);

    const payment = await paymentService.verifyPayment(userId, req.body);

    return res.status(200).json({ success: true, payment });
  } catch (err) {
    next(err);
  }
}

async function getStatus(req, res, next) {
  try {
    const userId = getUserId(req);
    const payment = await paymentService.getStatus(userId, req.params.paymentId);

    return res.status(200).json({ success: true, payment });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const userId = getUserId(req);
    const { page, limit, resourceType } = req.query;

    const result = await paymentService.getHistory(userId, { page, limit, resourceType });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, verify, getStatus, getHistory };