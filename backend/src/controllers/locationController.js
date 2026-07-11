// backend/src/controllers/locationController.js
const LocationService = require('../services/locationService');
const PricingEngine = require('../services/pricing');
const User = require('../models/User');
const Variant = require('../models/Variant');

// Get current location from coordinates (reverse geocode)
exports.getLocationFromCoords = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const location = await LocationService.reverseGeocode(
      parseFloat(lat),
      parseFloat(lng)
    );

    return res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error('❌ Reverse geocode error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get location',
    });
  }
};

// Search locations
exports.searchLocations = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const locations = await LocationService.searchLocations(q);
    
    return res.status(200).json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error('❌ Search locations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search locations',
    });
  }
};

// Get popular locations
exports.getPopularLocations = async (req, res) => {
  try {
    const locations = await LocationService.getPopularLocations(10);
    
    return res.status(200).json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error('❌ Get popular locations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch popular locations',
    });
  }
};

// Save user location (when logged in)
exports.saveUserLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const locationData = req.body;

    if (!locationData.city || !locationData.state) {
      return res.status(400).json({
        success: false,
        message: 'City and state are required',
      });
    }

    // Update user with selected location
    const user = await User.findByIdAndUpdate(
      userId,
      {
        selectedLocation: {
          city: locationData.city,
          district: locationData.district,
          state: locationData.state,
          stateCode: locationData.stateCode,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          pincode: locationData.pincode,
          locationUpdatedAt: new Date(),
        },
      },
      { new: true }
    );

    // Increment location popularity
    if (locationData._id) {
      await LocationService.incrementPopularity(locationData._id);
    }

    return res.status(200).json({
      success: true,
      message: 'Location saved successfully',
      data: user.selectedLocation,
    });
  } catch (error) {
    console.error('❌ Save location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save location',
    });
  }
};

// Get current user location (from profile)
exports.getUserLocation = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || !user.selectedLocation) {
      return res.status(404).json({
        success: false,
        message: 'No location found for user',
      });
    }

    return res.status(200).json({
      success: true,
      data: user.selectedLocation,
    });
  } catch (error) {
    console.error('❌ Get user location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user location',
    });
  }
};