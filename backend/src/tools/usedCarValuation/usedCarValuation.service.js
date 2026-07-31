// backend/src/tools/usedCarValuation/usedCarValuation.service.js
/*
================================================================================
File Name : usedCarValuation.service.js
Description : Orchestrates the full valuation flow against EXISTING
              collections only — Brand -> Model -> Variant (same as
              evRangeCalculator) and Location (same as the site-wide
              location picker). No separate/duplicate dataset anywhere.

              Flow, per the product review (Registration Year FIRST so an
              impossible Year + Model combination can never be selected):

                Registration Year -> Brand -> Model (filtered by
                launchYear/discontinuedYear) -> Variant (NOT year-filtered
                — every variant of a valid Model loads normally) -> fetch
                complete Variant document -> use exShowroomPrice as Base
                Price -> resolve Location -> run every engine, including
                optional Advanced Details -> aggregate into the Final
                Formula + all dashboard sections.

              Model availability for a given year is:
                launchYear <= registrationYear
                AND (discontinuedYear is null OR registrationYear <= discontinuedYear)
              read directly from Model.launchYear / Model.discontinuedYear
              — see resolveLaunchYear() / resolveDiscontinuedYear() /
              isAvailableInYear() below, the only place this rule lives.

              Controller stays thin — every business rule lives in
              usedCarValuation.config.js or a single-purpose engine module,
              never duplicated here.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const Variant = require('../../models/Variant');
const Model = require('../../models/Model');
const Brand = require('../../models/Brand');
const Location = require('../../models/Location');

const { calculateAgeDepreciation } = require('./depreciationEngine');
const { calculateMileageImpact } = require('./mileageEngine');
const { calculateOwnershipAdjustment } = require('./ownerEngine');
const { calculateMarketAdjustment } = require('./marketAdjustment');
const { calculateOptionalAdjustments, FIELDS: OPTIONAL_ADJUSTMENT_FIELDS } = require('./optionalAdjustments');
const { buildValuationBreakdown } = require('./valuationBreakdown');
const { calculateConfidenceScore } = require('./confidenceScore');
const { calculateVehicleHealthScore } = require('./vehicleHealthScore');
const { calculateChannelComparison } = require('./channelComparison');
const { buildDepreciationSummary } = require('./depreciationSummary');
const { generateDemoPriceTrend } = require('./priceTrend');
const { findSimilarCars } = require('./similarCars');
const {
  PRICE_RANGE_SPREAD_PERCENT,
  CATEGORY_DEMAND_ADJUSTMENT,
  BRAND_RESALE_ADJUSTMENT,
  CONFIDENCE_PENALTIES,
} = require('./usedCarValuation.config');
const { ERROR_CODES, MESSAGES } = require('./constants');

const round2 = (value) => Math.round(value * 100) / 100;
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class ServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Launch-year resolution — the ONE place this tool decides "was this
// model available in the selected registration year?" Reads Model's
// `launchYear` and `discontinuedYear` fields directly — never hardcoded.
// ---------------------------------------------------------------------------
const resolveLaunchYear = (doc) => {
  const year = doc?.launchYear;
  return typeof year === 'number' && !Number.isNaN(year) ? year : null;
};

const resolveDiscontinuedYear = (doc) => {
  const year = doc?.discontinuedYear;
  return typeof year === 'number' && !Number.isNaN(year) ? year : null;
};

/**
 * A model is available for a given registration year when:
 *   launchYear <= registrationYear
 *   AND (discontinuedYear is null OR registrationYear <= discontinuedYear)
 * No launchYear on record -> don't block the model from showing; absence
 * of data should never silently hide an otherwise valid model.
 */
const isAvailableInYear = (doc, registrationYear) => {
  const launchYear = resolveLaunchYear(doc);
  if (launchYear === null) return true;
  if (launchYear > registrationYear) return false;

  const discontinuedYear = resolveDiscontinuedYear(doc);
  if (discontinuedYear !== null && registrationYear > discontinuedYear) return false;

  return true;
};

// ---------------------------------------------------------------------------
// Brand -> Model -> Variant lookups (dynamic, never hardcoded), filtered
// by Registration Year once one has been selected.
// ---------------------------------------------------------------------------

