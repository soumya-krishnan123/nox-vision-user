const userService = require('../services/userServices');

exports.register = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      status: true,
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
      data
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
    const updatedUser = await userService.updateUser(userId, userData);
    res.status(200).json({
      status: true,
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
      message: 'Password reset link sent to your email',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await userService.resetPassword(token, newPassword);
    res.status(200).json({
      status: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Email verification endpoints
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const verifiedUser = await userService.verifyEmail(token);
    res.status(200).json({
      status: true,
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
    const { idToken } = req.body;
    const data = await userService.googleAuth(idToken);
    res.status(200).json({
      status: true,
      message: 'Google authentication successful',
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.getGoogleAuthUrl = async (req, res, next) => {
  try {
    const authUrl = userService.getGoogleAuthUrl();
    res.status(200).json({
      status: true,
      data: { authUrl }
    });
  } catch (error) {
    next(error);
  }
};

exports.googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    const data = await userService.handleGoogleCallback(code);
    res.status(200).json({
      status: true,
      message: 'Google authentication successful',
      data
    });
  } catch (error) {
    next(error);
  }
};
