// backend/src/services/emailService.js
/*
================================================================================
File Name : emailService.js
Author : Tahseen Raza
Created Date : 2026-06-19
Description : Email service for sending OTP and notifications
Company : DryvSquad
Copyright : (c) 2026 DryvSquad. All rights reserved.
================================================================================
*/

const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Development - Use Ethereal
  if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_PROVIDER) {
    console.log('📧 Using Ethereal email service (test mode)');

    if (process.env.ETHEREAL_EMAIL && process.env.ETHEREAL_PASSWORD) {
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.ETHEREAL_EMAIL,
          pass: process.env.ETHEREAL_PASSWORD,
        },
      });
    }

    console.log('📧 Creating new Ethereal test account...');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'your-ethereal-email@ethereal.email',
        pass: 'your-ethereal-password',
      },
    });
  }

  // Production email providers
  console.log('📧 Using production email service');

  // Brevo (Sendinblue)
  if (process.env.EMAIL_PROVIDER === 'brevo') {
    console.log('📧 Using Brevo email service');
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASSWORD,
      },
    });
  }

  // Gmail
  if (process.env.EMAIL_PROVIDER === 'gmail') {
    console.log('📧 Using Gmail email service');
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

  // SendGrid
  if (process.env.EMAIL_PROVIDER === 'sendgrid') {
    console.log('📧 Using SendGrid email service');
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

  // Mailgun
  if (process.env.EMAIL_PROVIDER === 'mailgun') {
    console.log('📧 Using Mailgun email service');
    return nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_SMTP_USER,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
    });
  }

  // Default fallback to Ethereal
  console.log('📧 Falling back to Ethereal email service');
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
    console.log(`📧 Attempting to send OTP to ${email}...`);

    const transporter = createTransporter();

    // Verify connection
    // try {
    //   await transporter.verify();
    //   console.log('✅ Email transporter verified successfully');
    // } catch (verifyError) {
    //   console.error('❌ Email transporter verification failed:', verifyError.message);
    //   return { success: false, error: 'Email service not configured properly' };
    // }

    // ✅ FIX: Get sender details from .env
    const senderName = process.env.SENDER_NAME || 'DryvSquad';
    const senderEmail = process.env.EMAIL_FROM || 'contact@dryvsquad.com';

    // ✅ FIX: Combine to proper format: "Display Name" <email@domain.com>
    const fromAddress = `"${senderName}" <${senderEmail}>`;

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

    // ✅ FIX: Use the formatted from address with display name
    const mailOptions = {
      from: fromAddress,  // This is now: "DryvSquad" <contact@dryvsquad.com>
      to: email,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}: ${info.messageId}`);

    // Get preview URL for Ethereal (development only)
    let previewUrl = null;
    if (process.env.NODE_ENV === 'development') {
      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📧 OTP Preview URL: ${previewUrl}`);
        console.log(`🔑 OTP Code: ${otp} (for testing)`);
      }
    }

    return {
      success: true,
      messageId: info.messageId,
      preview: previewUrl,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
  } catch (error) {
    console.error("FULL ERROR:", error);
    console.error("CODE:", error.code);
    console.error("COMMAND:", error.command);
    console.error("MESSAGE:", error.message);

    // Provide more specific error messages
    let errorMessage = error.message;
    if (errorMessage.includes('sender')) {
      errorMessage = 'Sender email not verified. Please verify your email in Brevo.';
    } else if (errorMessage.includes('auth')) {
      errorMessage = 'SMTP authentication failed. Check your credentials.';
    } else if (errorMessage.includes('connect')) {
      errorMessage = 'Could not connect to email server. Check your internet.';
    }

    return { success: false, error: errorMessage };
  }
};

module.exports = { sendOTPEmail };
