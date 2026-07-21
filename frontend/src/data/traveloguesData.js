// src/data/traveloguesData.js
/*
================================================================================
File Name : traveloguesData.js
Author : Tahseen Raza
Created Date : 2026-06-29
Description : Travelogue data service for fetching from backend API
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { api } from '../services/api';

// ========================================
// CACHE FOR TRAVELOGUES
// ========================================
let traveloguesCache = null;
let traveloguesCacheTime = 0;
let traveloguesFetchPromise = null;
const TRAVELOGUES_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ========================================
// Fetch all travelogues with cache
// ========================================
export const getAllTravelogues = async () => {
  const now = Date.now();
  
  // Return cached data if fresh
  if (traveloguesCache && (now - traveloguesCacheTime) < TRAVELOGUES_CACHE_TTL_MS) {
    return traveloguesCache;
  }
  
  // Prevent concurrent duplicate requests
  if (traveloguesFetchPromise) {
    return traveloguesFetchPromise;
  }
  
  traveloguesFetchPromise = (async () => {
    try {
      const result = await api.getAllTravelogues();
      if (result.success) {
        traveloguesCache = result.travelogues || [];
        traveloguesCacheTime = now;
      } else {
        // On error, return cached data if available
        if (traveloguesCache) return traveloguesCache;
        traveloguesCache = [];
      }
      return traveloguesCache;
    } catch (error) {
      console.error('❌ Error fetching travelogues:', error);
      return traveloguesCache || [];
    } finally {
      traveloguesFetchPromise = null;
    }
  })();
  
  return traveloguesFetchPromise;
};

// ========================================
// Fetch travelogue by slug
// ========================================
export const getTravelogueBySlug = async (slug) => {
  try {
    const response = await fetch(`${api.API_URL || ''}/travelogues/${slug}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.travelogue || null;
  } catch (error) {
    console.error(`❌ Error fetching travelogue with slug "${slug}":`, error);
    return null;
  }
};

// ========================================
// Fetch travelogues by category
// ========================================
export const getTraveloguesByCategory = async (category) => {
  try {
    const response = await fetch(`${api.API_URL || ''}/travelogues/category/${encodeURIComponent(category)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.travelogues || [];
  } catch (error) {
    console.error(`❌ Error fetching travelogues for category "${category}":`, error);
    return [];
  }
};

// ========================================
// Fetch featured travelogues (for Home page)
// ========================================
export const getFeaturedTravelogues = async (limit = 4) => {
  try {
    const response = await fetch(`${api.API_URL || ''}/travelogues/featured?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.success && data.travelogues) {
      return data.travelogues;
    }
    return [];
  } catch (error) {
    console.error('❌ Error fetching featured travelogues:', error);
    return [];
  }
};

// ========================================
// Get all categories with counts
// ========================================
export const getTravelogueCategories = async () => {
  try {
    const allLogs = await getAllTravelogues();
    const categoryMap = {};
    
    allLogs.forEach(log => {
      if (log.category) {
        if (!categoryMap[log.category]) {
          categoryMap[log.category] = 0;
        }
        categoryMap[log.category]++;
      }
    });
    
    return Object.entries(categoryMap).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      count,
    }));
  } catch (error) {
    console.error('❌ Error fetching travelogue categories:', error);
    return [];
  }
};