// backend/src/models/MarketingConsent.js
/*
================================================================================
File Name : MarketingConsent.js
Author : Tahseen Raza
Created Date : 2026-08-01
Description : User marketing consent for WhatsApp broadcasts
Company : DryvSquad
Copyright : (c) 2026 DryvSquad. All rights reserved.
================================================================================
*/

const mongoose = require('mongoose');

const MarketingConsentSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  consented: {
    type: Boolean,
    default: false,
  },
  consentedAt: {
    type: Date,
  },
  lastMessageAt: {
    type: Date,
  },
  totalMessagesSent: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MarketingConsent', MarketingConsentSchema);