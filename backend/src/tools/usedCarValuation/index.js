// backend/src/tools/usedCarValuation/index.js
const route = require('./usedCarValuation.route');
const controller = require('./usedCarValuation.controller');
const service = require('./usedCarValuation.service');
const validator = require('./usedCarValuation.validator');
const config = require('./usedCarValuation.config');
const constants = require('./constants');
const depreciationEngine = require('./depreciationEngine');
const mileageEngine = require('./mileageEngine');
const ownerEngine = require('./ownerEngine');
const marketAdjustment = require('./marketAdjustment');
const optionalAdjustments = require('./optionalAdjustments');
const valuationBreakdown = require('./valuationBreakdown');
const confidenceScore = require('./confidenceScore');
const vehicleHealthScore = require('./vehicleHealthScore');
const channelComparison = require('./channelComparison');
const depreciationSummary = require('./depreciationSummary');
const priceTrend = require('./priceTrend');
const similarCars = require('./similarCars');

module.exports = {
  route,
  controller,
  service,
  validator,
  config,
  constants,
  depreciationEngine,
  mileageEngine,
  ownerEngine,
  marketAdjustment,
  optionalAdjustments,
  valuationBreakdown,
  confidenceScore,
  vehicleHealthScore,
  channelComparison,
  depreciationSummary,
  priceTrend,
  similarCars,
};
