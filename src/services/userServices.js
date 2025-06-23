const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');
const userModel = require('../models/userModel');
const emailService = require('./emailService');
const googleAuthService = require('./googleAuthService');
const { log } = require('console');

exports.createUser = async (userData) => {
  // Check if user already exists
  console.log(userData);
  const existingUser = await userModel.findByEmail(userData.email);
  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }
  const existingUser2 = await userModel.findByGoogleId(userData.google_id);
  if (existingUser2) {
    const error = new Error('User with this google id already exists');
    error.statusCode = 409;
    throw error;
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpiry = Date.now() + 86400000; // 24 hours from now

  // Create user
  const user = await userModel.create({
    ...userData,
    password: hashedPassword,
    email_verification_token: verificationToken,
    email_verification_expiry: verificationExpiry
  });

  // Send verification email
  try {
    await emailService.sendVerificationEmail(userData.email, verificationToken, userData.name);
  } catch (emailError) {
    // Log the error but don't fail the registration
    console.error('Failed to send verification email:', emailError);
  }

  // Remove password from response
  delete user.password;
  
  return user;
};

exports.loginUser = async (email, password) => {
  // Find user
  const user = await userModel.findByEmail(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Check if email is verified (only for non-Google users)
  if (!user.google_id && !user.is_email_verified) {
    const error = new Error('Please verify your email address before logging in');
    error.statusCode = 403;
    throw error;
  }

  // Check password (only for non-Google users)
  if (!user.google_id) {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }
  } else {
    // Google user trying to login with password
    const error = new Error('Please use Google Sign-In for this account');
    error.statusCode = 401;
    throw error;
  }

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  // Remove password from response
  delete user.password;

  return { user, token };
};

// Google authentication
exports.googleAuth = async (idToken) => {
  try {
    const result = await googleAuthService.handleGoogleAuth(idToken);
    return result;
  } catch (error) {
    throw error;
  }
};

// Get Google OAuth URL
exports.getGoogleAuthUrl = () => {
  return googleAuthService.getGoogleAuthUrl();
};

// Handle Google OAuth callback
exports.handleGoogleCallback = async (code) => {
  try {
    // Exchange code for tokens
    const tokens = await googleAuthService.exchangeCodeForTokens(code);
    
    // Use the ID token to authenticate
    const result = await googleAuthService.handleGoogleAuth(tokens.id_token);
    
    return result;
  } catch (error) {
    throw error;
  }
};

exports.getUserById = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Remove password from response
  delete user.password;
  
  return user;
};

exports.updateUser = async (userId, userData) => {
  // Check if user exists
  const existingUser = await userModel.findById(userId);
  if (!existingUser) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // If email is being updated, check if it's already in use
  if (userData.email && userData.email !== existingUser.email) {
    const emailExists = await userModel.findByEmail(userData.email);
    if (emailExists) {
      const error = new Error('Email already in use');
      error.statusCode = 409;
      throw error;
    }
  }

  // Update user
  const updatedUser = await userModel.update(userId, userData);
  
  // Remove password from response
  delete updatedUser.password;
  
  return updatedUser;
};

exports.generatePasswordResetToken = async (email) => {
  // Find user
  const user = await userModel.findByEmail(email);
  if (!user) {
    const error = new Error('User with this email does not exist');
    error.statusCode = 404;
    throw error;
  }

  // Don't allow password reset for Google-only users
  if (user.google_id && !user.password) {
    const error = new Error('Password reset not available for Google accounts');
    error.statusCode = 400;
    throw error;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

  // Hash token before storing it
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Save token to database
  await userModel.saveResetToken(user.id, hashedToken, resetTokenExpiry);

  // Send password reset email
  try {
    await emailService.sendPasswordResetEmail(email, resetToken, user.name);
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError);
    throw new Error('Failed to send password reset email');
  }

  return {
    message: 'Password reset link sent to your email'
  };
};

exports.resetPassword = async (token, newPassword) => {
  // Hash the token to compare with stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with this token and check if token is still valid
  const user = await userModel.findByResetToken(hashedToken);
  
  if (!user || user.reset_token_expiry < Date.now()) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 400;
    throw error;
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password and clear reset token
  await userModel.updatePassword(user.id, hashedPassword);
  
  return true;
};

// Email verification methods
exports.verifyEmail = async (token) => {
  // Find user with this verification token
  const user = await userModel.findByVerificationToken(token);
  
  if (!user) {
    const error = new Error('Invalid verification token');
    error.statusCode = 400;
    throw error;
  }

  // Check if token is expired
  if (user.email_verification_expiry < Date.now()) {
    const error = new Error('Verification token has expired');
    error.statusCode = 400;
    throw error;
  }

  // Verify email
  const verifiedUser = await userModel.verifyEmail(user.id);
  
  return verifiedUser;
};

exports.resendVerificationEmail = async (email) => {
  // Find user
  const user = await userModel.findByEmail(email);
  if (!user) {
    const error = new Error('User with this email does not exist');
    error.statusCode = 404;
    throw error;
  }

  // Check if email is already verified
  if (user.is_email_verified) {
    const error = new Error('Email is already verified');
    error.statusCode = 400;
    throw error;
  }

  // Don't allow resend for Google users (they're already verified)
  if (user.google_id) {
    const error = new Error('Google accounts are automatically verified');
    error.statusCode = 400;
    throw error;
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpiry = Date.now() + 86400000; // 24 hours from now

  // Update verification token
  await userModel.updateVerificationToken(user.id, verificationToken, verificationExpiry);

  // Send verification email
  try {
    await emailService.sendVerificationEmail(email, verificationToken, user.name);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    throw new Error('Failed to send verification email');
  }

  return {
    message: 'Verification email sent successfully'
  };
};
