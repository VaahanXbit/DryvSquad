// backend/src/controllers/authController.js
/*
================================================================================
File Name : authController.js
Author : Tahseen Raza
Created Date : 2026-06-22
Description : Auth controller with Email & Phone support
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../services/emailService');
const { sendSMSOTP } = require('../services/smsService'); // FIXED: Use sendSMSOTP
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'vaahan_jwt_secret_fallback_key';
  return jwt.sign({ userId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ========================================
// Check if user exists (Email or Phone)
// ========================================
exports.checkUserExists = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required',
      });
    }

    let user = null;
    let isEmail = false;
    let isPhone = false;

    // Check if identifier is email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (emailRegex.test(identifier)) {
      isEmail = true;
      user = await User.findOne({ email: identifier.toLowerCase() });
    } else {
      // Assume it's a phone number
      isPhone = true;
      let formattedPhone = identifier.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      user = await User.findOne({ phoneNumber: formattedPhone });
    }

    return res.status(200).json({
      success: true,
      exists: !!user,
      isEmail,
      isPhone,
      user: user ? {
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        authProvider: user.authProvider,
      } : null,
    });
  } catch (error) {
    console.error('❌ Check user exists error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// ========================================
// Send OTP (Email or Phone)
// ========================================
exports.sendOTP = async (req, res) => {
  try {
    const { identifier, purpose = 'verify' } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required',
      });
    }

    let isEmail = false;
    let isPhone = false;
    let formattedIdentifier = identifier.trim();

    // Check if identifier is email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (emailRegex.test(identifier)) {
      isEmail = true;
      formattedIdentifier = identifier.toLowerCase();
    } else {
      isPhone = true;
      formattedIdentifier = identifier.replace(/\s/g, '');
      if (!formattedIdentifier.startsWith('+')) {
        formattedIdentifier = `+${formattedIdentifier}`;
      }
    }

    // Check if user exists for login purpose
    if (purpose === 'login') {
      let user = null;
      if (isEmail) {
        user = await User.findOne({ email: formattedIdentifier });
      } else {
        user = await User.findOne({ phoneNumber: formattedIdentifier });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found. Please sign up first.',
        });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing OTPs
    await OTP.deleteMany({ identifier: formattedIdentifier, isUsed: false });

    // Save OTP to database
    const otpDoc = new OTP({
      identifier: formattedIdentifier,
      otp,
      type: isEmail ? 'email' : 'phone',
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await otpDoc.save();

    console.log(`🔑 Generated OTP for ${formattedIdentifier}: ${otp}`);

    let result = null;

    if (isEmail) {
      // Send Email OTP
      result = await sendOTPEmail(formattedIdentifier, otp, purpose);
    } else {
      // Send SMS OTP
      result = await sendSMSOTP(formattedIdentifier, otp, purpose);
    }

    if (!result || !result.success) {
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP via ${isEmail ? 'email' : 'SMS'}. Please try again.`,
      });
    }

    const response = {
      success: true,
      message: `OTP sent successfully via ${isEmail ? 'email' : 'SMS'}`,
      type: isEmail ? 'email' : 'phone',
    };

    // Return OTP in development mode
    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
      console.log(`📱 Development Mode - OTP: ${otp}`);
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// ========================================
// Verify OTP (Email or Phone)
// ========================================
exports.verifyOTP = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and OTP are required',
      });
    }

    let formattedIdentifier = identifier.trim();
    let isEmail = false;
    let isPhone = false;

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (emailRegex.test(identifier)) {
      isEmail = true;
      formattedIdentifier = identifier.toLowerCase();
    } else {
      isPhone = true;
      formattedIdentifier = identifier.replace(/\s/g, '');
      if (!formattedIdentifier.startsWith('+')) {
        formattedIdentifier = `+${formattedIdentifier}`;
      }
    }

    const otpDoc = await OTP.findOne({
      identifier: formattedIdentifier,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.',
      });
    }

    otpDoc.isUsed = true;
    await otpDoc.save();

    // Find or create user
    let user = null;
    if (isEmail) {
      user = await User.findOne({ email: formattedIdentifier });
    } else {
      user = await User.findOne({ phoneNumber: formattedIdentifier });
    }

    if (!user) {
      // Create new user
      const userData = {
        authProvider: isEmail ? 'email' : 'phone',
      };

      if (isEmail) {
        userData.email = formattedIdentifier;
        userData.isEmailVerified = true;
      } else {
        userData.phoneNumber = formattedIdentifier;
        userData.isPhoneVerified = true;
      }

      user = new User(userData);
      await user.save();
    } else {
      // Update existing user
      if (isEmail) {
        user.isEmailVerified = true;
      } else {
        user.isPhoneVerified = true;
      }

      // If both are verified, set authProvider to 'both'
      if (user.isEmailVerified && user.isPhoneVerified) {
        user.authProvider = 'both';
      }

      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id);

    // Check if user is fully set up
    const isNewUser = !user.firstName || !user.lastName || !user.username;

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        authProvider: user.authProvider,
        isNewUser,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// ========================================
// Complete Profile (with phone verification option)
// ========================================
exports.completeProfile = async (req, res) => {
  try {
    const { firstName, lastName, username } = req.body;
    const userId = req.userId;

    if (!firstName || !lastName || !username) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters',
      });
    }

    const existingUser = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken. Please choose another.',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        username: username.toLowerCase(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Complete profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// ========================================
// Verify Phone Number - Send OTP (FIXED)
// ========================================
exports.verifyPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.userId;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Format phone number
    let formattedPhone = phoneNumber.replace(/\s/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    // Validate phone number
    const phoneRegex = /^\+[0-9]{8,15}$/;
    if (!phoneRegex.test(formattedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number with country code (e.g., +919876543210)',
      });
    }

    // Check if phone already used by another user
    const existingUser = await User.findOne({
      phoneNumber: formattedPhone,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered with another account',
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing OTPs
    await OTP.deleteMany({ identifier: formattedPhone, isUsed: false });

    // Save OTP to database
    const otpDoc = new OTP({
      identifier: formattedPhone,
      otp,
      type: 'phone',
      purpose: 'verify_phone',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await otpDoc.save();

    console.log(`📱 Phone verification OTP for ${formattedPhone}: ${otp}`);

    // Send SMS - FIXED: Use sendSMSOTP
    const smsResult = await sendSMSOTP(formattedPhone, otp, 'verify_phone');

    if (!smsResult || !smsResult.success) {
      // In development, still return OTP for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️ Development mode: SMS not sent, but OTP is: ${otp}`);
        return res.status(200).json({
          success: true,
          message: 'OTP generated successfully (SMS not sent in development)',
          otp: otp,
        });
      }

      console.error('❌ SMS sending failed:', smsResult?.error);
      return res.status(500).json({
        success: false,
        message: smsResult?.error || 'Failed to send OTP via SMS. Please try again.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your phone number',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('❌ Verify phone error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// ========================================
// Confirm Phone Verification
// ========================================
exports.confirmPhoneVerification = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const userId = req.userId;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    let formattedPhone = phoneNumber.replace(/\s/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    const otpDoc = await OTP.findOne({
      identifier: formattedPhone,
      otp,
      type: 'phone',
      purpose: 'verify_phone',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    otpDoc.isUsed = true;
    await otpDoc.save();

    // Get user to check if email is verified
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user
    user.phoneNumber = formattedPhone;
    user.isPhoneVerified = true;

    // Update authProvider
    if (user.isEmailVerified) {
      user.authProvider = 'both';
    } else {
      user.authProvider = 'phone';
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Confirm phone verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// ========================================
// Get Current User
// ========================================
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// ========================================
// Resend OTP
// ========================================
exports.resendOTP = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required',
      });
    }

    let formattedIdentifier = identifier.trim();
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (emailRegex.test(identifier)) {
      formattedIdentifier = identifier.toLowerCase();
    } else {
      formattedIdentifier = identifier.replace(/\s/g, '');
      if (!formattedIdentifier.startsWith('+')) {
        formattedIdentifier = `+${formattedIdentifier}`;
      }
    }

    await OTP.deleteMany({ identifier: formattedIdentifier, isUsed: false });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpDoc = new OTP({
      identifier: formattedIdentifier,
      otp,
      type: emailRegex.test(identifier) ? 'email' : 'phone',
      purpose: 'verify',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await otpDoc.save();

    console.log(`🔑 Resent OTP for ${formattedIdentifier}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// ========================================
// POST /api/auth/admin-login - Admin authentication
// ========================================
exports.adminLogin = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'DryvSquadAdmin2026';

    if (password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password',
      });
    }

    // Sign JWT token containing role: 'admin'
    const jwtSecret = process.env.JWT_SECRET || 'vaahan_jwt_secret_fallback_key';
    const token = jwt.sign(
      { userId: 'admin_user', role: 'admin' },
      jwtSecret,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      token,
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};