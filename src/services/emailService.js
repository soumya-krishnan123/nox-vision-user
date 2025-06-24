const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.SMTP_HOST || 'smtp.gmail.com',
    port: config.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS
    }
  });
};

// Send verification email
exports.sendVerificationEmail = async (email, verificationToken, userName) => {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"${config.APP_NAME || 'Nox Vision'}" <${config.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Welcome to ${config.APP_NAME || 'Nox Vision'}!</h1>
          </div>
          
          <div style="padding: 20px; background-color: #ffffff;">
            <h2 style="color: #333;">Hi ${userName},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for registering with us! To complete your registration, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #007bff; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Best regards,<br>
              The ${config.APP_NAME || 'Nox Vision'} Team
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Error sending verification email to ${email}:`, error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${config.APP_NAME || 'Nox Vision'}" <${config.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Password Reset Request</h1>
          </div>
          
          <div style="padding: 20px; background-color: #ffffff;">
            <h2 style="color: #333;">Hi ${userName},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #007bff; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              This reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Best regards,<br>
              The ${config.APP_NAME || 'Nox Vision'} Team
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Error sending password reset email to ${email}:`, error);
    throw new Error('Failed to send password reset email');
  }
};



exports.sendOtpToEmail = async (toEmail, otp, purpose = 'Verification') => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"${config.APP_NAME}" <${config.SMTP_USER}>`,
      to: toEmail,
      subject: `${purpose} OTP from ${config.APP_NAME}`,
      html: `
      
       
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
      <h1 style="color: #333; margin: 0;">OTP Verification</h1>
    </div>

    <div style="padding: 20px; background-color: #ffffff;">
      <h2 style="color: #333;">Dear User,</h2>

      <p style="color: #666; line-height: 1.6;">
        Your OTP for <strong>${purpose.toLowerCase()}</strong> is:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <span style="
          background-color: #dc3545;
          color: white;
          padding: 12px 30px;
          border-radius: 5px;
          display: inline-block;
          font-weight: bold;
          font-size: 20px;
          letter-spacing: 4px;
        ">
          ${otp}
        </span>
      </div>

      <p style="color: #666; line-height: 1.6;">
        This OTP is valid for 10 minutes. Please do not share it with anyone.
      </p>

      <p style="color: #666; line-height: 1.6;">
        Best regards,<br />
        The ${config.APP_NAME || 'Nox Vision'} Team
      </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>

        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Could not send OTP email');
  }
}
