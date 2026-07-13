// backend/src/controllers/travelogueController.js
/*
================================================================================
File Name : travelogueController.js
Author : Tahseen Raza
Created Date : 2026-06-29
Description : Travelogue controller for travel stories from PDF
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const Travelogue = require('../models/Travelogue');

// ========================================
// GET /api/travelogues - Get all published travelogues
// ========================================
exports.getAllTravelogues = async (req, res) => {
  try {
    const travelogues = await Travelogue.find({ status: 'published' })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: travelogues.length,
      travelogues,
    });
  } catch (error) {
    console.error('❌ Get all travelogues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch travelogues',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// GET /api/travelogues/:slug - Get travelogue by slug
// ========================================
exports.getTravelogueBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Increment views and weeklyViews counters in MongoDB on retrieval
    const travelogue = await Travelogue.findOneAndUpdate(
      { slug },
      { $inc: { views: 1, weeklyViews: 1 } },
      { new: true }
    );
    
    if (!travelogue) {
      return res.status(404).json({
        success: false,
        message: 'Travelogue not found',
      });
    }
    
    res.status(200).json({
      success: true,
      travelogue,
    });
  } catch (error) {
    console.error('❌ Get travelogue by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch travelogue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// GET /api/travelogues/category/:category - Get travelogues by category
// ========================================
exports.getTraveloguesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const travelogues = await Travelogue.find({ 
      category,
      status: 'published' 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: travelogues.length,
      category,
      travelogues,
    });
  } catch (error) {
    console.error('❌ Get travelogues by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch travelogues by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// GET /api/travelogues/featured - Get featured travelogues (limit 4)
// ========================================
exports.getFeaturedTravelogues = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    
    // Sort by lastWeekViews (descending) first, then total views, then newest
    const travelogues = await Travelogue.find({ status: 'published' })
      .sort({ lastWeekViews: -1, views: -1, createdAt: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: travelogues.length,
      travelogues,
    });
  } catch (error) {
    console.error('❌ Get featured travelogues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured travelogues',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// POST /api/travelogues - Create a new travelogue
// ========================================
exports.createTravelogue = async (req, res) => {
  try {
    const {
      title,
      category,
      excerpt,
      content,
      image,
      thumbnail,
      author,
      date,
      readTime,
      tags,
      status,
      seoTitle,
      seoDescription
    } = req.body;

    // Use manual slug if provided, else generate unique slug from title
    let slug = req.body.slug;
    if (slug !== undefined && slug !== null && String(slug).trim()) {
      slug = String(slug)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    } else {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if a travelogue with this slug already exists
    const slugExists = await Travelogue.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: `A travelogue with this slug already exists: "${slug}"`,
      });
    }

    // Process tags array
    const processedTags = Array.isArray(tags) 
      ? tags 
      : (tags ? tags.split(',').map(t => t.trim()) : []);

    const newTravelogue = new Travelogue({
      title,
      slug,
      category,
      excerpt,
      content,
      image,
      thumbnail: thumbnail || '',
      author,
      date,
      readTime,
      tags: processedTags,
      status: status || 'published',
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt
    });

    await newTravelogue.save();

    res.status(201).json({
      success: true,
      message: 'Travelogue created successfully!',
      travelogue: newTravelogue,
    });
  } catch (error) {
    console.error('❌ Create travelogue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create travelogue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// PUT /api/travelogues/:id - Update an existing travelogue
// ========================================
exports.updateTravelogue = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      excerpt,
      content,
      image,
      thumbnail,
      author,
      date,
      readTime,
      tags,
      status,
      seoTitle,
      seoDescription
    } = req.body;

    const travelogue = await Travelogue.findById(id);
    if (!travelogue) {
      return res.status(404).json({
        success: false,
        message: 'Travelogue not found',
      });
    }

    // Use manual slug if provided, else generate slug from title if modified
    let slug = travelogue.slug;
    if (req.body.slug !== undefined && req.body.slug !== null && String(req.body.slug).trim()) {
      slug = String(req.body.slug)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    } else if (title && title !== travelogue.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if the new slug is already taken by another travelogue
    if (slug !== travelogue.slug) {
      const slugExists = await Travelogue.findOne({ slug, _id: { $ne: id } });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: `A travelogue with this slug already exists: "${slug}"`,
        });
      }
    }

    // Process tags array
    const processedTags = Array.isArray(tags)
      ? tags
      : (tags ? tags.split(',').map(t => t.trim()) : travelogue.tags);

    const updatedFields = {
      title,
      slug,
      category,
      excerpt,
      content,
      image,
      thumbnail: thumbnail !== undefined ? thumbnail : travelogue.thumbnail,
      author,
      date,
      readTime,
      tags: processedTags,
      status: status || travelogue.status,
      seoTitle: seoTitle || title || travelogue.seoTitle,
      seoDescription: seoDescription || excerpt || travelogue.seoDescription,
      updatedAt: new Date()
    };

    const updatedTravelogue = await Travelogue.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({
      success: true,
      message: 'Travelogue updated successfully!',
      travelogue: updatedTravelogue,
    });
  } catch (error) {
    console.error('❌ Update travelogue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update travelogue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// DELETE /api/travelogues/:id - Delete a travelogue
// ========================================
exports.deleteTravelogue = async (req, res) => {
  try {
    const { id } = req.params;
    const travelogue = await Travelogue.findByIdAndDelete(id);
    
    if (!travelogue) {
      return res.status(404).json({
        success: false,
        message: 'Travelogue not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Travelogue deleted successfully!',
    });
  } catch (error) {
    console.error('❌ Delete travelogue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete travelogue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};