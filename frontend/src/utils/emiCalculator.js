// src/utils/emiCalculator.js
/*
================================================================================
File Name : emiCalculator.js
Description : Client-side EMI math for instant, no-network live calculation
              on the Auto Loan EMI Calculator page. Mirrors the exact same
              formula as backend/src/tools/loanCalculator/calculator.js so
              the two never disagree — the backend endpoint stays available
              for future server-side/integration use, but the page itself
              never waits on a network round trip to update the UI.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

/**
 * Standard reducing-balance EMI formula.
 * R = annualInterestRate / (12 * 100)
 * EMI = P * R * (1+R)^N / ((1+R)^N - 1)
 *
 * @param {Object} params
 * @param {number} params.loanAmount   - Principal, in rupees
 * @param {number} params.interestRate - Annual interest rate (%)
 * @param {number} params.tenureMonths - Tenure in months
 * @returns {{ monthlyEmi: number, totalInterest: number, totalAmount: number }}
 */
export function calculateEmi({ loanAmount, interestRate, tenureMonths }) {
  const P = Number(loanAmount) || 0;
  const N = Number(tenureMonths) || 0;
  const R = (Number(interestRate) || 0) / (12 * 100);

  if (P <= 0 || N <= 0) {
    return { monthlyEmi: 0, totalInterest: 0, totalAmount: 0 };
  }

  if (R === 0) {
    const monthlyEmi = P / N;
    return { monthlyEmi, totalInterest: 0, totalAmount: P };
  }

  const factor = Math.pow(1 + R, N);
  const monthlyEmi = (P * R * factor) / (factor - 1);
  const totalAmount = monthlyEmi * N;
  const totalInterest = totalAmount - P;

  return { monthlyEmi, totalInterest, totalAmount };
}

// Rounds the raw EMI result the same way the backend formatter does.
export function roundEmiResult({ monthlyEmi, totalInterest, totalAmount }) {
  return {
    monthlyEmi: Math.round(monthlyEmi),
    totalInterest: Math.round(totalInterest),
    totalAmount: Math.round(totalAmount),
  };
}

// Indian-locale currency formatting, e.g. 2031020 -> "₹20,31,020"
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(value) {
  return inrFormatter.format(Number(value) || 0);
}
