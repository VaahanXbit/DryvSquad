// backend/src/routes/homeRoutes.js
/*
================================================================================
File Name : homeRoutes.js
Description : Routes for homepage aggregation endpoints
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const express = require('express');
const router = express.Router();
const { getHomeCategories } = require('../controllers/homeController');

// GET /api/home/categories?minCount=8&perCategory=8
router.get('/categories', getHomeCategories);

module.exports = router;