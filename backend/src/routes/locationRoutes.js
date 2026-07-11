// backend/src/routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getLocationFromCoords,
  searchLocations,
  getPopularLocations,
  saveUserLocation,
  getUserLocation,
} = require('../controllers/locationController');

// Public routes
router.get('/reverse-geocode', getLocationFromCoords);
router.get('/search', searchLocations);
router.get('/popular', getPopularLocations);

// Protected routes
router.post('/save', protect, saveUserLocation);
router.get('/user', protect, getUserLocation);

module.exports = router;