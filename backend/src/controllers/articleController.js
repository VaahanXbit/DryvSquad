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
const {
  getTopArticlesByCategory: fetchTopArticlesByCategory,
} = require('../services/topArticlesByCategory');

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
// GET /api/articles/:slug - Get article by slug (Only published articles)
// ========================================
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Increment views and weeklyViews counters in MongoDB on retrieval
    const article = await Article.findOneAndUpdate(
      { slug, status: 'published' },
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
// GET /api/articles/admin/all - Get all articles (both published and drafts) for Admin
// ========================================
exports.getAllArticlesAdmin = async (req, res) => {
  try {
    const articles = await Article.find({}).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error('❌ Get all articles (admin) error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles for admin',
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
// GET /api/articles/top-by-category - Top N articles per category by views
// ========================================
exports.getTopArticlesByCategory = async (req, res) => {
  try {
    const limitPerCategory = parseInt(req.query.limit, 10) || 5;
    const categories = await fetchTopArticlesByCategory({ limitPerCategory });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('❌ Get top articles by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top articles by category',
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
      category,
      subCategory,
      excerpt,
      content,
      image,
      thumbnail,
      blocks,
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

    // Default title if missing or empty
    let title = req.body.title;
    if (!title || !String(title).trim()) {
      title = "Untitled Draft";
    }

    // Use manual slug if provided, else auto-generate from title/draft fallback
    let slug = req.body.slug;
    if (slug !== undefined && slug !== null && String(slug).trim()) {
      slug = String(slug)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    } else {
      if (title === "Untitled Draft") {
        slug = `draft-${Date.now()}`;
      } else {
        slug = title
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
      }
    }

    if (!slug || !slug.trim()) {
      slug = `draft-${Date.now()}`;
    }

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
      thumbnail: thumbnail || '',
      blocks: blocks || undefined,
      author,
      date,
      readTime,
      tags: processedTags,
      status: status || 'draft',
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      seoKeywords: processedKeywords,
      showLoanCTA: showLoanCTA === true,
      showInsuranceCTA: showInsuranceCTA === true,
      publishedAt: status === 'published' ? new Date() : undefined,
    });

    await newArticle.save();

    res.status(201).json({
      success: true,
      message: 'Article created successfully!',
      article: newArticle,
    });
  } catch (error) {
    console.error('❌ Create article error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
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
      thumbnail,
      blocks,
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

    // Default/normalize title if modified to be empty
    let normalizedTitle = title;
    if (title !== undefined && (!title || !String(title).trim())) {
      normalizedTitle = "Untitled Draft";
    }

    // Use manual slug if provided, else generate slug from title if modified or transitioning
    let newSlug = article.slug;
    if (req.body.slug !== undefined && req.body.slug !== null && String(req.body.slug).trim()) {
      newSlug = String(req.body.slug)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    } else {
      const targetStatus = status || article.status;
      const isTransitioningToPublished = article.status === 'draft' && targetStatus === 'published';
      const isPlaceholderSlug = article.slug.startsWith('draft-');
      
      if (isTransitioningToPublished && isPlaceholderSlug) {
        const activeTitle = normalizedTitle || article.title;
        newSlug = activeTitle
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
      } else if (normalizedTitle && normalizedTitle !== article.title) {
        newSlug = normalizedTitle
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
      }
    }

    if (!newSlug || !newSlug.trim()) {
      newSlug = `draft-${Date.now()}`;
    }

    // Check if the new slug is already taken by another article
    if (newSlug !== article.slug) {
      const slugExists = await Article.findOne({ slug: newSlug, _id: { $ne: id } });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: `An article with this slug already exists: "${newSlug}"`,
        });
      }
    }

    // Process keywords and tags arrays
    const processedTags = Array.isArray(tags)
      ? tags
      : (tags ? tags.split(',').map(t => t.trim()) : article.tags);
      
    const processedKeywords = Array.isArray(seoKeywords)
      ? seoKeywords
      : (seoKeywords ? seoKeywords.split(',').map(k => k.trim()) : article.seoKeywords);

    const updatedFields = {
      title: normalizedTitle !== undefined ? normalizedTitle : article.title,
      slug: newSlug,
      category: category !== undefined ? category : article.category,
      subCategory: subCategory !== undefined ? subCategory : article.subCategory,
      excerpt: excerpt !== undefined ? excerpt : article.excerpt,
      content: content !== undefined ? content : article.content,
      image: image !== undefined ? image : article.image,
      thumbnail: thumbnail !== undefined ? thumbnail : article.thumbnail,
      blocks: blocks !== undefined ? blocks : article.blocks,
      author: author !== undefined ? author : article.author,
      date: date !== undefined ? date : article.date,
      readTime: readTime !== undefined ? readTime : article.readTime,
      tags: processedTags,
      status: status || article.status,
      seoTitle: seoTitle || title || article.seoTitle,
      seoDescription: seoDescription || excerpt || article.seoDescription,
      seoKeywords: processedKeywords,
      showLoanCTA: showLoanCTA !== undefined ? showLoanCTA : article.showLoanCTA,
      showInsuranceCTA: showInsuranceCTA !== undefined ? showInsuranceCTA : article.showInsuranceCTA,
      publishedAt: (article.status === 'draft' && status === 'published') ? new Date() : article.publishedAt,
      updatedAt: new Date()
    };

    // runValidators: true is required to run the conditional validation functions on update!
    const updatedArticle = await Article.findByIdAndUpdate(id, updatedFields, { runValidators: true, new: true });

    res.status(200).json({
      success: true,
      message: 'Article updated successfully!',
      article: updatedArticle,
    });
  } catch (error) {
    console.error('❌ Update article error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
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