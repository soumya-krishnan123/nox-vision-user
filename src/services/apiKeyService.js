const db = require('../config/db');
const logger = require('../utils/logger');
const apiKeyModel = require('../models/apiKeyModel');

exports.createApiKey = async (userId) => {
    try {
      const existingKey = await apiKeyModel.getApiKeyByUserId(userId);
      if (existingKey) {
        const error = new Error('User already has an API key');
        error.statusCode = 400;
        throw error;
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
    const query = `
      SELECT id, api_key
      FROM api_keys
      WHERE user_id = $1 AND status =true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const values = [userId];
  
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  } catch (error) {
    logger.error(`Error fetching API key for user ${userId}:`, error);
    throw error;
  }
};

exports.getAllApiKeysByUserId = async (userId) => {
  try {
    const query = `
      SELECT id, api_key, status, created_at, updated_at
      FROM api_keys
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const values = [userId];
  
    const { rows } = await db.query(query, values);
    return rows;
  } catch (error) {
    logger.error(`Error fetching all API keys for user ${userId}:`, error);
    throw error;
  }
};


exports.validateApiKey = async (apiKey) => {
  try {
    const query = `
      SELECT ak.id, ak.user_id, ak.status, u.name, u.email
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.api_key = $1 AND ak.status = 'active'
    `;
    const values = [apiKey];
  
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  } catch (error) {
    logger.error('Error validating API key:', error);
    throw error;
  }
};
  

// Regenerate API key for authenticated user
exports.regenerateApiKey = async (userId) => {

  try {
    const existingKey = await apiKeyModel.getApiKeyByUserId(userId);
    if (!existingKey) {
      const error = new Error('User does not have an API key');
      error.statusCode = 404;
      throw error;
    }
    await apiKeyModel.deactivateApiKey(existingKey.id);
    const newKey = await apiKeyModel.insertApiKey(userId);
    logger.info(`API key regenerated for user ${userId}`);
    return newKey;
  } catch (error) {
    logger.error(`Error regenerating API key for user ${userId}:`, error);
    throw error;
  }
};
