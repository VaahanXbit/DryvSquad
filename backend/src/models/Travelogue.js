// backend/src/models/Travelogue.js
/*
================================================================================
File Name : Travelogue.js
Author : Tahseen Raza
Created Date : 2026-06-29
Description : Travelogue schema for storing travel stories from PDF
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const mongoose = require('mongoose');

const TravelogueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['First Time Buyers', 'Highway Driving', 'Travel Stories', 'Buying Guide'],
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 500,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  readTime: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['published', 'coming-soon', 'draft'],
    default: 'published',
  },
  seoTitle: {
    type: String,
    trim: true,
  },
  seoDescription: {
    type: String,
    trim: true,
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

// Update updatedAt on save
TravelogueSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes
TravelogueSchema.index({ slug: 1 });
TravelogueSchema.index({ category: 1 });
TravelogueSchema.index({ status: 1 });

module.exports = mongoose.model('Travelogue', TravelogueSchema);