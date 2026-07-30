// backend/src/models/Location.js
/*
================================================================================
File Name : Location.js
Description : India-only location collection (State -> District -> City).
              Populated once via scripts/seedLocations.js and then queried
              locally for manual search — OpenCage is never called for
              search-as-you-type, only for reverse geocoding a coordinate.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  // Matches the `key` used in StatePricingRule so pricing lookups never
  // depend on fuzzy string matching of the state's display name.
  stateCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  pincode: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    default: 'India',
  },
  // Common alternate/old names — e.g. Bengaluru -> "Bangalore",
  // Mumbai -> "Bombay" — folded into searchText so users searching the
  // colloquial name still find the right place.
  aliases: {
    type: [String],
    default: [],
  },
  // Precomputed lowercase field the search endpoint runs a $regex/text
  // match against — city, district, and state all folded into one string
  // so "hyd" matches Hyderabad, "war" matches Warangal, etc. in one query.
  searchText: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  // Bigger cities should be suggested first when a search matches several
  // places equally well.
  popularity: {
    type: Number,
    default: 0,
  },

  // ----- Optional city-level dealer charge overrides -----
  // Dealer handling/logistics charges commonly vary by city even within
  // the same state (e.g. metro vs tier-2). When set, these override the
  // state-level defaults in StatePricingRule for this specific city — see
  // services/pricing/handlingLogisticsService.js for the resolution
  // order. Left null/unset, the state default applies.
  handlingChargeOverride: {
    type: Number,
    default: null,
  },
  logisticsChargeOverride: {
    type: Number,
    default: null,
  },

  // ----- Optional used-car-valuation fields -----
  // Added to support tools/usedCarValuation's Market Adjustment step
  // without introducing a separate city configuration file. All four are
  // nullable/optional — engines fall back to a generic config default
  // when a location hasn't been tuned yet. Populate these per-location as
  // real resale market data becomes available (e.g. via an admin tool or
  // a future seed script), the same way handlingChargeOverride is set.
  marketAdjustment: {
    // Fraction of a vehicle's value added/removed for resale demand in
    // this location, e.g. 0.02 = metro city premium, -0.04 = smaller
    // market discount. See usedCarValuation/marketAdjustment.js.
    type: Number,
    default: null,
  },
  marketDemand: {
    // Coarse resale-demand signal for this location, surfaced in the
    // valuation's confidence/insight output.
    type: String,
    enum: ['low', 'medium', 'high', null],
    default: null,
  },
  averageAnnualKm: {
    // Regional driving norm (km/year) used by the Mileage Engine's
    // Expected KM calculation. Overrides the body-type default in
    // usedCarValuation.config.js when set for this location.
    type: Number,
    default: null,
  },
  averageSellingDays: {
    // Typical days-to-sell for a used car in this location — informational
    // for now (surfaced via confidence/insights), reserved for a future
    // liquidity-based adjustment.
    type: Number,
    default: null,
  },
}, { timestamps: true });

LocationSchema.index({ searchText: 'text' });
LocationSchema.index({ city: 1, state: 1 }, { unique: true });
LocationSchema.index({ stateCode: 1 });
LocationSchema.index({ popularity: -1 });

// Shared by the pre-validate hook below AND by the seed script. Kept as a
// static so there's exactly one implementation of "how searchText is
// built" — the seed script uses findOneAndUpdate, which does NOT run
// document middleware like pre('validate'), so it must compute this
// value itself and include it explicitly in the upsert document.
LocationSchema.statics.buildSearchText = function ({ city, district, state, aliases }) {
  const aliasPart = (aliases || []).join(' ');
  return `${city} ${district} ${state} ${aliasPart}`.toLowerCase().trim();
};

LocationSchema.pre('validate', function setSearchText(next) {
  this.searchText = this.constructor.buildSearchText({
    city: this.city,
    district: this.district,
    state: this.state,
    aliases: this.aliases,
  });
  next();
});

module.exports = mongoose.model('Location', LocationSchema);
