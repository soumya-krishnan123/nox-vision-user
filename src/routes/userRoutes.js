const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { 
    validateUser,
    validatePasswordReset,
    validateResendVerification,
    validateGoogleAuth,
    validateChangePassword,
    validatePassword,
    validateVerifyOtp,
    validateContact,
    validateApiKeyBody
} = require('../middleware/validator');
const {upload}=require('../config/s3upload')

const router = express.Router();

router.post('/register', validateUser, userController.register);
router.post('/login', userController.login);
router.post('/validate-email', userController.validateEmail);
router.post('/verify-otp', validateVerifyOtp, userController.verifyOtp);

router.get('/profile', auth, userController.getProfile);
// router.put('/profile', auth, upload.single('profile_pic'),userController.updateProfile);
router.put('/profile', auth,userController.updateProfile);

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', validatePasswordReset, userController.resetPassword);
router.post('/change-password', auth, validateChangePassword, userController.changePassword);
router.post('/create-password', auth, validatePassword, userController.createPassword);
router.delete('/google-id', auth, userController.deleteGoogleId);

// Email verification routes
router.get('/verify-email', userController.verifyEmail);
router.post('/resend-verification', validateResendVerification, userController.resendVerificationEmail);
router.put('/onboard-complete', auth, userController.onboardComplete);
// Google authentication routes
router.post('/google/auth', validateGoogleAuth, userController.googleAuth);


router.post('/create-api-key', auth, userController.createApiKey);
router.get('/get-api-key', auth, userController.getApiKey);
router.post('/validate-api-key',auth, validateApiKeyBody, userController.validateApiKey);

// router.get('/google/auth-url', userController.getGoogleAuthUrl);
// router.get('/google/callback', userController.googleCallback);


router.post('/contact-us', validateContact, userController.contactUs);

module.exports = router;
