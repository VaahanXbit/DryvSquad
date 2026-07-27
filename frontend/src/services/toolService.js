// src/services/toolService.js
/*
================================================================================
File Name : toolService.js
Description : API client for the /api/tools module (automotive calculators).
              Follows the exact same pattern as services/api.js — plain
              fetch(), same handleResponse-style JSON parsing, same
              try/catch-returns-{success:false} error shape — so it's
              consistent with the rest of the codebase rather than a
              foreign axios-based file.

              Note: the Auto Loan EMI Calculator page itself uses
              utils/emiCalculator.js for instant client-side live updates
              (no network round trip per keystroke). This service exists so
              the backend endpoint is still reachable for future
              integrations (saved quotes, server-side validation, other
              tools that don't warrant client-only math, etc.).
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();

const handleResponse = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    console.error('❌ Tool response parsing error:', error);
    return { success: false, message: 'Server error. Please try again.' };
  }
};

export const toolService = {
  // ========================================
  // LOAN CALCULATOR
  // ========================================

  calculateLoanEmi: async ({ loanAmount, interestRate, tenureMonths }) => {
    try {
      const response = await fetch(`${API_URL}/tools/loan/emi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ loanAmount, interestRate, tenureMonths }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Loan EMI calculation error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },
};

export default toolService;
