// backend/src/controllers/contactController.js
// Complete final version

const nodemailer = require('nodemailer');

// ========================================
// Email Transporter for Brevo
// ========================================
const createTransporter = () => {
    console.log('📧 Using Brevo email service (Production)');

    return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASSWORD,
        },
    });
};

// ========================================
// POST /api/contact - Send contact form
// ========================================
exports.sendContactForm = async (req, res) => {
    try {
        const { fullName, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!fullName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields',
            });
        }

        // Validate email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address',
            });
        }

        console.log(`📧 New contact form submission from ${fullName} (${email})`);

        const transporter = createTransporter();

        // ========================================
        // ADMIN EMAIL HTML
        // ========================================
        const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #CFB32B, #e8c84c); padding: 30px 40px; text-align: center; }
          .header h1 { color: #1a1a1a; font-size: 24px; font-weight: 800; }
          .header p { color: rgba(26, 26, 26, 0.8); font-size: 14px; }
          .content { padding: 40px; }
          .field { margin-bottom: 16px; padding: 12px 16px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #CFB32B; }
          .field-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
          .field-value { font-size: 16px; color: #1a1a1a; margin-top: 4px; }
          .footer { background: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e9ecef; }
          .footer p { color: #888; font-size: 13px; }
          .badge { display: inline-block; background: #CFB32B; color: #1a1a1a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .reply-btn { display: inline-block; background: #CFB32B; color: #1a1a1a; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Vaahan International</h1>
            <p>📬 New Contact Form Submission</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">👤 Full Name</div>
              <div class="field-value"><strong>${fullName}</strong></div>
            </div>
            <div class="field">
              <div class="field-label">✉️ Email</div>
              <div class="field-value"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${phone ? `
            <div class="field">
              <div class="field-label">📞 Phone</div>
              <div class="field-value"><a href="tel:${phone}">${phone}</a></div>
            </div>
            ` : ''}
            <div class="field">
              <div class="field-label">📌 Subject</div>
              <div class="field-value"><strong>${subject}</strong></div>
            </div>
            <div class="field" style="background: #f0f7ff; border-left-color: #2d7ff9;">
              <div class="field-label">💬 Message</div>
              <div class="field-value" style="white-space: pre-wrap;">${message}</div>
            </div>
            <div style="margin-top: 20px; padding: 12px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>📅 Received:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
            </div>
            <div style="margin-top: 20px; text-align: center;">
              <a href="mailto:${email}?subject=Re: ${subject}" class="reply-btn">
                ✉️ Reply to ${fullName}
              </a>
            </div>
          </div>
          <div class="footer">
            <p>
              <span class="badge">📬 New Inquiry</span>
            </p>
            <p style="margin-top: 8px;">
              &copy; ${new Date().getFullYear()} Vaahan International. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

        // ========================================
        // USER AUTO-REPLY EMAIL HTML
        // ========================================
        const userReplyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #CFB32B, #e8c84c); padding: 30px 40px; text-align: center; }
          .header h1 { color: #1a1a1a; font-size: 24px; font-weight: 800; }
          .header p { color: rgba(26, 26, 26, 0.8); font-size: 14px; }
          .content { padding: 40px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 8px; }
          .message-text { color: #555; font-size: 16px; line-height: 1.8; }
          .info-box { background: #f0f7ff; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #CFB32B; }
          .footer { background: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e9ecef; }
          .footer p { color: #888; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Vaahan International</h1>
            <p>✅ We've received your message</p>
          </div>
          <div class="content">
            <p class="greeting">Dear ${fullName},</p>
            <p class="message-text">
              Thank you for reaching out to <strong>Vaahan International</strong>.
            </p>
            <p class="message-text">
              We have received your inquiry and our team will get back to you within <strong>24-48 hours</strong>.
            </p>
            <div class="info-box">
              <p style="margin: 0; color: #555; font-size: 14px;">
                <strong>📌 Subject:</strong> ${subject}
              </p>
              <p style="margin: 8px 0 0 0; color: #555; font-size: 14px;">
                <strong>📅 Received:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
            </div>
            <p style="color: #888; font-size: 14px; margin-top: 20px;">
              📞 Need immediate assistance? Call us at <strong>+91 98765 43210</strong>
            </p>
            <p style="color: #888; font-size: 13px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              🌐 Visit our website: <a href="https://vaahan-international.com" style="color: #CFB32B; text-decoration: none;">vaahan-international.com</a>
            </p>
          </div>
          <div class="footer">
            <p>
              &copy; ${new Date().getFullYear()} Vaahan International. All rights reserved.
            </p>
            <p style="font-size: 12px; margin-top: 4px;">
              This is an automated reply, please do not reply directly.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

        // ========================================
        // EMAIL CONFIGURATION - FINAL
        // ========================================

        const senderName = process.env.SENDER_NAME || 'Vaahan International';
        const fromEmail = process.env.EMAIL_FROM || 'taushifraza2015@gmail.com';
        const adminEmail = process.env.ADMIN_EMAIL || 'taushifraza2015@gmail.com';

        // Format: "Vaahan International" <taushifraza2015@gmail.com>
        const fromAddress = `"${senderName}" <${fromEmail}>`;

        console.log(`📧 From: ${fromAddress}`);
        console.log(`📧 Admin (where you receive): ${adminEmail}`);
        console.log(`📧 User (auto-reply): ${email}`);

        // ADMIN EMAIL - Goes to YOU (with alias)
        const adminMailOptions = {
            from: fromAddress,
            to: adminEmail,  // taushifraza2015+admin@gmail.com
            subject: `📬 New Contact Form: ${subject}`,
            html: adminEmailHtml,
            replyTo: email,
        };

        // USER AUTO-REPLY - Goes to User
        const userMailOptions = {
            from: fromAddress,
            to: email,
            subject: '✅ We\'ve received your message - Vaahan International',
            html: userReplyHtml,
        };

        // ========================================
        // Send emails
        // ========================================
        console.log('📧 Sending admin email to:', adminEmail);
        console.log('📧 Sending auto-reply to:', email);

        const adminResult = await transporter.sendMail(adminMailOptions);
        console.log("ADMIN RESULT:", adminResult);

        const userResult = await transporter.sendMail(userMailOptions);
        console.log("USER RESULT:", userResult);

        console.log(`✅ Contact form emails sent successfully:`);
        console.log(`   - Admin: ${adminResult.messageId}`);
        console.log(`   - User: ${userResult.messageId}`);

        return res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully!',
        });

    } catch (error) {
        console.error('❌ Contact form error:', error);

        if (error.response) {
            console.error('📊 Brevo API Response:', error.response.data);
            console.error('📊 Status Code:', error.response.status);
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};