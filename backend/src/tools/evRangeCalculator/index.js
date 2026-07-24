// backend/src/tools/evRangeCalculator/index.js
/*
================================================================================
File Name : index.js
Description : Barrel export for the EV Range Calculator tools module.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const route = require('./evRangeCalculator.route');
const controller = require('./evRangeCalculator.controller');
const service = require('./evRangeCalculator.service');
const validator = require('./evRangeCalculator.validator');
const config = require('./evRangeCalculator.config');
const vehicles = require('./evRangeCalculator.vehicles');

module.exports = {
  route,
  controller,
  service,
  validator,
  config,
  vehicles,
};
