// backend/src/tools/evRangeCalculator/evRangeCalculator.controller.js
/*
================================================================================
File Name : evRangeCalculator.controller.js
Description : HTTP layer for the EV Range Calculator. Thin — validates via
              the validator, delegates to the service, maps results/errors
              to HTTP responses. No calculation logic or vehicle data here.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { searchVehicles } = require('./evRangeCalculator.vehicles');
const { validateCalculateInput } = require('./evRangeCalculator.validator');
const { calculateRange, resolveTripDistance, ServiceError } = require('./evRangeCalculator.service');
const { ERROR_CODES } = require('./constants');

// GET /api/tools/ev-range-calculator/vehicles?search=
const listVehicles = (req, res) => {
  const { search } = req.query;
  const vehicles = searchVehicles(search);
  return res.status(200).json({ success: true, data: vehicles });
};

// GET /api/tools/ev-range-calculator/trip-distance?from=&to=
const getTripDistance = (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({
      success: false,
      message: 'Both "from" and "to" are required',
      errorCode: ERROR_CODES.INVALID_INPUT,
    });
  }

  const distanceKm = resolveTripDistance(from, to);

  if (distanceKm === null) {
    return res.status(404).json({
      success: false,
      message: 'Could not resolve distance for this route. Please enter it manually.',
      errorCode: ERROR_CODES.ROUTE_NOT_FOUND,
    });
  }

  return res.status(200).json({ success: true, data: { from, to, distanceKm } });
};

// POST /api/tools/ev-range-calculator/calculate
const calculate = (req, res) => {
  try {
    const { isValid, errors } = validateCalculateInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
        errorCode: ERROR_CODES.INVALID_INPUT,
      });
    }

    const result = calculateRange(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof ServiceError) {
      const status = error.code === ERROR_CODES.VEHICLE_NOT_FOUND ? 404 : 400;
      return res.status(status).json({ success: false, message: error.message, errorCode: error.code });
    }

    console.error('❌ EV range calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while calculating your range. Please try again.',
      errorCode: ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = {
  listVehicles,
  getTripDistance,
  calculate,
};
