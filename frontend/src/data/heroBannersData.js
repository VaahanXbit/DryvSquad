// src/data/heroBannersData.js
/*
================================================================================
File Name : heroBannersData.js
Description : Data service for the homepage Hero banners. Replaces the old
              hardcoded BANNERS array in Home.jsx — banners now come from
              the backend (/api/hero-banners), managed through the Admin's
              Hero Banner Management screen.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { api } from '../services/api';

// Active banners for the public homepage slider, already sorted by
// displayOrder by the backend.
export const getActiveHeroBanners = async () => {
  try {
    const result = await api.getActiveHeroBanners();
    if (result.success) {
      return result.banners;
    }
  } catch (error) {
    console.error('Error in getActiveHeroBanners data service:', error);
  }
  return [];
};

export default {
  getActiveHeroBanners,
};