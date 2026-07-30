// backend/src/tools/usedCarValuation/usedCarValuation.controller.js
/*
================================================================================
File Name : usedCarValuation.controller.js
Description : HTTP layer only. Thin by design — validates via the
              validator, delegates to the service, maps results/errors to
              HTTP responses. No business logic lives here.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { validateValuationInput } = require('./usedCarValuation.validator');
const {
  listBrands,
  listModels,
  listVariants,
  valuateVehicle,
  ServiceError,
} = require('./usedCarValuation.service');
const { ERROR_CODES } = require('./constants');

// GET /api/tools/used-car-valuation/brands
const getBrands = async (req, res) => {
  try {
    const brands = await listBrands();
    return res.status(200).json({ success: true, data: brands });
  } catch (error) {
    console.error('❌ Used car valuation — brand list error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong while loading brands.' });
  }
};

// GET /api/tools/used-car-valuation/models?brandId=&registrationYear=
const getModels = async (req, res) => {
  try {
    const models = await listModels(req.query.brandId, req.query.registrationYear);
    return res.status(200).json({ success: true, data: models });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(400).json({ success: false, message: error.message, errorCode: error.code });
    }
    console.error('❌ Used car valuation — model list error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong while loading models.' });
  }
};

// GET /api/tools/used-car-valuation/variants?modelId=
const getVariants = async (req, res) => {
  try {
    const variants = await listVariants(req.query.modelId);
    return res.status(200).json({ success: true, data: variants });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(400).json({ success: false, message: error.message, errorCode: error.code });
    }
    console.error('❌ Used car valuation — variant list error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong while loading variants.' });
  }
};

// POST /api/tools/used-car-valuation/valuate
const valuate = async (req, res) => {
  try {
    const { isValid, errors } = validateValuationInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
        errorCode: ERROR_CODES.INVALID_INPUT,
      });
    }

    const result = await valuateVehicle(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof ServiceError) {
      const status = error.code === ERROR_CODES.VARIANT_NOT_FOUND ? 404 : 422;
      return res.status(status).json({ success: false, message: error.message, errorCode: error.code });
    }

    console.error('❌ Used car valuation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while estimating the value. Please try again.',
      errorCode: ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = {
  getBrands,
  getModels,
  getVariants,
  valuate,
};
