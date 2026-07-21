// backend/src/models/HeroBanner.js
/*
================================================================================
File Name : HeroBanner.js
Description : Hero banner model for the homepage Hero slider. Fully replaces
              the old hardcoded BANNERS array in Home.jsx — the homepage now
              reads active banners from this collection instead.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const mongoose = require('mongoose');

const HeroBannerSchema = new mongoose.Schema({
  title: {
    // Optional internal label (alt text / admin reference). Not required
    // because older-style banners never had one either.
    type: String,
    trim: true,
    default: '',
  },
  // Desktop asset — required 1920x1080. Stored as a base64 data URI or a
  // URL, same convention the rest of the app already uses for images.
  desktopImage: {
    type: String,
    required: true,
  },
  // Mobile asset — required 1080x1350.
  mobileImage: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
    trim: true,
  },
  buttonLink: {
    type: String,
    required: true,
    trim: true,
  },
  // Homepage renders banners sorted by this ascending.
  displayOrder: {
    type: Number,
    required: true,
    default: 0,
  },
  // Only active banners are ever returned to the public homepage endpoint.
  isActive: {
    type: Boolean,
    default: true,
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

HeroBannerSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

HeroBannerSchema.index({ displayOrder: 1 });
HeroBannerSchema.index({ isActive: 1 });

module.exports = mongoose.model('HeroBanner', HeroBannerSchema);