// backend/src/routes/heroBannerRoutes.js
/*
================================================================================
File Name : heroBannerRoutes.js
Description : Routes for Hero Banner Management
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const express = require('express');
const router = express.Router();
const {
  getActiveHeroBanners,
  getAllHeroBannersAdmin,
  publishHeroBanners,
} = require('../controllers/heroBannerController');

const { protect, admin } = require('../middleware/auth');

// Public — homepage Hero slider
router.get('/', getActiveHeroBanners);

// Admin — Hero Banner Management screen
router.get('/admin', protect, admin, getAllHeroBannersAdmin);
router.post('/publish', protect, admin, publishHeroBanners);

module.exports = router;