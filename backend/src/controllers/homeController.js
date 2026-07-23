// backend/src/controllers/homeController.js
/*
================================================================================
File Name : homeController.js
Description : Controller for homepage aggregation endpoints — returns
              grouped, ready-to-render carousel sections so the frontend
              doesn't have to do any grouping/filtering/sorting itself.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { getHomepageCategorySections } = require('../services/homeCategories');

// ========================================
// GET /api/home/categories - Grouped, ready-to-render homepage sections
// Query params (optional):
//   minCount     - minimum published articles a category needs (default 8)
//   perCategory  - max latest articles returned per category (default 8)
// ========================================
exports.getHomeCategories = async (req, res) => {
  try {
    const minCount = parseInt(req.query.minCount, 10) || 8;
    const perCategory = parseInt(req.query.perCategory, 10) || 8;

    const categories = await getHomepageCategorySections({ minCount, perCategory });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('❌ Get home categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch homepage categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};