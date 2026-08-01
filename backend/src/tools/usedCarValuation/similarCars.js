// backend/src/tools/usedCarValuation/similarCars.js
/*
================================================================================
File Name : similarCars.js
Description : "Similar Cars in Market" table. Queries the SAME Variant/
              Model collections the rest of this tool uses — no separate
              dataset.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const Variant = require('../../models/Variant');
const {
  SIMILAR_CARS_LIMIT,
  SIMILAR_CARS_DEMO_KM_JITTER,
  SIMILAR_CARS_DEMO_DAYS_LISTED_RANGE,
} = require('./usedCarValuation.config');

const round2 = (value) => Math.round(value * 100) / 100;
const randomBetween = (min, max) => Math.round(min + Math.random() * (max - min));

/**
 * @param {{ variantId: string, modelId: string, brandName: string, registrationYear: number, kilometersDriven: number, city: string, valuePerVariant: (variant) => number }} params
 * @returns {Promise<Array<{ id: string, model: string, year: number, kilometersDriven: number, price: number, location: string, daysListed: number }>>}
 */
const findSimilarCars = async ({ variantId, modelId, registrationYear, kilometersDriven, city, valuePerVariant }) => {
  let candidates = await Variant.find({ modelId, _id: { $ne: variantId } })
    .populate('modelId')
    .limit(SIMILAR_CARS_LIMIT)
    .lean();

  if (candidates.length < SIMILAR_CARS_LIMIT) {
    const model = await require('../../models/Model').findById(modelId).lean();
    if (model?.brandId) {
      const extra = await Variant.find({ _id: { $ne: variantId, $nin: candidates.map((c) => c._id) } })
        .populate({ path: 'modelId', match: { brandId: model.brandId } })
        .limit(SIMILAR_CARS_LIMIT - candidates.length)
        .lean();
      candidates = candidates.concat(extra.filter((c) => c.modelId));
    }
  }

  return candidates.slice(0, SIMILAR_CARS_LIMIT).map((variant) => {
    const kmJitter = randomBetween(SIMILAR_CARS_DEMO_KM_JITTER.min, SIMILAR_CARS_DEMO_KM_JITTER.max);
    const daysListed = randomBetween(SIMILAR_CARS_DEMO_DAYS_LISTED_RANGE.min, SIMILAR_CARS_DEMO_DAYS_LISTED_RANGE.max);

    return {
      id: String(variant._id),
      variantId: String(variant._id),
      modelId: variant.modelId?._id ? String(variant.modelId._id) : null,
      brandId: variant.modelId?.brandId ? String(variant.modelId.brandId) : null,
      model: `${variant.modelId?.name || ''} ${variant.name || ''}`.trim(),
      year: registrationYear,
      kilometersDriven: Math.max(0, kilometersDriven + kmJitter),
      price: round2(valuePerVariant(variant)),
      location: city,
      daysListed,
    };
  });
};

module.exports = { findSimilarCars };
