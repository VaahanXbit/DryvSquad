// backend/src/routes/authRoutes.js
/*
================================================================================
File Name : authRoutes.js
Author : Tahseen Raza
Created Date : 2026-06-19
Description : Authentication routes with OTP support
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  checkUserExists,
  sendOTP,
  verifyOTP,
  loginWithPassword,
  completeProfile,
  getCurrentUser,
} = require('../controllers/authController');

router.post('/check-user', checkUserExists);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginWithPassword);
router.put('/complete-profile', protect, completeProfile);
router.get('/me', protect, getCurrentUser);

module.exports = router;