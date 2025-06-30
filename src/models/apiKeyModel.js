
const db = require('../config/db');
exports.insertApiKey = async (userId, apiKey) => {
    const query = `
      INSERT INTO api_keys (user_id )
      VALUES ($1)
      RETURNING id, api_key, status, created_at
    `;
    const values = [userId];
    const { rows } = await db.query(query, values);
    return rows[0];
  };
  
  // Get API key by user ID
  exports.getApiKeyByUserId = async (userId) => {
    const query = `
      SELECT id, api_key, status, created_at
      FROM api_keys
      WHERE user_id = $1
      LIMIT 1
    `;
    const { rows } = await db.query(query, [userId]);
    return rows[0];
  };

  exports.deactivateApiKey = async (apiKeyId) => {
    const query = `
      UPDATE api_keys
      SET status = false
      WHERE id = $1
    `;
    await db.query(query, [apiKeyId]);
  };
  