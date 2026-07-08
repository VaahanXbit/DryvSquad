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
  updateArticle,
  deleteArticle,
  upvoteArticle,
} = require('../controllers/articleController');

const {
  getCommentsForArticle,
  addComment,
} = require('../controllers/commentController');

const { protect, admin } = require('../middleware/auth');

// ========================================
// Article Routes
// ========================================

// Get all published articles
router.get('/', getAllArticles);

// Create a new article (protected with Admin role validation)
router.post('/', protect, admin, createArticle);

// Update an existing article (protected with Admin role validation)
router.put('/:id', protect, admin, updateArticle);

// Delete an article (protected with Admin role validation)
router.delete('/:id', protect, admin, deleteArticle);

// Get featured articles (limit 3)
router.get('/featured', getFeaturedArticles);

// Get recent articles (limit 6)
router.get('/recent', getRecentArticles);

// Get article by slug
router.get('/:slug', getArticleBySlug);

// Get articles by category
router.get('/category/:category', getArticlesByCategory);

// Search articles
router.get('/search/:query', searchArticles);

// Upvote / un-upvote an article (any logged-in member)
router.post('/:id/upvote', protect, upvoteArticle);

// Comments for an article
router.get('/:articleId/comments', getCommentsForArticle);
router.post('/:articleId/comments', protect, addComment);

module.exports = router;