const userService = require('../services/userServices');
const apiKeyService = require('../services/apiKeyService');
const contactService = require('../services/contactService');

const multer = require('multer');

const storage = multer.memoryStorage(); // store in memory before uploading to S3
const s3=require('../config/s3upload')
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});
exports.register = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(200).json({
      status: true,
      status_code: 200,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await userService.loginUser(email, password);
      res.status(200).json({
        status: true,
        status_code: 200,
        message: 'Login successful',
        data:data
      });
  } catch (error) {
    next(error);
  }
};
exports.validateEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await userService.validateEmail(email);
    res.status(200).json({
      status: true,
      status_code: 200,
      message: 'Email validated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};  


exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await userService.verifyOtp(email, otp);
    res.status(200).json({
      status: true,
      status_code: 200,
      message: 'OTP verified successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
exports.getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.status(200).json({
      status: true,
      status_code: 200,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userData = req.body;
    // Upload profile picture if available
    if (req.file) {
      const s3Url = await s3.uploadToS3(req.file.buffer, req.file.originalname, userId);
      userData.profile_pic = s3Url; // Add to userData
    }
    const updatedUser = await userService.updateUser(userId, userData);
    res.status(200).json({
      status: true,
      status_code: 200,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
  
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await userService.generatePasswordResetToken(email);
    res.status(200).json({
      status: true, 
      status_code: 200,
      message: 'Password reset link sent to your email',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await userService.resetPassword(token, password);
    res.status(200).json({
      status: true,
      status_code: 200,
      data:{},
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Change password for authenticated users
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;
    await userService.changePassword(userId, current_password, new_password);
    res.status(200).json({
      status: true,
      status_code: 200,
      data:{},
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create password for authenticated users
exports.createPassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    await userService.createPassword(userId,password);
    res.status(200).json({
      status: true,
      status_code: 200,
      data:{},
      message: 'Password created successfully'
    });
  } catch (error) {
    next(error);
  }
};
// Delete Google ID from user account
exports.deleteGoogleId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await userService.deleteGoogleId(userId);
    res.status(200).json({
      status: true,
      status_code: 200,
      data:{},
      message: 'Google account unlinked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Email verification endpoints
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const verifiedUser = await userService.verifyEmail(token);
    res.status(200).json({
      status: true,
      status_code: 200,
      message: 'Email verified successfully',
      data: verifiedUser
    });
  } catch (error) {
    next(error);
  }
};

exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await userService.resendVerificationEmail(email);
    res.status(200).json({
      status: true,
      status_code: 200,
      message: 'Verification email sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Google authentication endpoints
exports.googleAuth = async (req, res, next) => {
  try {
    const { accessToken } = req.body;
    const data = await userService.googleAuth(accessToken);
    if(data.user.is_new_user){
      message="user created Successfully"
    }else{
      message="user logged in Successfully"
    }
    res.status(200).json({
      status: true,
      status_code: 200,
      message: message,
      data,
    });
  } catch (error) {
    next(error);
  }
};


// Create API key for authenticated user
exports.createApiKey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const apiKey = await apiKeyService.createApiKey(userId);
    res.status(201).json({
      status: true,
      status_code: 201,
      message: 'API key created successfully',
      data: apiKey
    });
  } catch (error) {
    next(error);
  }
};

// Get API key for authenticated user
exports.getApiKey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const apiKey = await apiKeyService.getApiKeyByUserId(userId);
    
    if (!apiKey) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: 'No active API key found'
      });
    }
    
    res.status(200).json({
      status: true,
      status_code: 200,
      data: apiKey
    });
  } catch (error) {
    next(error);
  }
};

// Regenerate API key for authenticated user
exports.regenerateApiKey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const apiKey = await apiKeyService.regenerateApiKey(userId);
    res.status(200).json({
      status: true,
      status_code: 200,
      message: 'API key regenerated successfully',
      data: apiKey
    });
  } catch (error) {
    next(error);
  }
};

// Get all API keys for authenticated user
exports.getAllApiKeys = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const apiKeys = await apiKeyService.getAllApiKeysByUserId(userId);
    
    res.status(200).json({
      status: true,
      status_code: 200,
      message: 'API key fetched successfully',
      data: apiKeys
    });
  } catch (error) {
    next(error);
  }
};

// Deactivate API key
exports.deactivateApiKey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { apiKeyId } = req.params;
    const result = await apiKeyService.deactivateApiKey(apiKeyId, userId);
    
    res.status(200).json({
      status: true,
      status_code: 200,
      message: 'API key deactivated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}; 

exports.validateApiKey = async (req, res, next) => {
  try {
    const { api_key } = req.body;
    const userId = req.user.id;
    console.log("userId",userId);
    const result = await apiKeyService.validateApiKey(api_key,userId);
    res.status(200).json({
      status: true,
      status_code: 200,
      message: 'API key validated successfully',
      data:result
    });
  } catch (error) {
    next(error);
  }
};

// Contact Us endpoint
exports.contactUs = async (req, res, next) => {
  try {
    const contact = await contactService.createContactRequest(req.body);
    
    res.status(201).json({
      status: true,
      status_code: 201,
      message: 'Contact request submitted successfully. We will get back to you soon.',
      data: contact
    });
  } catch (error) {
    next(error);
  }
}; 

exports.onboardComplete = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userService.onboardComplete(userId);
    res.status(200).json({
      status: true,
      status_code: 200,
      message: 'Onboarding completed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};  