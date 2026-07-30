// backend/src/tools/usedCarValuation/optionalAdjustments.js
/*
================================================================================
File Name : optionalAdjustments.js
Description : STEP 6 — Advanced Details (all optional). Reads whichever of
              exteriorCondition / accidentHistory / engineCondition /
              serviceHistory / insuranceStatus / loanStatus the user
              filled in and converts each into a { label, impact, reason }
              row, entirely from OPTIONAL_ADJUSTMENTS in
              usedCarValuation.config.js. Fields left blank contribute
              nothing — valuation works with zero, some, or all of them
              filled in.

              To add a new optional field later (Interior Condition, Tyre
              Condition, Battery Health, Documents, Accessories, etc.):
              add one table to OPTIONAL_ADJUSTMENTS in config, then one
              line to the `FIELDS` list below. The core valuation engine
              (depreciation/mileage/ownership/market) never changes.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { OPTIONAL_ADJUSTMENTS } = require('./usedCarValuation.config');

const round2 = (value) => Math.round(value * 100) / 100;

// The only place the set of supported optional fields is listed.
const FIELDS = [
  'exteriorCondition',
  'accidentHistory',
  'engineCondition',
  'serviceHistory',
  'insuranceStatus',
  'loanStatus',
];

/**
 * @param {number} basePrice
 * @param {Object} advancedDetails - e.g. { exteriorCondition: 'Good', accidentHistory: 'No Accident' }
 * @returns {{
 *   items: Array<{ field: string, label: string, selection: string, rate: number, impact: number, reason: string }>,
 *   totalAdjustmentAmount: number,
 *   filledCount: number
 * }}
 */
const calculateOptionalAdjustments = (basePrice, advancedDetails = {}) => {
  const items = [];
  let totalAdjustmentAmount = 0;

  FIELDS.forEach((field) => {
    const selection = advancedDetails?.[field];
    const fieldConfig = OPTIONAL_ADJUSTMENTS[field];
    if (!selection || !fieldConfig || !(selection in fieldConfig.options)) return;

    const rate = fieldConfig.options[selection];
    const impact = round2(rate * basePrice);
    totalAdjustmentAmount += impact;

    items.push({
      field,
      label: fieldConfig.label,
      selection,
      rate,
      impact,
      reason: `${fieldConfig.label}: ${selection}.`,
    });
  });

  return {
    items,
    totalAdjustmentAmount: round2(totalAdjustmentAmount),
    filledCount: items.length,
  };
};

module.exports = {
  calculateOptionalAdjustments,
  FIELDS,
};