/** GET /brands — brands are never year-filtered; a brand can't "not exist" for a year. */
const listBrands = async () => {
  const brands = await Brand.find({}).sort({ name: 1 });
  return brands.map((b) => ({ id: String(b._id), name: b.name, icon: b.icon || b.brandIcon || null }));
};

/**
 * GET /models?brandId=&registrationYear=
 * Only models whose launchYear is on/before the selected registration
 * year are returned — a model launched after that year can never appear.
 * registrationYear is REQUIRED here (not optional-with-fallback) — a
 * missing/invalid year must never silently return every model
 * unfiltered, which was the actual root cause of invalid combinations
 * still being selectable.
 */
const listModels = async (brandId, registrationYear) => {
  if (!brandId) throw new ServiceError(ERROR_CODES.INVALID_INPUT, 'brandId is required');

  const year = Number(registrationYear);
  if (!registrationYear || Number.isNaN(year)) {
    throw new ServiceError(ERROR_CODES.INVALID_INPUT, 'A valid registrationYear is required to list models');
  }

  const models = await Model.find({ brandId }).sort({ name: 1 });
  const filtered = models.filter((m) => isAvailableInYear(m, year));

  return filtered.map((m) => ({
    id: String(m._id),
    name: m.name,
    image: m.image || null,
    bodyType: m.bodyType || null,
    launchYear: resolveLaunchYear(m),
  }));
};

/**
 * GET /variants?modelId=
 * Variants are NOT filtered by Registration Year — only Models are (the
 * Variant schema has no launchYear/discontinuedYear field of its own).
 * Once a valid, year-available Model has been selected, every variant
 * belonging to it loads normally.
 */
const listVariants = async (modelId) => {
  if (!modelId) throw new ServiceError(ERROR_CODES.INVALID_INPUT, 'modelId is required');

  const variants = await Variant.find({ modelId }).sort({ name: 1 });

  return variants.map((v) => ({
    id: String(v._id),
    name: v.name,
    fuelType: v.fuelType || null,
    exShowroomPrice: v.exShowroomPrice ?? null,
  }));
};

/**
 * Fetches a Variant by id ONCE, populated with Model + Brand, so every
 * downstream engine reads from the same in-memory document.
 */
const fetchVehicle = async (variantId) => {
  const variant = await Variant.findById(variantId).populate({
    path: 'modelId',
    populate: { path: 'brandId' },
  });

  if (!variant) {
    throw new ServiceError(ERROR_CODES.VARIANT_NOT_FOUND, MESSAGES.VARIANT_NOT_FOUND);
  }

  return variant;
};

// ---------------------------------------------------------------------------
// Location — reuses the EXISTING Location collection/site-wide location
// picker. No separate city list, dropdown data, or tier mapping.
// ---------------------------------------------------------------------------

const resolveLocation = async (input) => {
  const { locationId, city, state, stateCode, pincode } = input || {};
  let doc = null;

  if (locationId) doc = await Location.findById(locationId).lean();
  if (!doc && pincode) doc = await Location.findOne({ pincode }).lean();
  if (!doc && city && stateCode) {
    doc = await Location.findOne({ city: new RegExp(`^${escapeRegex(city)}$`, 'i'), stateCode }).lean();
  }
  if (!doc && city && state) {
    doc = await Location.findOne({
      city: new RegExp(`^${escapeRegex(city)}$`, 'i'),
      state: new RegExp(`^${escapeRegex(state)}$`, 'i'),
    }).lean();
  }
  if (!doc && city) {
    doc = await Location.findOne({ city: new RegExp(`^${escapeRegex(city)}$`, 'i') }).sort({ popularity: -1 }).lean();
  }

  if (doc) {
    return {
      city: doc.city,
      state: doc.state,
      stateCode: doc.stateCode,
      matched: true,
      marketAdjustment: doc.marketAdjustment ?? null,
      marketDemand: doc.marketDemand ?? null,
      averageAnnualKm: doc.averageAnnualKm ?? null,
      averageSellingDays: doc.averageSellingDays ?? null,
    };
  }

  if (!city) {
    throw new ServiceError(ERROR_CODES.INVALID_INPUT, 'A location is required to estimate a value.');
  }

  return {
    city,
    state: state || null,
    stateCode: stateCode || null,
    matched: false,
    marketAdjustment: null,
    marketDemand: null,
    averageAnnualKm: null,
    averageSellingDays: null,
  };
};

