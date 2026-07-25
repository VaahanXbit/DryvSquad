// backend/src/tools/evRangeCalculator/evRangeCalculator.controller.js
/*
================================================================================
File Name : evRangeCalculator.controller.js
Description : HTTP layer. Thin — validates via the validator, delegates to
              the service, maps results/errors (including the exact
              user-facing validation messages required by spec) to HTTP
              responses.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { validateCalculateInput } = require('./evRangeCalculator.validator');
const { calculateRange, searchElectricVehicles, ServiceError } = require('./evRangeCalculator.service');
const { resolveTripDistance } = require('./evRangeCalculator.tripDistanceLookup');
const { ERROR_CODES } = require('./constants');

// GET /api/tools/ev-range-calculator/vehicles?search=
const listVehicles = async (req, res) => {
  try {
    const vehicles = await searchElectricVehicles(req.query.search);
    return res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    console.error('❌ EV vehicle search error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong while loading vehicles.' });
  }
};

// GET /api/tools/ev-range-calculator/trip-distance?from=&to=
const getTripDistance = (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ success: false, message: 'Both "from" and "to" are required', errorCode: ERROR_CODES.INVALID_INPUT });
  }

  const distanceKm = resolveTripDistance(from, to);

  if (distanceKm === null) {
    return res.status(404).json({
      success: false,
      message: 'Could not resolve distance for this route. Please enter it manually.',
    });
  }

  return res.status(200).json({ success: true, data: { from, to, distanceKm } });
};

// POST /api/tools/ev-range-calculator/calculate
const calculate = async (req, res) => {
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

    const result = await calculateRange(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof ServiceError) {
      const status = error.code === ERROR_CODES.VEHICLE_NOT_FOUND ? 404 : 422;
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
