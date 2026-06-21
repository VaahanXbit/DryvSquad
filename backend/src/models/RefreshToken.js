/*
================================================================================
File Name : RefreshToken.js
Author : Tahseen Raza
Created Date : 2026-06-18
Description : Refresh token model for MongoDB
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import mongoose from 'mongoose'

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  revoked: {
    type: Boolean,
    default: false
  },
  userAgent: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

// Index for automatic cleanup
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)

export default RefreshToken