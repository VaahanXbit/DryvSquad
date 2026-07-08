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

// Cache for the full car hierarchy. It rarely changes within a session, so
// repeat visits to the compare page reuse it instead of re-fetching.
// - In-memory (_carsCache): fastest, but wiped on a hard refresh.
// - sessionStorage: survives a hard refresh / direct URL load, so even the
//   FIRST time someone lands on the compare page in a new tab, if they've
//   been on the site earlier in that session, the page can render instantly
//   from sessionStorage while a fresh copy loads silently in the background.
let _carsCache = null;
let _carsCacheTime = 0;
const CARS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CARS_STORAGE_KEY = 'ds_cars_cache_v1';

const readCarsFromSessionStorage = () => {
  try {
    const raw = sessionStorage.getItem(CARS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data || !parsed.time) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCarsToSessionStorage = (data, time) => {
  try {
    sessionStorage.setItem(CARS_STORAGE_KEY, JSON.stringify({ data, time }));
  } catch {
    // sessionStorage can throw in private-browsing/quota-exceeded cases —
    // safe to ignore, the in-memory cache still works for this tab.
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
    const now = Date.now();
    if (_carsCache && (now - _carsCacheTime) < CARS_CACHE_TTL_MS) {
      return _carsCache;
    }
    const stored = readCarsFromSessionStorage();
    if (stored && (now - stored.time) < CARS_CACHE_TTL_MS) {
      _carsCache = stored.data;
      _carsCacheTime = stored.time;
      return stored.data;
    }
    try {
      const response = await fetch(`${API_URL}/cars`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      const data = await handleResponse(response);
      if (data.success) {
        _carsCache = data;
        _carsCacheTime = now;
        writeCarsToSessionStorage(data, now);
      }
      return data;
    } catch (error) {
      console.error('❌ Get all cars error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Returns cached car data synchronously if any exists (even if stale),
  // so a page can render immediately instead of showing a loading state,
  // while a fresh copy is fetched in the background. Falls back to a
  // normal awaited fetch if nothing is cached yet (e.g. very first visit
  // in a fresh tab with no prior prefetch).
  getAllCarsInstant: async (onFresh) => {
    const now = Date.now();
    let instant = null;

    if (_carsCache) {
      instant = _carsCache;
    } else {
      const stored = readCarsFromSessionStorage();
      if (stored) {
        _carsCache = stored.data;
        _carsCacheTime = stored.time;
        instant = stored.data;
      }
    }

    const isStale = !instant || (now - _carsCacheTime) >= CARS_CACHE_TTL_MS;

    if (instant && !isStale) {
      return instant; // fresh cache — no network call needed at all
    }

    if (instant && isStale) {
      // Serve stale data immediately, refresh silently in the background.
      api.getAllCars().then((fresh) => {
        if (fresh.success && onFresh) onFresh(fresh);
      });
      return instant;
    }

    // Nothing cached at all — only case where we actually have to wait.
    return api.getAllCars();
  },

  // Fire-and-forget prefetch, meant to be called as early as possible
  // (e.g. on app mount) so that by the time the user navigates to the
  // Compare Cars page, the data is already cached and the page can render
  // without any visible loading state.
  prefetchCars: () => {
    api.getAllCars().catch(() => {});
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

  // Get featured articles (popularity/views sorted)
  getFeaturedArticles: async (limit = 4) => {
    try {
      const response = await fetch(`${API_URL}/articles/featured?limit=${limit}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error in getFeaturedArticles:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get every article regardless of status (admin manage view — requires admin token)
  getAllArticlesAdmin: async (token) => {
    try {
      const response = await fetch(`${API_URL}/articles/admin/all`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get all articles (admin) error:', error);
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

  // Update an existing article
  updateArticle: async (id, articleData, token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/articles/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(articleData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Update article error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Delete an article
  deleteArticle: async (id, token = null) => {
    try {
      const headers = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/articles/${id}`, {
        method: 'DELETE',
        headers,
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Delete article error:', error);
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
  // ARTICLE COMMENTS & UPVOTES
  // ========================================

  // Get comments for an article (by article _id)
  getComments: async (articleId) => {
    try {
      const response = await fetch(`${API_URL}/articles/${articleId}/comments`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get comments error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Add a comment to an article (requires logged-in member).
  // Pass parentCommentId to post a reply instead of a top-level comment.
  addComment: async (articleId, content, token, parentCommentId = null) => {
    try {
      const response = await fetch(`${API_URL}/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content, parentComment: parentCommentId }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Add comment error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Edit your own comment
  updateComment: async (commentId, content, token) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Update comment error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Delete your own comment
  deleteComment: async (commentId, token) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Delete comment error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Toggle an upvote on an article (requires logged-in member)
  upvoteArticle: async (articleId, token) => {
    try {
      const response = await fetch(`${API_URL}/articles/${articleId}/upvote`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Upvote article error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  
  // ========================================
  // TRAVELOGUES API
  // ========================================

  // Get all travelogues
  getAllTravelogues: async () => {
    try {
      const response = await fetch(`${API_URL}/travelogues`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get travelogues error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Create a new travelogue
  createTravelogue: async (travelogueData, token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/travelogues`, {
        method: 'POST',
        headers,
        body: JSON.stringify(travelogueData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Create travelogue error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Update an existing travelogue
  updateTravelogue: async (id, travelogueData, token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/travelogues/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(travelogueData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Update travelogue error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Delete a travelogue
  deleteTravelogue: async (id, token = null) => {
    try {
      const headers = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/travelogues/${id}`, {
        method: 'DELETE',
        headers,
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Delete travelogue error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // // ========================================
  // // TRAVELOGUES API
  // // ========================================

  // // Get all travelogues
  // getAllTravelogues: async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/travelogues`, {
  //       headers: {
  //         'Accept': 'application/json',
  //       },
  //     });
  //     return await handleResponse(response);
  //   } catch (error) {
  //     console.error('❌ Get travelogues error:', error);
  //     return {
  //       success: false,
  //       message: 'Network error. Please check your connection.',
  //     };
  //   }
  // },

  // // Create a new travelogue
  // createTravelogue: async (travelogueData, token = null) => {
  //   try {
  //     const headers = {
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json',
  //     };
  //     if (token) {
  //       headers['Authorization'] = `Bearer ${token}`;
  //     }
  //     const response = await fetch(`${API_URL}/travelogues`, {
  //       method: 'POST',
  //       headers,
  //       body: JSON.stringify(travelogueData),
  //     });
  //     return await handleResponse(response);
  //   } catch (error) {
  //     console.error('❌ Create travelogue error:', error);
  //     return {
  //       success: false,
  //       message: 'Network error. Please check your connection.',
  //     };
  //   }
  // },

  // // Update an existing travelogue
  // updateTravelogue: async (id, travelogueData, token = null) => {
  //   try {
  //     const headers = {
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json',
  //     };
  //     if (token) {
  //       headers['Authorization'] = `Bearer ${token}`;
  //     }
  //     const response = await fetch(`${API_URL}/travelogues/${id}`, {
  //       method: 'PUT',
  //       headers,
  //       body: JSON.stringify(travelogueData),
  //     });
  //     return await handleResponse(response);
  //   } catch (error) {
  //     console.error('❌ Update travelogue error:', error);
  //     return {
  //       success: false,
  //       message: 'Network error. Please check your connection.',
  //     };
  //   }
  // },

  // // Delete a travelogue
  // deleteTravelogue: async (id, token = null) => {
  //   try {
  //     const headers = {
  //       'Accept': 'application/json',
  //     };
  //     if (token) {
  //       headers['Authorization'] = `Bearer ${token}`;
  //     }
  //     const response = await fetch(`${API_URL}/travelogues/${id}`, {
  //       method: 'DELETE',
  //       headers,
  //     });
  //     return await handleResponse(response);
  //   } catch (error) {
  //     console.error('❌ Delete travelogue error:', error);
  //     return {
  //       success: false,
  //       message: 'Network error. Please check your connection.',
  //     };
  //   }
  // },

  // ========================================
  // LEADS API
  // ========================================

  // Submit a lead (loan or insurance)
  submitLead: async (leadData) => {
    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(leadData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Submit lead error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Get all leads (Admin only)
  getAllLeads: async (token = null) => {
    try {
      const headers = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/leads`, {
        headers,
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get leads error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // ========================================
  // SETTINGS API
  // ========================================

  // Get global settings (links, etc.)
  getSettings: async () => {
    try {
      const response = await fetch(`${API_URL}/settings`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get settings error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Update global settings (Admin only)
  updateSettings: async (settingsData, token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settingsData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Update settings error:', error);
      return { success: false, message: 'Network error. Please try again.' };
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