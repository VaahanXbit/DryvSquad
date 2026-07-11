// backend/src/services/locationService.js
const Location = require('../models/Location');
const axios = require('axios');

class LocationService {
  constructor() {
    this.opencageApiKey = process.env.OPENCAGE_API_KEY;
    this.cache = new Map();
    this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Reverse geocode using OpenCage API
  async reverseGeocode(lat, lng) {
    if (!this.opencageApiKey) {
      throw new Error('OpenCage API key not configured');
    }

    const cacheKey = `reverse_${lat}_${lng}`;
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return cached.data;
    }

    try {
      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: `${lat},${lng}`,
          key: this.opencageApiKey,
          language: 'en',
          countrycode: 'in',
          no_annotations: 1,
        },
        timeout: 10000,
      });

      if (!response.data.results || response.data.results.length === 0) {
        throw new Error('No location found for the given coordinates');
      }

      const result = response.data.results[0];
      const components = result.components;

      // Extract location details
      const location = {
        city: components.city || components.town || components.village || components.county,
        district: components.county || components.district || components.city,
        state: components.state || components.province,
        stateCode: components.state_code ? components.state_code.toUpperCase() : null,
        pincode: components.postcode || null,
        country: components.country || 'India',
        latitude: lat,
        longitude: lng,
        formatted: result.formatted,
      };

      // Validate that location is in India
      if (location.country !== 'India') {
        throw new Error('Location is outside India');
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: location,
        timestamp: Date.now(),
      });

      return location;
    } catch (error) {
      console.error('❌ Reverse geocoding error:', error);
      throw error;
    }
  }

  // Search locations from database
  async searchLocations(query, limit = 20) {
    if (!query || query.length < 1) {
      return [];
    }

    const searchRegex = new RegExp(query, 'i');

    // Search in database with text search
    const locations = await Location.find({
      $or: [
        { city: searchRegex },
        { district: searchRegex },
        { state: searchRegex },
        { pincode: searchRegex },
        { $text: { $search: query } },
      ],
    })
    .sort({ popularity: -1, city: 1 })
    .limit(limit)
    .lean();

    // If no results, return empty array
    if (locations.length === 0) {
      return [];
    }

    // Group by state and city to remove duplicates
    const grouped = new Map();
    locations.forEach(loc => {
      const key = `${loc.state}_${loc.city}`;
      if (!grouped.has(key) || loc.popularity > grouped.get(key).popularity) {
        grouped.set(key, loc);
      }
    });

    return Array.from(grouped.values());
  }

  // Get location by pincode
  async getLocationByPincode(pincode) {
    const location = await Location.findOne({ pincode }).lean();
    return location;
  }

  // Get popular locations
  async getPopularLocations(limit = 10) {
    const locations = await Location.find({ isActive: true })
      .sort({ popularity: -1 })
      .limit(limit)
      .lean();
    return locations;
  }

  // Update location popularity (increment on selection)
  async incrementPopularity(locationId) {
    await Location.findByIdAndUpdate(locationId, {
      $inc: { popularity: 1 },
      updatedAt: new Date(),
    });
  }

  // Seed initial locations data (for cities)
  async seedLocations() {
    // This would be populated with India's major cities
    const initialLocations = [
      // Add major Indian cities
    ];
    
    for (const loc of initialLocations) {
      await Location.findOneAndUpdate(
        { city: loc.city, state: loc.state },
        loc,
        { upsert: true, new: true }
      );
    }
  }
}

module.exports = new LocationService();