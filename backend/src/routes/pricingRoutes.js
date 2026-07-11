// backend/src/routes/pricingRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  calculateOnRoadPrice,
  calculateMultipleOnRoadPrices,
  getStatePricingRules,
  updateStatePricingRules,
} = require('../controllers/pricingController');

// Public routes
router.post('/calculate', calculateOnRoadPrice);
router.post('/calculate-multiple', calculateMultipleOnRoadPrices);

// Admin routes
router.get('/rules', protect, admin, getStatePricingRules);
router.put('/rules', protect, admin, updateStatePricingRules);

module.exports = router;