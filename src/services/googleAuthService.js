const { OAuth2Client } = require('google-auth-library');
const config = require('../config/env');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);
// googleAuthService.js
const axios = require('axios');

exports.verifyGoogleAccessToken = async (accessToken) => {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = response.data;
    // console.log(data)
    return {
      googleId: data.sub,
      name: data.name,
      email: data.email,
      emailVerified: data.email_verified,
      picture_url: data.picture,
    };
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};


// Handle Google sign-in/sign-up
exports.handleGoogleAuth = async (accessToken) => {
  try {
    let is_new_user=false;    
    // Verify the Google token
    const googleUser = await this.verifyGoogleAccessToken(accessToken);
    console.log("googleUser",googleUser)
    // Check if user already exists with this Google ID
    let user = await userModel.findByGoogleId(googleUser.googleId);
    console.log(user)
    if (user) {
      // User exists, log them in
      console.log(`Google user logged in: ${googleUser.email}`);
    } else {
      // Check if user exists with this email but different auth method
      const existingUserByEmail = await userModel.findByEmail(googleUser.email);
      
      if (existingUserByEmail) {
        // User exists with email but no Google ID, link the accounts
        await userModel.linkGoogleAccount(existingUserByEmail.id, googleUser.googleId);
        user = { ...existingUserByEmail, google_id: googleUser.googleId };
        logger.info(`Linked existing email account to Google: ${googleUser.email}`);
      } else {
        // Create new user with Google auth
        const userData = {
          name: googleUser.name,
          email: googleUser.email,
          google_id: googleUser.googleId,
          email_alerts: true, // Default to true for Google users
          is_email_verified: googleUser.emailVerified, // Google emails are pre-verified
          picture_url: googleUser.picture_url
        };
        
        user = await userModel.createGoogleUser(userData);
        is_new_user=true;
        console.log(`New Google user created: ${googleUser.email}`);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        google_id: user.google_id,
        email_alerts: user.email_alerts,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
        is_new_user:is_new_user
      },
      token
    };
  } catch (error) {
    logger.error('Google authentication failed:', error);
    throw error;
  }
};


// Exchange authorization code for tokens
exports.exchangeCodeForTokens = async (code) => {
  try {
    const redirectUri = `${config.FRONTEND_URL}/auth/google/callback`;
    
    const { tokens } = await client.getToken({
      code,
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri
    });

    return tokens;
  } catch (error) {
    logger.error('Failed to exchange code for tokens:', error);
    throw new Error('Failed to authenticate with Google');
  }
}; 