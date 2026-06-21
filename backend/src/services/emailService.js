// backend/src/services/emailService.js
/*
================================================================================
File Name : emailService.js
Author : Tahseen Raza
Created Date : 2026-06-19
Description : Email service for sending OTP and notifications
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_PROVIDER) {
    // Production - Use real email services
    if (process.env.EMAIL_PROVIDER === 'sendgrid') {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    }

    if (process.env.EMAIL_PROVIDER === 'gmail') {
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  }

  // Development - Use Ethereal
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_EMAIL || 'your-ethereal-email@ethereal.email',
      pass: process.env.ETHEREAL_PASSWORD || 'your-ethereal-password',
    },
  });
};

const sendOTPEmail = async (email, otp, purpose = 'verify') => {
  try {
    const transporter = createTransporter();
    await transporter.verify();

    const subject = 'Your OTP for Vaahan International';
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
          .content { padding: 40px; }
          .otp-box { background: #f8f9fa; border: 2px dashed #CFB32B; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 48px; font-weight: 800; color: #CFB32B; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .footer { background: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e9ecef; }
          .footer p { color: #888; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Vaahan International</h1>
            <p style="color: rgba(26,26,26,0.8);">Your trusted automotive partner</p>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 8px;">Hello,</p>
            <p style="color: #555; font-size: 16px; margin-bottom: 24px;">
              You requested to ${purpose === 'login' ? 'sign in to' : 'verify your account on'} 
              <strong>Vaahan International</strong>.
            </p>
            <div class="otp-box">
              <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Your One-Time Password</div>
              <div class="otp-code">${otp}</div>
              <div style="margin-top: 12px; color: #888; font-size: 13px;">
                Valid for <strong style="color: #CFB32B;">10 minutes</strong>
              </div>
            </div>
            <div style="background: #f0f7ff; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #CFB32B;">
              <div style="display: flex; align-items: center; gap: 10px; padding: 4px 0; color: #555; font-size: 14px;">
                <span>🔒</span>
                <span><strong>Never share</strong> this OTP with anyone</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px; padding: 4px 0; color: #555; font-size: 14px;">
                <span>⏱️</span>
                <span>This OTP will expire in <strong>10 minutes</strong></span>
              </div>
            </div>
            <p style="color: #888; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <strong>Need help?</strong> Contact us at support@vaahan.com
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Vaahan International. All rights reserved.</p>
            <p style="font-size: 12px; margin-top: 4px;">This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Vaahan International" <noreply@vaahan.com>`,
      to: email,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 OTP email sent to ${email}: ${info.messageId}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true, messageId: info.messageId, preview: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTPEmail };