// backend/src/controllers/pricingController.js
/*
================================================================================
File Name : pricingController.js
Description : GET /api/pricing — takes a variant + city/state (and
              optional loan/accessory selections) and returns the full
              on-road price breakdown.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const Variant = require('../models/Variant');
const Location = require('../models/Location');
const AccessoryOption = require('../models/AccessoryOption');
const { calculateOnRoadPrice } = require('../services/pricing/calculator');
const { resolveStateRule } = require('../services/pricing/stateRuleResolver');

/**
 * Shared resolution used by both the single and bulk endpoints: the
 * state rule, the optional city Location doc (for handling/logistics
 * overrides), and the optional selected AccessoryOption documents.
 */
const resolvePricingInputs = async ({ state, stateCode, city, accessoryIds }) => {
  const [{ rule, isFallback }, locationDoc, selectedAccessories] = await Promise.all([
    resolveStateRule({ state, stateCode }),
    city
      ? Location.findOne({
          city: new RegExp(`^${city}$`, 'i'),
          ...(state ? { state: new RegExp(`^${state}$`, 'i') } : {}),
        }).lean()
      : Promise.resolve(null),
    accessoryIds && accessoryIds.length > 0
      ? AccessoryOption.find({ _id: { $in: accessoryIds }, isActive: true }).lean()
      : Promise.resolve([]),
  ]);

  return { rule, isFallback, locationDoc, selectedAccessories };
};

// Accepts either a real array (JSON body) or a comma-separated string
// (query param) and normalizes to a clean array of non-empty IDs.
const parseAccessoryIds = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  return String(raw).split(',').map((s) => s.trim()).filter(Boolean);
};

const parseLoanRequired = (raw) => raw === true || raw === 'true' || raw === '1';

/**
 * GET /api/pricing?variantId=...&city=Hyderabad&state=Telangana&stateCode=TG
 *                  &loanRequired=true&accessoryIds=id1,id2
 */
exports.getOnRoadPrice = async (req, res) => {
  try {
    const { variantId, city, state, stateCode, loanRequired, accessoryIds } = req.query;

    if (!variantId) {
      return res.status(400).json({
        success: false,
        message: 'variantId is required',
      });
    }
    if (!state && !stateCode) {
      return res.status(400).json({
        success: false,
        message: 'state or stateCode is required to calculate on-road price',
      });
    }

    const variant = await Variant.findById(variantId).lean();
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }
    if (!variant.exShowroomPrice) {
      return res.status(422).json({
        success: false,
        message: 'This variant has no exShowroomPrice on record',
      });
    }

    const { rule, isFallback, locationDoc, selectedAccessories } = await resolvePricingInputs({
      state,
      stateCode,
      city,
      accessoryIds: parseAccessoryIds(accessoryIds),
    });

    const pricing = calculateOnRoadPrice({
      exShowroomPrice: variant.exShowroomPrice,
      fuelType: variant.fuelType,
      city,
      state: state || rule.state,
      stateRule: rule,
      locationDoc,
      loanRequired: parseLoanRequired(loanRequired),
      selectedAccessories,
    });

    return res.status(200).json({
      success: true,
      data: {
        variantId,
        ...pricing,
        stateRuleUsed: isFallback ? 'national-average-fallback' : rule.state,
      },
    });
  } catch (error) {
    console.error('❌ Get on-road price error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate on-road price',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/pricing/bulk
 * Body: { variantIds: [...], city, state, stateCode, loanRequired, accessoryIds }
 * Used by pages that need on-road price for multiple variants at once
 * (e.g. Compare Cars) without N separate round trips. loanRequired and
 * accessoryIds apply uniformly to every variant in the batch.
 */
exports.getOnRoadPriceBulk = async (req, res) => {
  try {
    const { variantIds, city, state, stateCode, loanRequired, accessoryIds } = req.body;

    if (!Array.isArray(variantIds) || variantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'variantIds must be a non-empty array',
      });
    }
    if (!state && !stateCode) {
      return res.status(400).json({
        success: false,
        message: 'state or stateCode is required to calculate on-road price',
      });
    }

    const [variants, { rule, isFallback, locationDoc, selectedAccessories }] = await Promise.all([
      Variant.find({ _id: { $in: variantIds } }).lean(),
      resolvePricingInputs({ state, stateCode, city, accessoryIds: parseAccessoryIds(accessoryIds) }),
    ]);

    const data = variants.map((variant) => {
      if (!variant.exShowroomPrice) {
        return { variantId: String(variant._id), error: 'No exShowroomPrice on record' };
      }
      const pricing = calculateOnRoadPrice({
        exShowroomPrice: variant.exShowroomPrice,
        fuelType: variant.fuelType,
        city,
        state: state || rule.state,
        stateRule: rule,
        locationDoc,
        loanRequired: parseLoanRequired(loanRequired),
        selectedAccessories,
      });
      return { variantId: String(variant._id), ...pricing };
    });

    return res.status(200).json({
      success: true,
      stateRuleUsed: isFallback ? 'national-average-fallback' : rule.state,
      data,
    });
  } catch (error) {
    console.error('❌ Get bulk on-road price error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate on-road prices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/pricing/accessories
 * Lists the active accessory catalog so the frontend can render checkboxes
 * (Extended Warranty, RSA, Basic Kit, Accessories Package, ...).
 */
exports.getAccessories = async (req, res) => {
  try {
    const accessories = await AccessoryOption.find({ isActive: true }).sort({ category: 1, name: 1 }).lean();
    return res.status(200).json({ success: true, data: accessories });
  } catch (error) {
    console.error('❌ Get accessories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch accessories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
