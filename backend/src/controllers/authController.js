// backend/src/controllers/authController.js
/*
================================================================================
File Name : authController.js
Author : Tahseen Raza
Created Date : 2026-06-19
Description : Authentication controllers with OTP support
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Check if user exists
exports.checkUserExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    return res.status(200).json({
      success: true,
      exists: !!user,
      user: user ? {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
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

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email, purpose = 'verify' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    if (purpose === 'login') {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email. Please sign up first.',
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ identifier: email.toLowerCase(), isUsed: false });

    const otpDoc = new OTP({
      identifier: email.toLowerCase(),
      otp,
      type: 'email',
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await otpDoc.save();

    const emailResult = await sendOTPEmail(email, otp, purpose);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const otpDoc = await OTP.findOne({
      identifier: email.toLowerCase(),
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

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        isEmailVerified: true,
        authProvider: 'email',
      });
      await user.save();
    } else {
      user.isEmailVerified = true;
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        isNewUser: !user.firstName || !user.lastName || !user.username,
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

// Login with password
exports.loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Please use OTP login',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// Complete profile
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
        isEmailVerified: true,
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
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
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

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

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
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
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