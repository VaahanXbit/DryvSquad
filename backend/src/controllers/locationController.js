// backend/src/controllers/locationController.js
/*
================================================================================
File Name : locationController.js
Description : India-only location endpoints.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const Location = require('../models/Location');
const { reverseGeocode } = require('../services/geocodingService');

/**
 * GET /api/location/current?lat=..&lng=..
 * Reverse geocodes a browser-supplied coordinate. India-only — anything
 * else returns a clear, user-facing message instead of a location.
 */
exports.getCurrentLocation = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query parameters are required',
      });
    }

    const geo = await reverseGeocode(lat, lng);

    if (!geo.isIndia) {
      return res.status(200).json({
        success: false,
        outsideIndia: true,
        message: 'This feature is currently available only in India.',
      });
    }

    // Best-effort: if we already have this city seeded locally, prefer its
    // canonical stateCode (matches StatePricingRule exactly) over whatever
    // OpenCage's state_code returned, since seeded data is our source of
    // truth for pricing lookups.
    let stateCode = geo.stateCode;
    if (geo.city && geo.state) {
      const localMatch = await Location.findOne({
        city: new RegExp(`^${geo.city}$`, 'i'),
        state: new RegExp(`^${geo.state}$`, 'i'),
      }).lean();
      if (localMatch) stateCode = localMatch.stateCode;
    }

    return res.status(200).json({
      success: true,
      data: {
        city: geo.city,
        district: geo.district,
        state: geo.state,
        stateCode,
        pincode: geo.pincode,
        country: geo.country,
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    });
  } catch (error) {
    console.error('❌ Get current location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to determine current location',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/location/search?q=hyd&limit=10
 * Local, DB-only partial search across city / district / state / aliases.
 * No external API calls — safe for instant, debounced, keystroke-driven
 * search on the frontend.
 */
exports.searchLocations = async (req, res) => {
  try {
    const { q } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 15, 30);

    if (!q || q.trim().length < 1) {
      return res.status(200).json({ success: true, data: [] });
    }

    const query = q.trim();
    // Escape regex special characters from free-form user input.
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    // Match against searchText (fast path — one indexed field) OR
    // directly against city/district/state/aliases as a fallback. The
    // fallback means search still works even for a document whose
    // searchText wasn't populated correctly (e.g. inserted by a script or
    // admin tool that bypassed the model's pre-validate hook) — this bit
    // us once already, so the search endpoint no longer trusts searchText
    // alone.
    const results = await Location.find({
      $or: [
        { searchText: regex },
        { city: regex },
        { district: regex },
        { state: regex },
        { aliases: regex },
      ],
    })
      .sort({ popularity: -1, city: 1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('❌ Search locations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search locations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/location/:id
 * Fetch a single seeded location by its Mongo ID — used when the frontend
 * needs to re-hydrate a saved location (e.g. from a user profile) into
 * full detail.
 */
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).lean();
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    return res.status(200).json({ success: true, data: location });
  } catch (error) {
    console.error('❌ Get location by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch location',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
