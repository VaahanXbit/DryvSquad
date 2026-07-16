/*
================================================================================
File: backend/src/routes/paymentRoutes.js
Responsibility: Route wiring for the Payment Module, mounted at /api/payment
                in app.js. Reuses your EXISTING auth middleware — no new
                auth system is introduced.

NOTE: I don't have the contents of backend/src/middleware/auth.js, so this
      assumes it exports a function named `protect`, matching the common
      pattern in your controllers (authController.js, etc.). If your actual
      export is named differently (e.g. `authenticate`, `verifyToken`),
      rename the import below — it's a one-line change.
================================================================================
*/

const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, paymentController.createOrder);
router.post('/verify', protect, paymentController.verify);
router.get('/status/:paymentId', protect, paymentController.getStatus);
router.get('/history', protect, paymentController.getHistory);

module.exports = router;