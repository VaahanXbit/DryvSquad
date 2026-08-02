// backend/src/tools/usedCarValuation/channelComparison.js
/*
================================================================================
File Name : channelComparison.js
Description : "Value Comparison" card — Dealer Exchange / Direct Buyer /
              Online Marketplace / Auction. Each channel's estimate is the
              final Estimated Value adjusted by a config-driven rate — see
              CHANNEL_ADJUSTMENT in usedCarValuation.config.js.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { CHANNEL_ADJUSTMENT } = require('./usedCarValuation.config');

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {number} estimatedValue
 * @returns {Array<{ channel: string, label: string, amount: number, rate: number }>}
 */
const calculateChannelComparison = (estimatedValue) => {
  return Object.entries(CHANNEL_ADJUSTMENT).map(([channel, { label, rate }]) => ({
    channel,
    label,
    amount: round2(estimatedValue * (1 + rate)),
    rate,
  }));
};

module.exports = { calculateChannelComparison };
