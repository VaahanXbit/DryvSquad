// backend/src/services/emailService.js
/*
================================================================================
File Name : emailService.js
Author : Tahseen Raza
Created Date : 2026-06-19
Description : Email service for sending OTP and notifications via Brevo API
Company : DryvSquad
Copyright : (c) 2026 DryvSquad. All rights reserved.
================================================================================
*/

const axios = require('axios');

// Brevo Email API endpoint
const BREVO_EMAIL_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendOTPEmail = async (email, otp, purpose = 'verify') => {
  try {
    console.log(`📧 Attempting to send OTP to ${email}...`);

    // ✅ Check for API key
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('❌ BREVO_API_KEY not found in .env');
      return { 
        success: false, 
        error: 'Email service not configured. Please add BREVO_API_KEY to .env' 
      };
    }

    // ✅ Get sender details from .env
    const senderName = process.env.SENDER_NAME || 'DryvSquad';
    const senderEmail = process.env.EMAIL_FROM || 'contact@dryvsquad.com';

    const subject = `Your OTP for ${senderName}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #CFB32B, #e8c84c); padding: 30px 40px; text-align: center; }
          .header h1 { color: #1a1a1a; font-size: 28px; font-weight: 800; }
          .header p { color: rgba(26, 26, 26, 0.8); font-size: 14px; }
          .content { padding: 40px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 8px; }
          .message { color: #555; font-size: 16px; margin-bottom: 24px; }
          .otp-box { background: #f8f9fa; border: 2px dashed #CFB32B; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 48px; font-weight: 800; color: #CFB32B; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .otp-label { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
          .info { background: #f0f7ff; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #CFB32B; }
          .info-item { display: flex; align-items: center; gap: 10px; padding: 4px 0; color: #555; font-size: 14px; }
          .footer { background: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e9ecef; }
          .footer p { color: #888; font-size: 13px; }
          .badge { display: inline-block; background: #CFB32B; color: #1a1a1a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          @media (max-width: 480px) {
            .header { padding: 20px; }
            .content { padding: 24px; }
            .otp-code { font-size: 36px; letter-spacing: 4px; }
            .footer { padding: 16px 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 ${senderName}</h1>
            <p>Your trusted automotive partner</p>
          </div>
          <div class="content">
            <p class="greeting">Hello,</p>
            <p class="message">
              You requested to ${purpose === 'login' ? 'sign in to' : 'verify your account on'} 
              <strong>${senderName}</strong>.
            </p>
            <p class="message">Please use the following OTP to complete your ${purpose === 'login' ? 'login' : 'verification'}:</p>
            
            <div class="otp-box">
              <div class="otp-label">Your One-Time Password</div>
              <div class="otp-code">${otp}</div>
              <div style="margin-top: 12px; color: #888; font-size: 13px;">
                Valid for <strong style="color: #CFB32B;">10 minutes</strong>
              </div>
            </div>

            <div class="info">
              <div class="info-item">
                <span>🔒</span>
                <span><strong>Never share</strong> this OTP with anyone</span>
              </div>
              <div class="info-item">
                <span>⏱️</span>
                <span>This OTP will expire in <strong>10 minutes</strong></span>
              </div>
              <div class="info-item">
                <span>📧</span>
                <span>If you didn't request this, <strong>ignore this email</strong></span>
              </div>
            </div>

            <p style="color: #888; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <strong>Need help?</strong> Contact us at ${process.env.ADMIN_EMAIL || 'contact@dryvsquad.com'}
            </p>
          </div>
          <div class="footer">
            <p>
              <span class="badge">${purpose === 'login' ? '🔐 Login' : '✅ Verify'}</span>
            </p>
            <p style="margin-top: 8px;">
              &copy; ${new Date().getFullYear()} ${senderName}. All rights reserved.
            </p>
            <p style="font-size: 12px; margin-top: 4px;">
              This is an automated email, please do not reply.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // ✅ Use Brevo API (HTTPS) instead of SMTP
    const requestData = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email }],
      subject: subject,
      htmlContent: html,
    };

    console.log(`📤 Sending email via Brevo API to ${email}...`);

    const response = await axios.post(BREVO_EMAIL_API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      timeout: 15000,
    });

    console.log(`✅ OTP email sent to ${email}: ${response.data?.messageId}`);
    console.log(`📊 Response:`, response.data);

    return {
      success: true,
      messageId: response.data?.messageId || 'email_sent',
    };
  } catch (error) {
    console.error("❌ Email sending failed:");
    console.error("FULL ERROR:", error.message);
    
    if (error.response) {
      console.error("📊 Brevo API Response:", error.response.data);
      console.error("📊 Status Code:", error.response.status);
      
      // Handle specific error codes
      if (error.response.status === 401) {
        return { success: false, error: 'Invalid API key. Please check your BREVO_API_KEY.' };
      } else if (error.response.status === 429) {
        return { success: false, error: 'Rate limit exceeded. Please try again later.' };
      } else if (error.response.status === 400) {
        return { success: false, error: error.response.data?.message || 'Invalid email request.' };
      }
    } else if (error.code === 'ECONNABORTED') {
      return { success: false, error: 'Email service timeout. Please try again.' };
    }

    return { success: false, error: error.message || 'Failed to send email' };
  }
};

module.exports = { sendOTPEmail };