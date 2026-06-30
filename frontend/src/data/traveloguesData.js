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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ========================================
// Fetch all travelogues
// ========================================
export const getAllTravelogues = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/travelogues`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ All travelogues data:', data);
    return data.travelogues || [];
  } catch (error) {
    console.error('❌ Error fetching travelogues:', error);
    return [];
  }
};

// ========================================
// Fetch travelogue by slug
// ========================================
export const getTravelogueBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_BASE_URL}/travelogues/${slug}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Travelogue by slug:', data);
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
    const response = await fetch(`${API_BASE_URL}/travelogues/category/${encodeURIComponent(category)}`);
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
    const response = await fetch(`${API_BASE_URL}/travelogues/featured?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Featured travelogues data:', data);
    // Check if data has travelogues property
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