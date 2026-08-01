// backend/src/services/whatsappService.js
/*
================================================================================
File Name : whatsappService.js
Author : Tahseen Raza
Created Date : 2026-08-01
Description : WhatsApp service using Twilio API
Company : DryvSquad
Copyright : (c) 2026 DryvSquad. All rights reserved.
================================================================================
*/

const twilio = require('twilio');

let twilioClient = null;

// Initialize Twilio client
const getTwilioClient = () => {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      console.error('❌ Twilio credentials not configured');
      return null;
    }
    
    twilioClient = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized');
  }
  return twilioClient;
};

// Format phone number to E.164 format
const formatPhoneNumber = (phoneNumber) => {
  let cleaned = phoneNumber.replace(/\s/g, '').replace(/[()\-]/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  if (cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  return `+91${cleaned}`;
};

// Send WhatsApp message using Twilio
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    console.log(`📱 Sending WhatsApp to ${phoneNumber}...`);
    
    const client = getTwilioClient();
    if (!client) {
      return {
        success: false,
        error: 'Twilio client not configured',
      };
    }

    const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
    const to = `whatsapp:${formatPhoneNumber(phoneNumber)}`;

    console.log(`📤 From: ${from}`);
    console.log(`📤 To: ${to}`);

    const result = await client.messages.create({
      from: from,
      to: to,
      body: message,
    });

    console.log(`✅ WhatsApp sent: ${result.sid}`);
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error('❌ WhatsApp failed:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
    };
  }
};

// Send verification code via WhatsApp
const sendVerificationCode = async (phoneNumber, code) => {
  const message = `DryvSquad Verification

Your verification code is:

${code}

This code expires in 5 minutes.

Do not share this code with anyone.`;
  
  return await sendWhatsAppMessage(phoneNumber, message);
};

// Send marketing/broadcast message
const sendMarketingMessage = async (phoneNumber, message) => {
  return await sendWhatsAppMessage(phoneNumber, message);
};

// Send bulk messages (for marketing)
const sendBulkWhatsApp = async (phoneNumbers, message) => {
  const results = [];
  for (const phone of phoneNumbers) {
    const result = await sendWhatsAppMessage(phone, message);
    results.push({ phone, ...result });
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return results;
};

// Check WhatsApp credit balance
const getBalance = async () => {
  try {
    const client = getTwilioClient();
    if (!client) return { success: false, error: 'Twilio not configured' };
    
    const balance = await client.balance.fetch();
    return {
      success: true,
      balance: balance.balance,
      currency: balance.currency,
    };
  } catch (error) {
    console.error('❌ Balance check failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendVerificationCode,
  sendMarketingMessage,
  sendBulkWhatsApp,
  getBalance,
  formatPhoneNumber,
};