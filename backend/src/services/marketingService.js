// backend/src/services/marketingService.js
/*
================================================================================
File Name : marketingService.js
Author : Tahseen Raza
Created Date : 2026-08-01
Description : Marketing broadcast service for WhatsApp
Company : DryvSquad
Copyright : (c) 2026 DryvSquad. All rights reserved.
================================================================================
*/

const MarketingConsent = require('../models/MarketingConsent');
const { sendBulkWhatsApp } = require('./whatsappService');

// Send marketing message to all consented users
const sendMarketingBroadcast = async (message, filter = {}) => {
  try {
    // Get all users who have consented
    const users = await MarketingConsent.find({
      consented: true,
      ...filter,
    });

    if (users.length === 0) {
      console.log('📊 No users with marketing consent');
      return { success: true, count: 0 };
    }

    console.log(`📊 Sending to ${users.length} users...`);

    const phoneNumbers = users.map(u => u.phoneNumber);
    const results = await sendBulkWhatsApp(phoneNumbers, message);

    // Update last message time for sent users
    for (const result of results) {
      if (result.success) {
        await MarketingConsent.findOneAndUpdate(
          { phoneNumber: result.phone },
          { 
            $inc: { totalMessagesSent: 1 },
            $set: { lastMessageAt: new Date() },
          }
        );
      }
    }

    return {
      success: true,
      total: results.length,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results: results,
    };
  } catch (error) {
    console.error('❌ Broadcast failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = { sendMarketingBroadcast };