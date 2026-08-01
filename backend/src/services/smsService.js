// backend/src/services/smsService.js
/*
================================================================================
File Name : smsService.js
Author : Tahseen Raza
Created Date : 2026-06-23
Description : SMS service for sending OTP via Brevo API
Company : DryvSquad
Copyright : (c) 2026 DryvSquad. All rights reserved.
================================================================================
*/

const axios = require('axios');

// Brevo SMS API endpoint
const BREVO_SMS_API_URL = 'https://api.brevo.com/v3/transactionalSMS/sms';

// ✅ Format phone number to E.164 format (works for all Indian numbers)
const formatPhoneNumber = (phoneNumber) => {
  // Remove all spaces, brackets, dashes, and special characters
  let cleaned = phoneNumber.replace(/\s/g, '').replace(/[()\-]/g, '');
  
  // If it starts with 0 (e.g., 07646074286), remove the leading 0
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // If it already has +, return as is (already in E.164 format)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // If it starts with 91 (India country code without +), add +
  if (cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  // Default: assume Indian number without country code, add +91
  return `+91${cleaned}`;
};

// Send SMS via Brevo API
const sendSMSOTP = async (phoneNumber, otp, purpose = 'verify') => {
  try {
    console.log(`📱 Original number: ${phoneNumber}`);

    // ✅ Format phone number properly
    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log(`📱 Formatted number: ${formattedNumber}`);

    // Validate phone number (E.164 format: + followed by 8-15 digits)
    const phoneRegex = /^\+[0-9]{8,15}$/;
    if (!phoneRegex.test(formattedNumber)) {
      console.error('❌ Invalid phone number format after formatting:', formattedNumber);
      return {
        success: false,
        error: 'Invalid phone number format. Please use format: +919876543210',
      };
    }

    // Check for API key
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('❌ BREVO_API_KEY not found in .env');
      return {
        success: false,
        error: 'SMS service not configured. Please add BREVO_API_KEY to .env',
      };
    }

    // Get sender name
    const senderName = process.env.SENDER_NAME || 'DryvSquad';
    const sender = process.env.BREVO_SMS_SENDER || 'DRYVSQ';

    // Customize message based on purpose
    let message = '';
    if (purpose === 'login') {
      message = `${senderName}\nYour login OTP is: ${otp}\nValid for 10 minutes. Do not share this OTP.\n\n- ${senderName}`;
    } else if (purpose === 'verify_phone') {
      message = `${senderName}\nYour mobile verification OTP is: ${otp}\nValid for 10 minutes. Do not share this OTP.\n\n- ${senderName}`;
    } else if (purpose === 'verify') {
      message = `${senderName}\nYour verification OTP is: ${otp}\nValid for 10 minutes. Do not share this OTP.\n\n- ${senderName}`;
    } else {
      message = `${senderName}\nYour OTP is: ${otp}\nValid for 10 minutes.\n\n- ${senderName}`;
    }

    // Prepare request data for Brevo SMS API
    const smsData = {
      sender: sender,
      recipient: formattedNumber,
      content: message,
      type: 'transactional',
      tag: 'otp_verification',
    };

    console.log(`📤 Sending SMS to ${formattedNumber}...`);
    console.log(`📤 Sender: ${sender}`);

    // Send SMS via Brevo API
    const response = await axios.post(BREVO_SMS_API_URL, smsData, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      timeout: 15000,
    });

    console.log(`✅ SMS sent successfully to ${formattedNumber}`);
    console.log(`📊 Response:`, response.data);

    return {
      success: true,
      messageId: response.data?.messageId || 'sms_sent',
      status: response.data?.status || 'sent',
    };
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);

    // Detailed error handling
    if (error.response) {
      console.error('📊 Brevo API Response:', error.response.data);
      console.error('📊 Status Code:', error.response.status);

      // Handle specific Brevo error codes
      if (error.response.status === 402) {
        return {
          success: false,
          error: 'SMS credits exhausted. Please use email instead.', // ✅ User-friendly message
        };
      } else if (error.response.status === 403) {
        return {
          success: false,
          error: 'SMS not enabled for this account. Please use email instead.',
        };
      } else if (error.response.status === 400) {
        const errorMsg = error.response.data?.message || 'Invalid SMS request';
        if (errorMsg.includes('telephone') || errorMsg.includes('number')) {
          return {
            success: false,
            error: 'Invalid phone number. Please use email instead.',
          };
        }
        if (errorMsg.includes('sender')) {
          return {
            success: false,
            error: 'Invalid Sender ID. Please use email instead.',
          };
        }
        return { success: false, error: errorMsg };
      } else if (error.response.status === 401) {
        return {
          success: false,
          error: 'Invalid API key. Please use email instead.',
        };
      }
    } else if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'SMS service timeout. Please try with email.',
      };
    }

    return {
      success: false,
      error: 'SMS service unavailable. Please try with email.',
    };
  }
};

// For development - log OTP instead of sending
const sendSMSOTPDev = async (phoneNumber, otp, purpose = 'verify') => {
  const formatted = formatPhoneNumber(phoneNumber);
  console.log(`📱 [DEV] SMS OTP for ${formatted}: ${otp}`);
  console.log(`📱 [DEV] Purpose: ${purpose}`);
  return { success: true, messageId: 'dev-mode' };
};

// Main SMS function - auto-detects environment
const sendSMS = async (phoneNumber, otp, purpose = 'verify') => {
  // If in development mode, just log
  if (process.env.NODE_ENV === 'development') {
    return await sendSMSOTPDev(phoneNumber, otp, purpose);
  }

  // Production - send via Brevo API
  return await sendSMSOTP(phoneNumber, otp, purpose);
};

module.exports = { sendSMSOTP, sendSMS };