// src/services/api.js
/*
================================================================================
File Name : api.js
Author : Tahseen Raza
Created Date : 2026-06-21
Description : API service for frontend-backend integration
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle response
const handleResponse = async (response) => {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Response parsing error:', error);
    return {
      success: false,
      message: 'Server error. Please try again.',
    };
  }
};

export const api = {
  // Admin login
  adminLogin: async (password) => {
    try {
      const response = await fetch(`${API_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Admin login error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Check if user exists (Email or Phone)
  checkUser: async (identifier) => {
    try {
      const response = await fetch(`${API_URL}/auth/check-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Check user error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Send OTP (Email or Phone)
  sendOTP: async (identifier, purpose = 'verify') => {
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ identifier, purpose }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Verify OTP (Email or Phone)
  verifyOTP: async (identifier, otp) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ identifier, otp }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Complete profile
  completeProfile: async (token, data) => {
    try {
      const response = await fetch(`${API_URL}/auth/complete-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Complete profile error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Verify Phone
  verifyPhone: async (token, data) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Verify phone error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Confirm Phone Verification
  confirmPhone: async (token, data) => {
    try {
      const response = await fetch(`${API_URL}/auth/confirm-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Confirm phone error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get current user
  getCurrentUser: async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // ========================================
  // CAR API
  // ========================================

  // Get all cars with full hierarchy (Brand → Model → Variant)
  getAllCars: async () => {
    try {
      const response = await fetch(`${API_URL}/cars`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get all cars error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get all brands
  getAllBrands: async () => {
    try {
      const response = await fetch(`${API_URL}/cars/brands`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get brands error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get models by brand slug
  getModelsByBrand: async (brandSlug) => {
    try {
      const response = await fetch(`${API_URL}/cars/brands/${brandSlug}/models`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get models error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get variants by model slug
  getVariantsByModel: async (modelSlug) => {
    try {
      const response = await fetch(`${API_URL}/cars/models/${modelSlug}/variants`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get variants error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get car by ID
  getCarById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/cars/variants/${id}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get car by ID error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Search cars
  searchCars: async (query) => {
    try {
      const response = await fetch(`${API_URL}/cars/search/${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Search cars error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get top rated cars
  getTopRatedCars: async (limit = 10) => {
    try {
      const response = await fetch(`${API_URL}/cars/top-rated?limit=${limit}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get top rated cars error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get cars by fuel type
  getCarsByFuelType: async (fuelType) => {
    try {
      const response = await fetch(`${API_URL}/cars/fuel-type/${fuelType}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get cars by fuel type error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get cars by body type
  getCarsByBodyType: async (bodyType) => {
    try {
      const response = await fetch(`${API_URL}/cars/body-type/${bodyType}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get cars by body type error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // ========================================
  // COMPARISON API (NEW - Industry Benchmark Based)
  // ========================================

  // Compare two cars with industry benchmark ratings
  compareCars: async (car1Id, car2Id) => {
    try {
      const response = await fetch(`${API_URL}/compare/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ car1Id, car2Id }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Compare cars error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get all benchmarks
  getBenchmarks: async () => {
    try {
      const response = await fetch(`${API_URL}/compare/benchmarks`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get benchmarks error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Seed benchmarks (admin only)
  seedBenchmarks: async (benchmarks) => {
    try {
      const response = await fetch(`${API_URL}/compare/benchmarks/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ benchmarks }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Seed benchmarks error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // ========================================
  // ARTICLES API
  // ========================================

  // Get all articles
  getAllArticles: async () => {
    try {
      const response = await fetch(`${API_URL}/articles`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get articles error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Create a new article
  createArticle: async (articleData, token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers,
        body: JSON.stringify(articleData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Create article error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get article by slug
  getArticleBySlug: async (slug) => {
    try {
      const response = await fetch(`${API_URL}/articles/${slug}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get article error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get articles by category
  getArticlesByCategory: async (category) => {
    try {
      const response = await fetch(`${API_URL}/articles/category/${category}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get articles by category error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Search articles
  searchArticles: async (query) => {
    try {
      const response = await fetch(`${API_URL}/articles/search/${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Search articles error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  
  // ========================================
  // Send Contact Form
  // ========================================
  sendContactForm: async (formData) => {
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('❌ Contact form error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  },

};

export default api;