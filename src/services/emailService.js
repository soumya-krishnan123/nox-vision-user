
const { verificationEmail, 
  passwordResetEmail,
   otpEmail,
   contactUsNotificationEmail

 } = require('../utils/mailTemplates');
const logger = require('../utils/logger');
const config = require('../config/env');
const nodemailer = require('nodemailer');
const db = require('../config/db');
// Create transporter
const getPrimaryMailAccount = async () => {
  const query = `
    SELECT * FROM mail_accounts
    WHERE status = true AND name = 'Primary Gmail'
    ORDER BY id ASC
    LIMIT 1
  `;
  const { rows } = await db.query(query);
  return rows[0]; // returns the first active account
};

// 📬 Create Nodemailer transporter from DB credentials
const createTransporter = async () => {
  const account = await getPrimaryMailAccount();

  if (!account) {
    throw new Error('No active mail account found in database.');
  }

  return nodemailer.createTransport({
    host: account.smtp_host,
    port: account.smtp_port,
    secure: account.smtp_port === 465, // SSL vs TLS
    auth: {
      user: account.smtp_user,
      pass: account.smtp_pass, // decrypt here if encrypted
    },
  });
};

// 📤 Send Mail Helper
const sendMail = async ({ to, subject, html }) => {
  const transporter = await createTransporter(); // <-- Await here
  const account = await getPrimaryMailAccount(); // <-- Needed for "from" email
console.log(account,'account',to,'to',account.smtp_user,'account.smtp_user');
  const mailOptions = {
    from: `"${config.APP_NAME}" <${account.smtp_user}>`, // Use DB email here
    to,
    subject,
    html,
  };
  console.log(`Sending email FROM: ${mailOptions.from} TO: ${mailOptions.to}`);

  const info = await transporter.sendMail(mailOptions);
  return info;
};


// Send verification email
exports.sendVerificationEmail = async (email, token, userName) => {
  logger.info('Sending verification email to:', email);
  const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;
  const html = verificationEmail(userName, verificationUrl);
  console.log('email in send verification mail',email,userName,'userName');
  return sendMail({ to: email, subject: 'Verify Your Email Address', html });
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, token, userName) => {
  const resetUrl = `${config.FRONTEND_URL}/password-confirm?token=${token}`;
  const html = passwordResetEmail(userName, resetUrl);
  return sendMail({ to: email, subject: 'Reset Your Password', html });
};

// Send OTP email
exports.sendOtpToEmail = async (email, otp, purpose = 'Verification') => {
  const html = otpEmail(otp, purpose);
  return sendMail({ to: email, subject: `${purpose} OTP from ${config.APP_NAME}`, html });
};

exports.notifyAdminOfContact = async (enquiry) => {
  const html = contactUsNotificationEmail(enquiry);
  return sendMail({
    to: 'soumya@ibosoninnov.com', // e.g., admin@noxvision.com
    subject: 'New Customer Enquiry from Contact Us Form',
    html,
  });
};
