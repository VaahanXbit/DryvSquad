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
    
    // Increment views and weeklyViews counters in MongoDB on retrieval
    const article = await Article.findOneAndUpdate(
      { slug },
      { $inc: { views: 1, weeklyViews: 1 } },
      { new: true }
    );
    
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
    
    // Sort by lastWeekViews (descending) first, then total views, then newest
    // Sort by lastWeekViews (descending) first, then total views, then newest
    const articles = await Article.find({ status: 'published' })
      .sort({ lastWeekViews: -1, views: -1, createdAt: -1 })
      .sort({ lastWeekViews: -1, views: -1, createdAt: -1 })
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

// ========================================
// POST /api/articles - Create a new article
// ========================================
exports.createArticle = async (req, res) => {
  try {
    const {
      title,
      category,
      subCategory,
      excerpt,
      content,
      image,
      author,
      date,
      readTime,
      tags,
      status,
      seoTitle,
      seoDescription,
      seoKeywords,
      showLoanCTA,
      showInsuranceCTA,
    } = req.body;

    // Validate required fields
    if (!title || !category || !excerpt || !content || !image || !author || !date || !readTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, category, excerpt, content, image, author, date, readTime)',
      });
    }

    // Auto-generate slug from title
    const slug = title
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');

    // Check if slug already exists to prevent duplicate key error
    const existingArticle = await Article.findOne({ slug });
    if (existingArticle) {
      return res.status(400).json({
        success: false,
        message: `An article with this title/slug already exists: "${slug}"`,
      });
    }

    // Clean comma separated tags or keywords if they come in as string
    const processedTags = Array.isArray(tags) 
      ? tags 
      : (tags ? tags.split(',').map(t => t.trim()) : []);
      
    const processedKeywords = Array.isArray(seoKeywords)
      ? seoKeywords
      : (seoKeywords ? seoKeywords.split(',').map(k => k.trim()) : []);

    const newArticle = new Article({
      title,
      slug,
      category,
      subCategory: subCategory || '',
      excerpt,
      content,
      image,
      author,
      date,
      readTime,
      tags: processedTags,
      status: status || 'published',
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      seoKeywords: processedKeywords,
      showLoanCTA: showLoanCTA === true,
      showInsuranceCTA: showInsuranceCTA === true,
      publishedAt: new Date(),
    });

    await newArticle.save();

    res.status(201).json({
      success: true,
      message: 'Article created successfully!',
      article: newArticle,
    });
  } catch (error) {
    console.error('❌ Create article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// PUT /api/articles/:id - Update an existing article
// ========================================
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      subCategory,
      excerpt,
      content,
      image,
      author,
      date,
      readTime,
      tags,
      status,
      seoTitle,
      seoDescription,
      seoKeywords,
      showLoanCTA,
      showInsuranceCTA,
    } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Generate slug from title if modified
    let slug = article.slug;
    if (title && title !== article.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Process keywords and tags arrays
    const processedTags = Array.isArray(tags)
      ? tags
      : (tags ? tags.split(',').map(t => t.trim()) : article.tags);
      
    const processedKeywords = Array.isArray(seoKeywords)
      ? seoKeywords
      : (seoKeywords ? seoKeywords.split(',').map(k => k.trim()) : article.seoKeywords);

    const updatedFields = {
      title,
      slug,
      category,
      subCategory: subCategory !== undefined ? subCategory : article.subCategory,
      excerpt,
      content,
      image,
      author,
      date,
      readTime,
      tags: processedTags,
      status: status || article.status,
      seoTitle: seoTitle || title || article.seoTitle,
      seoDescription: seoDescription || excerpt || article.seoDescription,
      seoKeywords: processedKeywords,
      showLoanCTA: showLoanCTA !== undefined ? showLoanCTA : article.showLoanCTA,
      showInsuranceCTA: showInsuranceCTA !== undefined ? showInsuranceCTA : article.showInsuranceCTA,
      updatedAt: new Date()
    };

    const updatedArticle = await Article.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({
      success: true,
      message: 'Article updated successfully!',
      article: updatedArticle,
    });
  } catch (error) {
    console.error('❌ Update article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// POST /api/articles/:id/upvote - Toggle an upvote from the logged-in member
// ========================================
exports.upvoteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    // The special hardcoded admin identity has no real user document, so it
    // can't be tracked in upvotedBy.
    if (req.user?._id === 'admin_user') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot upvote articles.',
      });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const userId = req.user._id.toString();
    const alreadyUpvoted = article.upvotedBy.some((u) => u.toString() === userId);

    if (alreadyUpvoted) {
      // Toggle off
      article.upvotedBy = article.upvotedBy.filter((u) => u.toString() !== userId);
      article.upvotes = Math.max(0, article.upvotes - 1);
    } else {
      article.upvotedBy.push(userId);
      article.upvotes += 1;
    }

    await article.save();

    res.status(200).json({
      success: true,
      upvotes: article.upvotes,
      hasUpvoted: !alreadyUpvoted,
    });
  } catch (error) {
    console.error('❌ Upvote article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upvote article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// DELETE /api/articles/:id - Delete an article
// ========================================
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByIdAndDelete(id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully!',
    });
  } catch (error) {
    console.error('❌ Delete article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};