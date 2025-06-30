const apiKeyService = require('../services/apiKeyService');

module.exports = async (req, res, next) => {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({
        status: false,
        message: 'API key is required'
      });
    }

    // Validate API key
    const apiKeyData = await apiKeyService.validateApiKey(apiKey);
    
    if (!apiKeyData) {
      return res.status(401).json({
        status: false,
        message: 'Invalid or inactive API key'
      });
    }

    // Add user info to request
    req.apiKeyUser = {
      id: apiKeyData.user_id,
      name: apiKeyData.name,
      email: apiKeyData.email
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: 'API key validation failed'
    });
  }
}; 