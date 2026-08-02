// backend/src/tools/usedCarValuation/ownerEngine.js
/*
================================================================================
File Name : ownerEngine.js
Description : Ownership Engine. Converts Owner Number into an
              Ownership Adjustment, entirely from
              usedCarValuation.config.js — first owners retain the most
              value, each subsequent owner reduces buyer confidence and
              resale value.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { OWNERSHIP_ADJUSTMENT, OWNERSHIP_LABELS } = require('./usedCarValuation.config');

const round2 = (value) => Math.round(value * 100) / 100;

const resolveOwnershipRate = (ownerNumber) => {
  const keys = Object.keys(OWNERSHIP_ADJUSTMENT).map(Number).sort((a, b) => a - b);
  const cappedOwner = Math.min(Math.max(ownerNumber, keys[0]), keys[keys.length - 1]);
  const matchedKey = keys.find((k) => k >= cappedOwner) ?? keys[keys.length - 1];
  return OWNERSHIP_ADJUSTMENT[matchedKey];
};

const resolveOwnershipLabel = (ownerNumber) => {
  const keys = Object.keys(OWNERSHIP_LABELS).map(Number).sort((a, b) => a - b);
  const cappedOwner = Math.min(Math.max(ownerNumber, keys[0]), keys[keys.length - 1]);
  const matchedKey = keys.find((k) => k >= cappedOwner) ?? keys[keys.length - 1];
  return OWNERSHIP_LABELS[matchedKey];
};

/**
 * @param {number} basePrice
 * @param {number} ownerNumber
 * @returns {{
 *   ownerNumber: number,
 *   ownershipLabel: string,
 *   rate: number,
 *   ownershipAdjustment: number,
 *   label: string,
 *   reason: string
 * }}
 */
const calculateOwnershipAdjustment = (basePrice, ownerNumber) => {
  const rate = resolveOwnershipRate(ownerNumber);
  const ownershipLabel = resolveOwnershipLabel(ownerNumber);
  const ownershipAdjustment = round2(Math.abs(rate) * basePrice);

  return {
    ownerNumber,
    ownershipLabel,
    rate,
    ownershipAdjustment,
    label: 'Ownership',
    reason: rate === 0
      ? 'First-owner vehicle — retains full ownership value.'
      : `${ownershipLabel} vehicle — resale value typically drops with each change of ownership.`,
  };
};

module.exports = {
  calculateOwnershipAdjustment,
  resolveOwnershipRate,
  resolveOwnershipLabel,
};
