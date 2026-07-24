// backend/src/tools/evRangeCalculator/evRangeCalculator.route.js
/*
================================================================================
File Name : evRangeCalculator.route.js
Description : Route definitions for the EV Range Calculator tool.
              Mounted at /api/tools/ev-range-calculator in app.js.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const express = require('express');
const router = express.Router();
const controller = require('./evRangeCalculator.controller');

// GET /api/tools/ev-range-calculator/vehicles?search=
router.get('/vehicles', controller.listVehicles);

// GET /api/tools/ev-range-calculator/trip-distance?from=&to=
router.get('/trip-distance', controller.getTripDistance);

// POST /api/tools/ev-range-calculator/calculate
router.post('/calculate', controller.calculate);

module.exports = router;
