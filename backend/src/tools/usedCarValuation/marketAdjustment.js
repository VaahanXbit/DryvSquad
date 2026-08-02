// backend/src/tools/usedCarValuation/marketAdjustment.js
/*
================================================================================
File Name : marketAdjustment.js
Description : Market Adjustment. Combines Location, Vehicle
              Category and Brand into a single adjustment.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const {
  DEFAULT_LOCATION_MARKET_ADJUSTMENT,
  CATEGORY_DEMAND_ADJUSTMENT,
  BRAND_RESALE_ADJUSTMENT,
} = require('./usedCarValuation.config');

const round2 = (value) => Math.round(value * 100) / 100;

const resolveLocationRate = (location) => {
  if (location && typeof location.marketAdjustment === 'number') {
    return location.marketAdjustment;
  }
  return DEFAULT_LOCATION_MARKET_ADJUSTMENT;
};

const resolveCategoryRate = (category) => CATEGORY_DEMAND_ADJUSTMENT[category] ?? CATEGORY_DEMAND_ADJUSTMENT.default;

const resolveBrandRate = (brand) => BRAND_RESALE_ADJUSTMENT[brand] ?? BRAND_RESALE_ADJUSTMENT.default;

/**
 * @param {number} basePrice
 * @param {{
 *   location: { city: string, state?: string, marketAdjustment?: number|null, marketDemand?: string|null, matched: boolean } | null,
 *   category: string,
 *   brand: string
 * }} params
 * @returns {{
 *   city: string, locationMatched: boolean, marketDemand: string|null, locationRate: number,
 *   category: string, categoryRate: number,
 *   brand: string, brandRate: number,
 *   totalRate: number,
 *   marketAdjustmentAmount: number,
 *   label: string,
 *   reason: string
 * }}
 */
const calculateMarketAdjustment = (basePrice, { location, category, brand }) => {
  const locationRate = resolveLocationRate(location);
  const categoryRate = resolveCategoryRate(category);
  const brandRate = resolveBrandRate(brand);

  const totalRate = locationRate + categoryRate + brandRate;
  const marketAdjustmentAmount = round2(totalRate * basePrice);

  const cityLabel = location?.city || 'your city';
  const direction = marketAdjustmentAmount >= 0 ? 'improves' : 'reduces';

  return {
    city: cityLabel,
    locationMatched: Boolean(location?.matched),
    marketDemand: location?.marketDemand ?? null,
    locationRate,
    category,
    categoryRate,
    brand,
    brandRate,
    totalRate: round2(totalRate),
    marketAdjustmentAmount,
    label: 'City & Market',
    reason: `Local demand in ${cityLabel} for ${category || 'this category'} vehicles ${direction} resale value.`,
  };
};

module.exports = {
  calculateMarketAdjustment,
  resolveLocationRate,
  resolveCategoryRate,
  resolveBrandRate,
};
