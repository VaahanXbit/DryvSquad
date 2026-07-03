// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  checkUserExists,
  sendOTP,
  verifyOTP,
  completeProfile,
  getCurrentUser,
  resendOTP,
  verifyPhone,
  confirmPhoneVerification,
  adminLogin,
} = require('../controllers/authController');

// Auth routes
router.post('/check-user', checkUserExists);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/admin-login', adminLogin);

// Phone verification routes
router.post('/verify-phone', protect, verifyPhone);
router.post('/confirm-phone', protect, confirmPhoneVerification);

// Profile routes
router.put('/complete-profile', protect, completeProfile);
router.get('/me', protect, getCurrentUser);

module.exports = router;