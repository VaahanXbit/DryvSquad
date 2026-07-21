// src/data/articlesData.js
/*
================================================================================
File Name : articlesData.js
Author : Tahseen Raza
Created Date : 2026-06-22
Description : Article data service - Now fetches from backend API
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { api } from '../services/api';

// ========================================
// CACHE FOR ARTICLES
// ========================================
let articlesCache = null;
let articlesFetchPromise = null;
let homeCategoriesCache = null;
let homeCategoriesCacheTime = 0;
const HOME_CATEGORIES_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ========================================
// Fetch articles from backend with cache
// ========================================
const fetchArticles = async () => {
  if (articlesCache) return articlesCache;
  
  if (articlesFetchPromise) {
    return articlesFetchPromise;
  }
  
  articlesFetchPromise = api.getAllArticles().then(result => {
    if (result.success) {
      articlesCache = result.articles;
      return articlesCache;
    }
    console.error('❌ Failed to fetch articles:', result.message);
    return [];
  }).catch(error => {
    console.error('❌ Error fetching articles:', error);
    return [];
  }).finally(() => {
    articlesFetchPromise = null;
  });
  
  return articlesFetchPromise;
};

// ========================================
// Get all articles
// ========================================
export const getAllArticles = async () => {
  return await fetchArticles();
};

// ========================================
// Get article by slug
// ========================================
export const getArticleBySlug = async (slug) => {
  if (!slug) return null;
  const result = await api.getArticleBySlug(slug);
  if (result.success) {
    return result.article;
  }
  return null;
};

// ========================================
// Get articles by category
// ========================================
export const getArticlesByCategory = async (categoryName) => {
  const result = await api.getArticlesByCategory(categoryName);
  if (result.success) {
    return result.articles;
  }
  return [];
};

// ========================================
// Get all categories with counts
// ========================================
export const getCategories = async () => {
  const articles = await fetchArticles();
  const categories = {};
  articles.forEach(article => {
    if (!categories[article.category]) {
      categories[article.category] = 0;
    }
    categories[article.category]++;
  });
  
  return Object.keys(categories).map(name => ({
    id: name,
    name: name,
    count: categories[name]
  }));
};

// ========================================
// Search articles
// ========================================
export const searchArticles = async (query) => {
  if (!query || query.trim() === '') {
    return await fetchArticles();
  }
  const result = await api.searchArticles(query.trim());
  if (result.success) {
    return result.articles;
  }
  return [];
};

// ========================================
// allArticles export for backward compatibility
// ========================================
export const allArticles = async () => {
  return await fetchArticles();
};

// ========================================
// featureReviews, newLaunches, techInsights
// ========================================
export const featureReviews = async () => {
  return await getArticlesByCategory('Feature Reviews');
};

export const newLaunches = async () => {
  return await getArticlesByCategory('New Launches');
};

export const techInsights = async () => {
  return await getArticlesByCategory('Tech Insights');
};

// ========================================
// Get featured articles (sorted by popularity/views)
// ========================================
export const getFeaturedArticles = async (limit = 4) => {
  try {
    const result = await api.getFeaturedArticles(limit);
    if (result.success) {
      return result.articles;
    }
  } catch (error) {
    console.error('Error in getFeaturedArticles data service:', error);
  }
  // Fallback: fetch all and slice
  const all = await fetchArticles();
  return all.slice(0, limit);
};

// ========================================
// Get dynamic homepage category sections with cache
// ========================================
export const getHomeCategories = async (minCount = 8, perCategory = 8) => {
  const cacheKey = `${minCount}-${perCategory}`;
  const now = Date.now();
  
  // Check cache
  if (homeCategoriesCache && homeCategoriesCache.key === cacheKey && 
      (now - homeCategoriesCacheTime) < HOME_CATEGORIES_CACHE_TTL_MS) {
    return homeCategoriesCache.data;
  }
  
  try {
    const result = await api.getHomeCategories(minCount, perCategory);
    if (result.success) {
      homeCategoriesCache = {
        key: cacheKey,
        data: result.categories
      };
      homeCategoriesCacheTime = now;
      return result.categories;
    }
  } catch (error) {
    console.error('Error in getHomeCategories data service:', error);
  }
  return [];
};

export default {
  getAllArticles,
  getArticleBySlug,
  getArticlesByCategory,
  getCategories,
  searchArticles,
  allArticles,
  featureReviews,
  newLaunches,
  techInsights,
  getFeaturedArticles,
  getHomeCategories,
};