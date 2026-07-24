// src/services/evRangeCalculatorService.js
/*
================================================================================
File Name : evRangeCalculatorService.js
Description : API client for /api/tools/ev-range-calculator. Same
              plain-fetch pattern as services/api.js and the rest of the
              codebase — no axios, no React Query.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();

const handleResponse = async (response) => {
  try {
    const data = await response.json();
    return { ...data, httpStatus: response.status };
  } catch (error) {
    console.error('❌ EV range calculator response parsing error:', error);
    return { success: false, message: 'Server error. Please try again.', httpStatus: response.status };
  }
};

export const evRangeCalculatorService = {
  searchVehicles: async (search = '') => {
    try {
      const params = new URLSearchParams(search ? { search } : {});
      const response = await fetch(`${API_URL}/tools/ev-range-calculator/vehicles?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ EV vehicle search network error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  getTripDistance: async (from, to) => {
    try {
      const params = new URLSearchParams({ from, to });
      const response = await fetch(`${API_URL}/tools/ev-range-calculator/trip-distance?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Trip distance network error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  calculate: async (payload) => {
    try {
      const response = await fetch(`${API_URL}/tools/ev-range-calculator/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ EV range calculation network error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },
};

export default evRangeCalculatorService;
