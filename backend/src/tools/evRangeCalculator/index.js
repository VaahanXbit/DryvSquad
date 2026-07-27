// backend/src/tools/evRangeCalculator/index.js
const route = require('./evRangeCalculator.route');
const controller = require('./evRangeCalculator.controller');
const service = require('./evRangeCalculator.service');
const validator = require('./evRangeCalculator.validator');
const config = require('./evRangeCalculator.config');
const dataExtraction = require('./evRangeCalculator.dataExtraction');
const reductionFactors = require('./evRangeCalculator.reductionFactors');
const tripAnalysis = require('./evRangeCalculator.tripAnalysis');
const costCalculation = require('./evRangeCalculator.costCalculation');
const aiInsight = require('./evRangeCalculator.aiInsight');

module.exports = {
  route,
  controller,
  service,
  validator,
  config,
  dataExtraction,
  reductionFactors,
  tripAnalysis,
  costCalculation,
  aiInsight,
};
