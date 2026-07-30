// backend/src/tools/usedCarValuation/usedCarValuation.route.js
/*
================================================================================
File Name : usedCarValuation.route.js
Description : Route definitions. Mount at /api/tools/used-car-valuation in
              app.js (same pattern as evRangeCalculator.route.js).
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const express = require('express');
const router = express.Router();
const controller = require('./usedCarValuation.controller');

router.get('/brands', controller.getBrands);
router.get('/models', controller.getModels);
router.get('/variants', controller.getVariants);
router.post('/valuate', controller.valuate);

module.exports = router;
