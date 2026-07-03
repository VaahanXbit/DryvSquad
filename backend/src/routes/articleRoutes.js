// backend/src/routes/articleRoutes.js
/*
================================================================================
File Name : articleRoutes.js
Author : Tahseen Raza
Created Date : 2026-06-22
Description : Article routes for handling article-related API endpoints
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const express = require('express');
const router = express.Router();
const {
  getAllArticles,
  getArticleBySlug,
  getArticlesByCategory,
  searchArticles,
  getFeaturedArticles,
  getRecentArticles,
  createArticle,
} = require('../controllers/articleController');

const { protect, admin } = require('../middleware/auth');

// ========================================
// Article Routes
// ========================================

// Get all published articles
router.get('/', getAllArticles);

// Create a new article (protected with Admin role validation)
router.post('/', protect, admin, createArticle);

// Get article by slug
router.get('/:slug', getArticleBySlug);

// Get articles by category
router.get('/category/:category', getArticlesByCategory);

// Search articles
router.get('/search/:query', searchArticles);

// Get featured articles (limit 3)
router.get('/featured', getFeaturedArticles);

// Get recent articles (limit 6)
router.get('/recent', getRecentArticles);

module.exports = router;