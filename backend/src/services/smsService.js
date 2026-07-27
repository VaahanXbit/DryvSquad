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

// Send SMS via Brevo API
const sendSMSOTP = async (phoneNumber, otp, purpose = 'verify') => {
  try {
    console.log(`📱 Attempting to send SMS to ${phoneNumber}...`);

    // Format phone number - ensure it's in international format
    let formattedNumber = phoneNumber.replace(/\s/g, '');
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = `+${formattedNumber}`;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\+[0-9]{8,15}$/;
    if (!phoneRegex.test(formattedNumber)) {
      console.error('❌ Invalid phone number format:', formattedNumber);
      return {
        success: false,
        error: 'Invalid phone number format. Please include country code.',
      };
    }

    // ✅ Check for API key
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('❌ BREVO_API_KEY not found in .env');
      return {
        success: false,
        error: 'SMS service not configured. Please add BREVO_API_KEY to .env',
      };
    }

    // ✅ Get sender name
    const senderName = process.env.SENDER_NAME || 'DryvSquad';
    const sender = process.env.BREVO_SMS_SENDER || 'DRYVSQ';

    // Customize message based on purpose (without emojis for SMS)
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

    // ✅ Send SMS via Brevo API (HTTPS - port 443)
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
          error: 'Insufficient SMS credits. Please add credits in Brevo.',
        };
      } else if (error.response.status === 403) {
        return {
          success: false,
          error: 'SMS not enabled for this account. Please enable SMS in Brevo.',
        };
      } else if (error.response.status === 400) {
        const errorMsg = error.response.data?.message || 'Invalid SMS request';
        if (errorMsg.includes('sender')) {
          return {
            success: false,
            error: 'Invalid Sender ID. Please register a sender in Brevo.',
          };
        }
        return { success: false, error: errorMsg };
      } else if (error.response.status === 401) {
        return {
          success: false,
          error: 'Invalid API key. Please check your BREVO_API_KEY.',
        };
      }
    } else if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'SMS service timeout. Please try again.',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
};

// For development - log OTP instead of sending
const sendSMSOTPDev = async (phoneNumber, otp, purpose = 'verify') => {
  console.log(`📱 [DEV] SMS OTP for ${phoneNumber}: ${otp}`);
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