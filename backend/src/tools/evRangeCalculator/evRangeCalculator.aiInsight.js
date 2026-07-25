// backend/src/tools/evRangeCalculator/evRangeCalculator.aiInsight.js
/*
================================================================================
File Name : evRangeCalculator.aiInsight.js
Description : Builds the single natural-language "AI Insight" sentence from
              whichever factors the user actually selected — never static
              text, never mentions internal formulas/multipliers. Purely a
              function of the same reduction breakdown every other card
              uses, so it can never disagree with them.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

/**
 * @param {Array<{insightPhrase: string, reductionPercent: number}>} breakdown - already sorted, highest first
 * @param {number} totalReductionPercent
 * @param {Object} speedBand
 * @param {Object} input
 * @returns {string}
 */
const buildAiInsight = (breakdown, totalReductionPercent, speedBand, input) => {
  if (!breakdown.length) {
    return "Today's conditions closely match ideal driving conditions, so your practical range is close to the manufacturer's claimed range.";
  }

  const top = breakdown.slice(0, 3).map((b) => b.insightPhrase);
  const conditionsPhrase = top.length > 1
    ? `${top.slice(0, -1).join(', ')} and ${top[top.length - 1]}`
    : top[0];

  let speedNote = '';
  if (speedBand.factor < 1 && input.averageSpeedKmh > 100) {
    speedNote = ` Driving at around 80 km/h instead of ${input.averageSpeedKmh} km/h could meaningfully improve your range.`;
  }

  return `Today's ${conditionsPhrase} reduced your practical driving range by approximately ${Math.round(totalReductionPercent)}%.${speedNote}`;
};

module.exports = {
  buildAiInsight,
};
