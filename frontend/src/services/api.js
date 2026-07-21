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

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();

// ========================================
// GLOBAL REQUEST DEDUPLICATION
// Prevents duplicate in-flight requests
// ========================================
const pendingRequests = new Map();

const dedupeRequest = async (key, fetchFn) => {
  // If request is already in flight, return the existing promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  // Start new request
  const promise = fetchFn().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
};

// ========================================
// RESPONSE HANDLER
// ========================================
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

// ========================================
// CAR CACHE
// ========================================
let _carsCache = null;
let _carsCacheTime = 0;
let _carsFetchPromise = null; // Prevents concurrent duplicate requests
const CARS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
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
    // Ignore private-browsing/quota errors
  }
};

// ========================================
// GENERIC FETCH WITH DEDUPLICATION
// ========================================
const fetchWithDedupe = (url, options = {}) => {
  const key = `${options.method || 'GET'}:${url}`;
  return dedupeRequest(key, async () => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    });
    return handleResponse(response);
  });
};

// ========================================
// API EXPORTS
// ========================================
export const api = {
  // ========================================
  // AUTH API
  // ========================================

  // Upload image to Cloudinary
  uploadImage: async (file, token = null) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/uploads/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await handleResponse(response);
      return { ...data, status: response.status };
    } catch (error) {
      console.error('❌ Upload image API error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

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
  // CAR API - WITH DEDUPLICATION
  // ========================================

  getAllCars: async () => {
    const now = Date.now();
    
    // 1. Check memory cache (fastest)
    if (_carsCache && (now - _carsCacheTime) < CARS_CACHE_TTL_MS) {
      return _carsCache;
    }
    
    // 2. Check sessionStorage (survives hard refresh)
    const stored = readCarsFromSessionStorage();
    if (stored && (now - stored.time) < CARS_CACHE_TTL_MS) {
      _carsCache = stored.data;
      _carsCacheTime = stored.time;
      return _carsCache;
    }
    
    // 3. PREVENT CONCURRENT DUPLICATE REQUESTS
    if (_carsFetchPromise) {
      return _carsFetchPromise;
    }
    
    // 4. Start fresh fetch with deduplication
    _carsFetchPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/cars`, {
          headers: { 'Accept': 'application/json' },
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
        // Return stale cache on error if available
        if (_carsCache) return _carsCache;
        if (stored?.data) return stored.data;
        return {
          success: false,
          message: 'Network error. Please check your connection.',
        };
      } finally {
        _carsFetchPromise = null;
      }
    })();
    
    return _carsFetchPromise;
  },

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
      return instant;
    }

    if (instant && isStale) {
      // Serve stale immediately, refresh in background
      api.getAllCars().then((fresh) => {
        if (fresh?.success && onFresh) onFresh(fresh);
      }).catch(() => {});
      return instant;
    }

    return api.getAllCars();
  },

  prefetchCars: () => {
    const now = Date.now();
    const hasFreshCache = _carsCache && (now - _carsCacheTime) < CARS_CACHE_TTL_MS;
    const hasStoredCache = readCarsFromSessionStorage();
    
    // Skip if we already have fresh cache
    if (hasFreshCache) return;
    
    // If we have stored cache but it's stale, refresh in background
    if (hasStoredCache && !hasFreshCache) {
      api.getAllCars().catch(() => {});
      return;
    }
    
    // No cache at all - fetch
    api.getAllCars().catch(() => {});
  },

  getAllBrands: async () => {
    return fetchWithDedupe(`${API_URL}/cars/brands`);
  },

  getModelsByBrand: async (brandSlug) => {
    return fetchWithDedupe(`${API_URL}/cars/brands/${brandSlug}/models`);
  },

  getVariantsByModel: async (modelSlug) => {
    return fetchWithDedupe(`${API_URL}/cars/models/${modelSlug}/variants`);
  },

  getCarById: async (id) => {
    return fetchWithDedupe(`${API_URL}/cars/variants/${id}`);
  },

  searchCars: async (query) => {
    return fetchWithDedupe(`${API_URL}/cars/search/${encodeURIComponent(query)}`);
  },

  getTopRatedCars: async (limit = 10) => {
    return fetchWithDedupe(`${API_URL}/cars/top-rated?limit=${limit}`);
  },

  getCarsByFuelType: async (fuelType) => {
    return fetchWithDedupe(`${API_URL}/cars/fuel-type/${fuelType}`);
  },

  getCarsByBodyType: async (bodyType) => {
    return fetchWithDedupe(`${API_URL}/cars/body-type/${bodyType}`);
  },

  // ========================================
  // COMPARISON API
  // ========================================

  compareCars: async (car1Id, car2Id, location = null, car3Id = null) => {
    try {
      const response = await fetch(`${API_URL}/compare/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          car1Id,
          car2Id,
          car3Id: car3Id || undefined,
          city: location?.city,
          state: location?.state,
          stateCode: location?.stateCode,
        }),
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

  getBenchmarks: async () => {
    return fetchWithDedupe(`${API_URL}/compare/benchmarks`);
  },

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
  // ARTICLES API - WITH DEDUPLICATION
  // ========================================

  getAllArticles: async () => {
    return fetchWithDedupe(`${API_URL}/articles`);
  },

  getFeaturedArticles: async (limit = 4) => {
    return fetchWithDedupe(`${API_URL}/articles/featured?limit=${limit}`);
  },

  getHomeCategories: async (minCount = 8, perCategory = 8) => {
    return fetchWithDedupe(`${API_URL}/home/categories?minCount=${minCount}&perCategory=${perCategory}`);
  },

  getActiveHeroBanners: async () => {
    return fetchWithDedupe(`${API_URL}/hero-banners`);
  },

  getAllHeroBannersAdmin: async (token) => {
    try {
      const response = await fetch(`${API_URL}/hero-banners/admin`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get all hero banners error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  publishHeroBanners: async (token, banners) => {
    try {
      const response = await fetch(`${API_URL}/hero-banners/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ banners }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Publish hero banners error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  getAllArticlesAdmin: async (token) => {
    try {
      const response = await fetch(`${API_URL}/articles/admin/all`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await handleResponse(response);
      return { ...data, status: response.status };
    } catch (error) {
      console.error('❌ Get all articles (admin) error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

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
      const data = await handleResponse(response);
      return { ...data, status: response.status };
    } catch (error) {
      console.error('❌ Create article error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

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
      const data = await handleResponse(response);
      return { ...data, status: response.status };
    } catch (error) {
      console.error('❌ Update article error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

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
      const data = await handleResponse(response);
      return { ...data, status: response.status };
    } catch (error) {
      console.error('❌ Delete article error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  getArticleBySlug: async (slug) => {
    return fetchWithDedupe(`${API_URL}/articles/${slug}`);
  },

  getArticlesByCategory: async (category) => {
    return fetchWithDedupe(`${API_URL}/articles/category/${category}`);
  },

  searchArticles: async (query) => {
    return fetchWithDedupe(`${API_URL}/articles/search/${encodeURIComponent(query)}`);
  },

  // ========================================
  // COMMENTS & UPVOTES
  // ========================================

  getComments: async (articleId) => {
    return fetchWithDedupe(`${API_URL}/articles/${articleId}/comments`);
  },

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
  // TRAVELOGUES API - WITH DEDUPLICATION
  // ========================================

  getAllTravelogues: async () => {
    return fetchWithDedupe(`${API_URL}/travelogues`);
  },

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
      const data = await handleResponse(response);
      return { ...data, status: response.status };
    } catch (error) {
      console.error('❌ Create travelogue error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

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
      const data = await handleResponse(response);
      return { ...data, status: response.status };
    } catch (error) {
      console.error('❌ Update travelogue error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

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

  // ========================================
  // LEADS API
  // ========================================

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
  // AI API
  // ========================================

  getAiComparison: async (car1, car2, reportType, query = '') => {
    try {
      const aiUrl = (import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8002').trim();
      const response = await fetch(`${aiUrl}/api/ai-compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ car1, car2, report_type: reportType, query }),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ AI comparison endpoint error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  getAiCarFinderRecommendations: async (payload) => {
    try {
      const aiUrl = (import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8002').trim();
      console.log('🌐 [VITE API] Attempting to fetch AI matches from:', `${aiUrl}/api/ai-car-finder`);
      const response = await fetch(`${aiUrl}/api/ai-car-finder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ AI car finder endpoint error:', error);
      return { success: false, recommendations: [] };
    }
  },

  // ========================================
  // CONTACT FORM
  // ========================================

  sendContactForm: async (formData) => {
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Contact form error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // ========================================
  // LOCATION API
  // ========================================

  getCurrentLocation: async (latitude, longitude) => {
    try {
      const response = await fetch(
        `${API_URL}/location/current?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`,
        { headers: { 'Accept': 'application/json' } }
      );
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get current location error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  searchLocations: async (query, limit = 15) => {
    try {
      const response = await fetch(
        `${API_URL}/location/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        { headers: { 'Accept': 'application/json' } }
      );
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Search locations error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  saveLocationToProfile: async (token, locationData) => {
    try {
      const response = await fetch(`${API_URL}/auth/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(locationData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Save location to profile error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  // ========================================
  // PRICING API
  // ========================================

  getOnRoadPrice: async (variantId, location) => {
    try {
      const params = new URLSearchParams({
        variantId,
        city: location?.city || '',
        state: location?.state || '',
        stateCode: location?.stateCode || '',
      });
      const response = await fetch(`${API_URL}/pricing?${params.toString()}`, {
        headers: { 'Accept': 'application/json' },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get on-road price error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  getOnRoadPriceBulk: async (variantIds, location) => {
    try {
      const response = await fetch(`${API_URL}/pricing/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          variantIds,
          city: location?.city,
          state: location?.state,
          stateCode: location?.stateCode,
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Get bulk on-road price error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

};

export default api;