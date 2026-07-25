// backend/src/tools/evRangeCalculator/evRangeCalculator.route.js
/*
================================================================================
File Name : evRangeCalculator.route.js
Description : Route definitions. Mounted at /api/tools/ev-range-calculator
              in app.js. Unchanged endpoints from the previous version.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const express = require('express');
const router = express.Router();
const controller = require('./evRangeCalculator.controller');

router.get('/vehicles', controller.listVehicles);
router.get('/trip-distance', controller.getTripDistance);
router.post('/calculate', controller.calculate);

module.exports = router;
