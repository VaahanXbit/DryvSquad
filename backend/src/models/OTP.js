// backend/src/models/OTP.js
/*
================================================================================
File Name : OTP.js
Author : Tahseen Raza
Created Date : 2026-06-19
Description : OTP model for storing verification codes
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'phone'],
    default: 'email',
  },
  purpose: {
    type: String,
    enum: ['verify', 'login', 'reset_password'],
    default: 'verify',
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000),
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', OTPSchema);