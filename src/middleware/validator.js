const Joi = require('joi');

exports.validateUser = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    email_alerts: Joi.boolean(),
    google_id: Joi.string()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    // Create an error object with field names as keys and error messages as values
    const errorObj = {};
    error.details.forEach(detail => {
      const key = detail.path[0];
      // Capitalize first letter of the error message
      let message = detail.message.replace(/["]/g, '');
      message = message.charAt(0).toUpperCase() + message.slice(1);
      errorObj[key] = message;
    });
    
    return res.status(400).json({
      status: false,
      errors: errorObj
    });
  }

  next();
};

exports.validatePasswordReset = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    // Create an error object with field names as keys and error messages as values
    const errorObj = {};
    error.details.forEach(detail => {
      const key = detail.path[0];
      // Capitalize first letter of the error message
      let message = detail.message.replace(/["]/g, '');
      message = message.charAt(0).toUpperCase() + message.slice(1);
      errorObj[key] = message;
    });
    
    return res.status(400).json({
      status: false,
      errors: errorObj
    });
  }

  next();
};

exports.validateResendVerification = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    // Create an error object with field names as keys and error messages as values
    const errorObj = {};
    error.details.forEach(detail => {
      const key = detail.path[0];
      // Capitalize first letter of the error message
      let message = detail.message.replace(/["]/g, '');
      message = message.charAt(0).toUpperCase() + message.slice(1);
      errorObj[key] = message;
    });
    
    return res.status(400).json({
      status: false,
      errors: errorObj
    });
  }

  next();
};

exports.validateGoogleAuth = (req, res, next) => {
  const schema = Joi.object({
    idToken: Joi.string().required()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    // Create an error object with field names as keys and error messages as values
    const errorObj = {};
    error.details.forEach(detail => {
      const key = detail.path[0];
      // Capitalize first letter of the error message
      let message = detail.message.replace(/["]/g, '');
      message = message.charAt(0).toUpperCase() + message.slice(1);
      errorObj[key] = message;
    });
    
    return res.status(400).json({
      status: false,
      errors: errorObj
    });
  }

  next();
};
