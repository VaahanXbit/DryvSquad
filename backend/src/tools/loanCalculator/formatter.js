/*
================================================================================
File Name : backend/src/tools/loanCalculator/formatter.js
Description : Turns the raw calculator.js output into the rounded response
              shape the API contract promises, plus an Indian-locale display
              string for each figure so the frontend never has to duplicate
              this formatting logic.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/**
 * @param {{ monthlyEmi: number, totalInterest: number, totalAmount: number }} raw
 * @returns {{
 *   monthlyEmi: number, totalInterest: number, totalAmount: number,
 *   formatted: { monthlyEmi: string, totalInterest: string, totalAmount: string }
 * }}
 */
function formatEmiResult({ monthlyEmi, totalInterest, totalAmount }) {
  const rounded = {
    monthlyEmi: Math.round(monthlyEmi),
    totalInterest: Math.round(totalInterest),
    totalAmount: Math.round(totalAmount),
  };

  return {
    ...rounded,
    formatted: {
      monthlyEmi: inrFormatter.format(rounded.monthlyEmi),
      totalInterest: inrFormatter.format(rounded.totalInterest),
      totalAmount: inrFormatter.format(rounded.totalAmount),
    },
  };
}

module.exports = { formatEmiResult };
