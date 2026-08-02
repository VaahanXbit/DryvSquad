// backend/src/tools/usedCarValuation/priceTrend.js
/*
================================================================================
File Name : priceTrend.js
Description : "Price Trend (Last 12 Months)" chart data. Currently backed
              by a DEMO generator (PRICE_TREND_DEMO_MONTHLY_MULTIPLIERS in
              config) — no live market-data source is wired in yet.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { PRICE_TREND_DEMO_MONTHLY_MULTIPLIERS } = require('./usedCarValuation.config');

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {number} estimatedValue - current estimated value, used as the trend's anchor point
 * @returns {Array<{ month: string, value: number }>} oldest -> newest, 12 points
 */
const generateDemoPriceTrend = (estimatedValue) => {
  const now = new Date();
  const points = PRICE_TREND_DEMO_MONTHLY_MULTIPLIERS.map((multiplier, index) => {
    const monthsAgo = PRICE_TREND_DEMO_MONTHLY_MULTIPLIERS.length - 1 - index;
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    return {
      month: MONTH_LABELS[date.getMonth()],
      value: round2(estimatedValue * multiplier),
    };
  });
  return points;
};

module.exports = { generateDemoPriceTrend };
