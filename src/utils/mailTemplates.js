const config = require('../config/env');

exports.verificationEmail = (userName, verificationUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
      <h1 style="color: #333; margin: 0;">Welcome to ${config.APP_NAME}!</h1>
    </div>
    <div style="padding: 20px; background-color: #ffffff;">
      <h2>Hi ${userName},</h2>
      <p>Please verify your email address by clicking below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background:#007bff; color:white; padding:12px 30px; border-radius:5px;">Verify Email</a>
      </div>
      <p>If the button doesn't work, copy this link: ${verificationUrl}</p>
    </div>
    <div style="background:#f8f9fa; text-align:center; padding:20px; font-size:12px;">This is an automated email. Do not reply.</div>
  </div>
`;

exports.passwordResetEmail = (userName, resetUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
      <h1>Password Reset Request</h1>
    </div>
    <div style="padding: 20px; background-color: #ffffff;">
      <h2>Hi ${userName},</h2>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background:#dc3545; color:white; padding:12px 30px; border-radius:5px;">Reset Password</a>
      </div>
      <p>If the button doesn't work, copy this link: ${resetUrl}</p>
    </div>
    <div style="background:#f8f9fa; text-align:center; padding:20px; font-size:12px;">This is an automated email. Do not reply.</div>
  </div>
`;

exports.otpEmail = (otp, purpose) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
      <h1>OTP Verification</h1>
    </div>
    <div style="padding: 20px; background-color: #ffffff;">
      <p>Your OTP for ${purpose.toLowerCase()} is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="background:#dc3545; color:white; padding:12px 30px; font-weight:bold; font-size:20px;">${otp}</span>
      </div>
    </div>
    <div style="background:#f8f9fa; text-align:center; padding:20px; font-size:12px;">This is an automated email. Do not reply.</div>
  </div>
`;
exports.contactUsNotificationEmail = ({ name, email, company, services = [], message }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
      <h2 style="margin: 0;">New Contact Us Submission</h2>
    </div>

    <div style="background-color: #ffffff; padding: 20px;">
      <p style="font-size: 16px;">You have received a new enquiry from your website:</p>
      
      <table style="width: 100%; font-size: 14px; margin-top: 15px;">
        <tr>
          <td style="font-weight: bold; padding: 5px 0;">Name:</td>
          <td>${name}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 5px 0;">Email:</td>
          <td><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 5px 0;">Company:</td>
          <td>${company || 'N/A'}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 5px 0;">Services Interested:</td>
          <td>${services.length ? services.join(', ') : 'N/A'}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 5px 0;">Message:</td>
          <td style="white-space: pre-line;">${message || 'No additional message provided.'}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
      <p>This is an automated message from ${config.APP_NAME}. Do not reply to this email.</p>
    </div>
  </div>
`;
