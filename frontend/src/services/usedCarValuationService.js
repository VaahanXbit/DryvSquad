// src/services/usedCarValuationService.js
/*
================================================================================
File Name : usedCarValuationService.js
Description : API client for /api/tools/used-car-valuation, plus a thin
              wrapper around the EXISTING site-wide location search
              endpoint (`/api/location/search`) for the Registration City
              field's searchable dropdown — no separate city API/dataset
              for this tool.
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
    console.error('❌ Used car valuation response parsing error:', error);
    return { success: false, message: 'Server error. Please try again.', httpStatus: response.status };
  }
};

export const usedCarValuationService = {
  getBrands: async () => {
    try {
      const response = await fetch(`${API_URL}/tools/used-car-valuation/brands`, {
        headers: { Accept: 'application/json' },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Brand list network error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  getModels: async (brandId, registrationYear) => {
    try {
      const params = new URLSearchParams({ brandId, registrationYear });
      const response = await fetch(`${API_URL}/tools/used-car-valuation/models?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Model list network error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  // No registrationYear param — variants are not year-filtered.
  getVariants: async (modelId) => {
    try {
      const params = new URLSearchParams({ modelId });
      const response = await fetch(`${API_URL}/tools/used-car-valuation/variants?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Variant list network error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  valuate: async (payload) => {
    try {
      const response = await fetch(`${API_URL}/tools/used-car-valuation/valuate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Valuation network error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  // Reuses the EXISTING site-wide location search endpoint
  // (controllers/locationController.js's searchLocations, mounted at
  // /api/location/search) — no per-tool city dataset or API.
  searchLocations: async (query, limit = 10) => {
    try {
      const params = new URLSearchParams({ q: query, limit: String(limit) });
      const response = await fetch(`${API_URL}/location/search?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Location search network error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },
};

export default usedCarValuationService;
