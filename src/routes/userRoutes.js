const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { validateUser, validatePasswordReset, validateResendVerification, validateGoogleAuth } = require('../middleware/validator');

const router = express.Router();

router.post('/register', validateUser, userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', validatePasswordReset, userController.resetPassword);

// Email verification routes
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/resend-verification', validateResendVerification, userController.resendVerificationEmail);

// Google authentication routes
router.post('/google/auth', validateGoogleAuth, userController.googleAuth);
router.get('/google/auth-url', userController.getGoogleAuthUrl);
router.get('/google/callback', userController.googleCallback);

module.exports = router;
