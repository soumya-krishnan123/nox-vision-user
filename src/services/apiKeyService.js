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

exports.getApiKeyByUserId = async (userId) => {
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

exports.deactivateApiKey = async (apiKeyId, userId) => {
  try {
    const query = `
      UPDATE api_keys
      SET status = 'inactive', updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING id, api_key, status, updated_at
    `;
    const values = [apiKeyId, userId];
  
    const { rows } = await db.query(query, values);
    if (rows.length === 0) {
      const error = new Error('API key not found or access denied');
      error.statusCode = 404;
      throw error;
    }
    
    logger.info(`API key ${apiKeyId} deactivated for user ${userId}`);
    return rows[0];
  } catch (error) {
    logger.error(`Error deactivating API key ${apiKeyId} for user ${userId}:`, error);
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
  