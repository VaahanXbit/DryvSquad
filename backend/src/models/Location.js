// backend/src/models/Location.js
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
  stateCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  pincode: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    default: 'India',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  popularity: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for fast search
LocationSchema.index({ city: 1, state: 1 });
LocationSchema.index({ state: 1 });
LocationSchema.index({ district: 1 });
LocationSchema.index({ pincode: 1 });
LocationSchema.index({ 
  city: 'text', 
  district: 'text', 
  state: 'text' 
});

module.exports = mongoose.model('Location', LocationSchema);