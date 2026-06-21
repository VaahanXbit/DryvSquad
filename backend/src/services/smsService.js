// backend/src/services/smsService.js
/*
================================================================================
File Name : smsService.js
Author : Tahseen Raza
Created Date : 2026-06-19
Description : SMS service for sending OTP via Twilio
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import twilio from 'twilio'

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export const sendOTPSMS = async (mobile, otp, name = '') => {
  try {
    // Format mobile number (add +91 if not present)
    let formattedMobile = mobile
    if (!mobile.startsWith('+')) {
      formattedMobile = `+91${mobile}`
    }

    const message = `
      Vaahan International - OTP Verification
      
      Hello${name ? ' ' + name : ''}!
      
      Your verification code is: ${otp}
      
      This OTP is valid for 10 minutes.
      
      Please do not share this OTP with anyone.
      
      © 2026 Vaahan International
    `

    await client.messages.create({
      body: message,
      to: formattedMobile,
      from: process.env.TWILIO_PHONE_NUMBER
    })

    console.log(`✅ OTP SMS sent to ${mobile}`)
    return { success: true }
  } catch (error) {
    console.error('❌ SMS send error:', error)
    // For development, log the OTP
    console.log(`📱 Development OTP for ${mobile}: ${otp}`)
    return { success: false, error: error.message }
  }
}