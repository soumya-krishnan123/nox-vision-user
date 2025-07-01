const db = require('../config/db');
const logger = require('../utils/logger');
const apiKeyModel = require('../models/apiKeyModel');

exports.createApiKey = async (userId) => {
    try {
      const existingKey = await apiKeyModel.getApiKeyByUserId(userId);
      if (existingKey) {
       await apiKeyModel.deactivateApiKey(existingKey.id);
      }
  
      const newKey = await apiKeyModel.insertApiKey(userId);
  
      logger.info(`API key created for user ${userId}`);
      return newKey;
    } catch (error) {
      logger.error(`Error creating API key for user ${userId}:`, error);
      throw error;
    }
  };

exports.
getApiKeyByUserId = async (userId) => {
  try {
   
  const apiKey=await apiKeyModel.getApiKeyByUserId(userId);
    return apiKey;
  } catch (error) {
    logger.error(`Error fetching API key for user ${userId}:`, error);
    throw error;
  }
};



exports.validateApiKey = async (api_key,userId) => {
  try {
    const apiKeyData = await apiKeyModel.validateApiKey(api_key,userId);
    if(!apiKeyData){
      const error = new Error('Invalid API key');
      error.statusCode = 401;
      throw error;
    }
    if(apiKeyData.status === false){
      const error = new Error('API key is Expired');
      error.statusCode = 401;
      throw error;
    }
    return apiKeyData;
  } catch (error) {
    logger.error('Error validating API key:', error);
    throw error;
  }
};
  

