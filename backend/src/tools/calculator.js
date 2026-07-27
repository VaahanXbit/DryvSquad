/*
================================================================================
File Name : backend/src/tools/loanCalculator/calculator.js
Description : Pure EMI math for the Auto Loan EMI Calculator. Deliberately
              has zero knowledge of Express, req/res, or the response
              envelope — it only knows loan numbers in, loan numbers out.
              That's what keeps it reusable (frontend live-calc mirrors this
              exact formula) and trivially unit-testable in isolation.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

/**
 * Standard reducing-balance EMI formula:
 *
 *   R   = annualInterestRate / (12 * 100)      (monthly rate, decimal)
 *   EMI = P * R * (1 + R)^N / ((1 + R)^N - 1)
 *
 * @param {Object} params
 * @param {number} params.loanAmount     - Principal (P), in rupees
 * @param {number} params.interestRate   - Annual interest rate (%), e.g. 8.5
 * @param {number} params.tenureMonths   - Tenure in months (N)
 * @returns {{ monthlyEmi: number, totalInterest: number, totalAmount: number }}
 *          Unrounded values — rounding/formatting is the formatter's job.
 */
function calculateEmi({ loanAmount, interestRate, tenureMonths }) {
  const P = Number(loanAmount);
  const N = Number(tenureMonths);
  const R = Number(interestRate) / (12 * 100);

  // Zero-interest edge case: EMI collapses to a straight-line split, and
  // the standard formula would divide by zero since (1+R)^N - 1 = 0.
  if (R === 0) {
    const monthlyEmi = P / N;
    return {
      monthlyEmi,
      totalInterest: 0,
      totalAmount: P,
    };
  }

  const factor = Math.pow(1 + R, N);
  const monthlyEmi = (P * R * factor) / (factor - 1);
  const totalAmount = monthlyEmi * N;
  const totalInterest = totalAmount - P;

  return { monthlyEmi, totalInterest, totalAmount };
}

module.exports = { calculateEmi };
