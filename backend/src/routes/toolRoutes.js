// backend/src/routes/toolRoutes.js
/*
================================================================================
File Name : toolRoutes.js
Description : Routes for the automotive calculators module (src/tools/).
              Only the Loan Calculator is live today; future calculators
              (Mileage, EV Range, Running Cost) get their own route lines
              here pointing at their own controller handler — nothing
              below the "Loan Calculator" section needs to change.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');

// ----- Loan Calculator -----
router.post('/loan/emi', toolController.calculateLoanEmi);


module.exports = router;
