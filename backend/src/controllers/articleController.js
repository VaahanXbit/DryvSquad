// backend/src/controllers/articleController.js
/*
================================================================================
File Name : articleController.js
Author : Tahseen Raza
Created Date : 2026-06-22
Description : Article controller with all CRUD operations (Regex Search Enabled)
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const Article = require('../models/Article');

// ========================================
// GET /api/articles - Get all published articles
// ========================================
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error('❌ Get all articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// GET /api/articles/:slug - Get article by slug
// ========================================
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const article = await Article.findOne({ slug });
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }
    
    res.status(200).json({
      success: true,
      article,
    });
  } catch (error) {
    console.error('❌ Get article by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// GET /api/articles/category/:category - Get articles by category
// ========================================
exports.getArticlesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const articles = await Article.find({ 
      category,
      status: 'published' 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: articles.length,
      category,
      articles,
    });
  } catch (error) {
    console.error('❌ Get articles by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// GET /api/articles/search/:query - Search articles (MODIFIED FOR PARTIAL MATCH)
// ========================================
exports.searchArticles = async (req, res) => {
  try {
    const { query } = req.params;
    
    // Allow searching with just 1 character
    if (!query || query.trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Search query must not be empty',
      });
    }
    
    // Create a case-insensitive regular expression for partial matching
    const searchRegex = new RegExp(query, 'i');
    
    // Search across multiple fields using $or
    const articles = await Article.find({ 
      status: 'published',
      $or: [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
        { slug: searchRegex }
      ]
    }).sort({ createdAt: -1 }); // Sort by newest
    
    res.status(200).json({
      success: true,
      count: articles.length,
      query,
      articles,
    });
  } catch (error) {
    console.error('❌ Search articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// GET /api/articles/featured - Get featured articles (limit 3)
// ========================================
exports.getFeaturedArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    const articles = await Article.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error('❌ Get featured articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// GET /api/articles/recent - Get recent articles (limit 6)
// ========================================
exports.getRecentArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const articles = await Article.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error('❌ Get recent articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};