// backend/src/services/otpService.js
/*
================================================================================
File Name : otpService.js
Author : Tahseen Raza
Created Date : 2026-06-19
Description : OTP generation and verification service
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import crypto from 'crypto'
import User from '../models/User.js'
import OTP from '../models/OTP.js'
import { sendOTPEmail } from './emailService.js'
import { sendOTPSMS } from './smsService.js'

// Generate OTP code
export const generateOTP = () => {
  const length = parseInt(process.env.OTP_LENGTH) || 6
  const digits = '0123456789'
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)]
  }
  return otp
}

// Generate OTP expiry time
export const getOTPExpiry = () => {
  const minutes = parseInt(process.env.OTP_EXPIRE_MINUTES) || 10
  return new Date(Date.now() + minutes * 60 * 1000)
}

// Create and send OTP
export const createAndSendOTP = async (userId, email, mobile, type = 'both') => {
  try {
    const otp = generateOTP()
    const expiresAt = getOTPExpiry()

    // Save OTP to database
    const otpDoc = await OTP.create({
      userId,
      code: otp,
      type,
      email: email || undefined,
      mobile: mobile || undefined,
      expiresAt
    })

    // Send OTP via email
    let emailSent = false
    let smsSent = false

    if (email && (type === 'email' || type === 'both')) {
      const emailResult = await sendOTPEmail(email, otp)
      emailSent = emailResult.success
    }

    // Send OTP via SMS
    if (mobile && (type === 'mobile' || type === 'both')) {
      const smsResult = await sendOTPSMS(mobile, otp)
      smsSent = smsResult.success
    }

    return {
      success: true,
      otpId: otpDoc._id,
      emailSent,
      smsSent,
      expiresAt
    }
  } catch (error) {
    console.error('❌ OTP creation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Verify OTP
export const verifyOTP = async (userId, otpCode, type = 'both') => {
  try {
    // Find active OTP
    const otpDoc = await OTP.findOne({
      userId,
      code: otpCode,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    })

    if (!otpDoc) {
      return {
        success: false,
        error: 'Invalid or expired OTP'
      }
    }

    // Mark OTP as used
    otpDoc.isUsed = true
    await otpDoc.save()

    // Update user verification status
    const user = await User.findById(userId)
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    if (type === 'email' || type === 'both') {
      user.isEmailVerified = true
    }
    if (type === 'mobile' || type === 'both') {
      user.isMobileVerified = true
    }

    // Check if both are verified
    if (user.isEmailVerified && user.isMobileVerified) {
      user.isVerified = true
    }

    await user.save()

    return {
      success: true,
      user
    }
  } catch (error) {
    console.error('❌ OTP verification error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Resend OTP
export const resendOTP = async (userId, type = 'both') => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Invalidate old OTPs
    await OTP.updateMany(
      { userId, type, isUsed: false },
      { isUsed: true }
    )

    // Create and send new OTP
    return await createAndSendOTP(
      userId,
      user.email,
      user.mobile,
      type
    )
  } catch (error) {
    console.error('❌ Resend OTP error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}