// ---------------------------------------------------------------------------
// Valuation
// ---------------------------------------------------------------------------

const valuateVehicle = async (input) => {
  const variantDoc = await fetchVehicle(input.variantId);
  const location = await resolveLocation(input.location || {});

  const model = variantDoc.modelId;
  const brand = model?.brandId;
  const registrationYear = Number(input.registrationYear);

  // ---- Highest-priority validation: reject impossible Year + Model combinations ----
  const modelLaunchYear = resolveLaunchYear(model);
  const modelDiscontinuedYear = resolveDiscontinuedYear(model);

  if (!isAvailableInYear(model, registrationYear)) {
    const reason = modelLaunchYear !== null && modelLaunchYear > registrationYear
      ? `${model?.name || 'This model'} was launched in ${modelLaunchYear}, which is after the selected registration year (${registrationYear}).`
      : `${model?.name || 'This model'} was discontinued in ${modelDiscontinuedYear}, before the selected registration year (${registrationYear}).`;
    throw new ServiceError(
      ERROR_CODES.INVALID_INPUT,
      `${reason} Please choose a different registration year or model.`
    );
  }

  const vehicleLabel = {
    id: String(variantDoc._id),
    brand: brand?.name || 'Unknown',
    model: model?.name || 'Unknown',
    variant: variantDoc.name,
    image: model?.image || null,
    category: model?.bodyType || null,
    fuelType: variantDoc.fuelType || null,
    launchYear: modelLaunchYear,
  };

  // ---- Step 1 — Base Price ----
  const basePrice = variantDoc.exShowroomPrice;
  if (!basePrice || Number.isNaN(Number(basePrice))) {
    throw new ServiceError(ERROR_CODES.MISSING_BASE_PRICE, MESSAGES.MISSING_BASE_PRICE);
  }

  const currentYear = new Date().getFullYear();
  const vehicleAge = Math.max(0, currentYear - registrationYear);

  // ---- Step 2 — Age Depreciation ----
  const ageResult = calculateAgeDepreciation(basePrice, vehicleAge);

  // ---- Step 3 — Mileage Engine (location's averageAnnualKm, if set, wins) ----
  const mileageResult = calculateMileageImpact(basePrice, vehicleAge, Number(input.kilometersDriven), vehicleLabel.category, location);

  // ---- Step 4 — Ownership Engine ----
  const ownerResult = calculateOwnershipAdjustment(basePrice, Number(input.ownerNumber));

  // ---- Step 5 — Market Adjustment (location + category + brand) ----
  const marketResult = calculateMarketAdjustment(basePrice, {
    location,
    category: vehicleLabel.category,
    brand: vehicleLabel.brand,
  });

  // ---- Step 6 — Optional Advanced Details (all optional; contributes 0 if none given) ----
  const optionalResult = calculateOptionalAdjustments(basePrice, input.advancedDetails || {});

  // ---- Final Formula + drawer rows (Why This Price?) ----
  const { estimatedValue, drawerRows } = buildValuationBreakdown(
    basePrice, ageResult, mileageResult, ownerResult, marketResult, optionalResult
  );

  // ---- Price Range ----
  const priceRange = {
    min: round2(estimatedValue * (1 - PRICE_RANGE_SPREAD_PERCENT)),
    max: round2(estimatedValue * (1 + PRICE_RANGE_SPREAD_PERCENT)),
  };

  // ---- Valuation Confidence — reflects trust in the ESTIMATE itself (data
  // quality, market coverage, predictability), never database completeness.
  // Purely a read of already-computed results + one lightweight catalog
  // lookup below — nothing here alters basePrice, estimatedValue, or any
  // calculation engine's output.
  const comparableVariantCount = await Variant.countDocuments({ modelId: model?._id, _id: { $ne: variantDoc._id } });

  const confidence = calculateConfidenceScore({
    // 1. Vehicle Identification
    hasExactBrand: Boolean(vehicleLabel.brand && vehicleLabel.brand !== 'Unknown'),
    hasExactModel: Boolean(vehicleLabel.model && vehicleLabel.model !== 'Unknown'),
    hasExactVariant: Boolean(vehicleLabel.variant),
    isInferredVehicle: false, // this tool always resolves an exact variant by id — never a "closest match" fallback

    // 2. Pricing Reliability
    hasOfficialPrice: true, // would have thrown MISSING_BASE_PRICE above otherwise
    hasVariantSpecificPrice: true, // exShowroomPrice read directly from this exact Variant document
    isWellCatalogedModel: Boolean(vehicleLabel.category),
    isSupportedSegment: Object.prototype.hasOwnProperty.call(CATEGORY_DEMAND_ADJUSTMENT, vehicleLabel.category),

    // 3. Market Reliability
    hasCityMarketAdjustment: location.matched,
    hasBrandResaleAdjustment: Object.prototype.hasOwnProperty.call(BRAND_RESALE_ADJUSTMENT, vehicleLabel.brand),
    hasCategoryDemandAdjustment: Object.prototype.hasOwnProperty.call(CATEGORY_DEMAND_ADJUSTMENT, vehicleLabel.category),

    // 4. Vehicle Predictability
    vehicleAgeYears: vehicleAge,
    kilometersDriven: Number(input.kilometersDriven),
    comparableVariantCount,
    isDiscontinuedModel: modelDiscontinuedYear !== null,
    isLuxuryBrand: CONFIDENCE_PENALTIES.predictability.luxuryBrand.brands.includes(vehicleLabel.brand),
    isCommercialCategory: CONFIDENCE_PENALTIES.predictability.commercialCategory.categories.includes(vehicleLabel.category),

    // 5. User Input Quality — required fields are the baseline (already
    // enforced by the validator); only the optional split matters here.
    optionalDetailsFilledCount: optionalResult.filledCount,
    optionalDetailsTotalCount: OPTIONAL_ADJUSTMENT_FIELDS.length,

    // 6. Valuation Execution Quality
    ageStageExecuted: true,
    mileageStageUsedRealNorm: Boolean(location.averageAnnualKm),
    ownershipStageExecuted: true,
    marketStageContributed: marketResult.totalRate !== 0,
    optionalStageContributed: optionalResult.filledCount > 0,
  });

  // ---- Vehicle Health Score ----
  const health = calculateVehicleHealthScore(input.advancedDetails || {});

  // ---- Market Demand + Expected Selling Time (straight from Location) ----
  const marketDemand = location.marketDemand || 'medium';
  const expectedSellingDays = location.averageSellingDays || null;

  // ---- Value Comparison ----
  const channelComparison = calculateChannelComparison(estimatedValue);

  // ---- Depreciation Summary ----
  const depreciationSummary = buildDepreciationSummary(basePrice, estimatedValue);

  // ---- Price Trend (demo generator today; swappable for live data later) ----
  const priceTrend = generateDemoPriceTrend(estimatedValue);

  // ---- Similar Cars ----
  let similarCars = [];
  try {
    similarCars = await findSimilarCars({
      variantId: variantDoc._id,
      modelId: model?._id,
      registrationYear,
      kilometersDriven: Number(input.kilometersDriven),
      city: location.city,
      valuePerVariant: (variant) => {
        // Reuses the SAME age/ownership-neutral estimate approach — a
        // lightweight re-application of the age factor to that variant's
        // own ex-showroom price, so the comparison stays proportionate
        // without duplicating the full engine pipeline for each row.
        const variantBase = variant.exShowroomPrice || basePrice;
        return variantBase * (estimatedValue / basePrice);
      },
    });
  } catch (err) {
    // Similar Cars is a "nice to have" dashboard section — never fail the
    // whole valuation if this lookup has trouble.
    console.error('⚠️ Similar cars lookup failed:', err);
    similarCars = [];
  }

  return {
    vehicle: vehicleLabel,
    estimatedValue: { amount: estimatedValue },
    priceRange,
    confidence,
    health,
    marketDemand,
    expectedSellingDays,
    channelComparison,
    depreciationSummary,
    priceTrend,
    similarCars,
    marketAdjustment: marketResult,
    drawerRows,
    inputs: {
      vehicleAge,
      registrationYear,
      city: location.city,
      kilometersDriven: Number(input.kilometersDriven),
      ownerNumber: Number(input.ownerNumber),
      ownershipLabel: ownerResult.ownershipLabel,
      advancedDetailsFilledCount: optionalResult.filledCount,
    },
  };
};

module.exports = {
  listBrands,
  listModels,
  listVariants,
  fetchVehicle,
  resolveLocation,
  valuateVehicle,
  ServiceError,
};