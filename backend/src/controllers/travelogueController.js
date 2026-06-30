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
    
    const travelogue = await Travelogue.findOne({ slug });
    
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
    
    const travelogues = await Travelogue.find({ status: 'published' })
      .sort({ createdAt: -1 })
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