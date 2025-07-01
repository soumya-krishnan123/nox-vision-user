const db = require('../config/db');

exports.create = async (userData) => {
  const { name, email, password,email_alerts,google_id,email_verification_token,email_verification_expiry } = userData;
  
  const query = `
    INSERT INTO users (name, email,password,email_alerts,google_id,email_verification_token,email_verification_expiry)
    VALUES ($1, $2, $3,$4,$5,$6,$7)
    RETURNING id, name, email, created_at
  `;
  
  const { rows } = await db.query(query, [name, email, password,email_alerts,google_id,email_verification_token,email_verification_expiry]);
  return rows[0];
};

// Create user with Google authentication (no password required)
exports.createGoogleUser = async (userData) => {
  const { name, email, google_id, email_alerts, is_email_verified,picture_url } = userData;
  
  const query = `
    INSERT INTO users (name, email,google_id, email_alerts, is_email_verified,picture_url)
    VALUES ($1, $2, $3, $4, $5,$6)
    RETURNING id, name, email, google_id, email_alerts, is_email_verified, created_at,picture_url
  `;
  
  const { rows } = await db.query(query, [name, email, google_id, email_alerts, is_email_verified,picture_url]);
  return rows[0];
};

// Link existing email account to Google
exports.linkGoogleAccount = async (userId, googleId) => {
  const query = `
    UPDATE users
    SET google_id = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, name, email, google_id, email_alerts, is_email_verified, created_at
  `;
  
  const { rows } = await db.query(query, [googleId, userId]);
  return rows[0];
};

exports.findByEmail = async (email) => {
  const query = `
    SELECT id, name, email, google_id,is_email_verified,password
    FROM users
    WHERE email = $1
  `;
  
  const { rows } = await db.query(query, [email]);
  return rows[0];
};

exports.findByGoogleId = async (google_id) => {
    const query = `
      SELECT id, name, email, created_at, google_id, email_alerts, is_email_verified,is_onboarded
      FROM users
      WHERE google_id = $1
    `;
    
    const { rows } = await db.query(query, [google_id]);
    return rows[0];
  };

exports.findById = async (id) => {
  const query = `
    SELECT id, name, email, created_at, google_id, email_alerts, is_email_verified,password,picture_url,is_onboarded
    FROM users
    WHERE id = $1
  `;
  
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

exports.update = async (id, userData) => {
  const allowedFields = ['name','email_alerts','is_email_verified','picture_url'];
  const updates = [];
  const values = [];
  
  // Build dynamic query based on provided fields
  let i = 1;
  for (const [key, value] of Object.entries(userData)) {
    if (allowedFields.includes(key) && value !== undefined) {
      updates.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }
  
  if (updates.length === 0) {
    return this.findById(id);
  }
  
  values.push(id);
  
  const query = `
    UPDATE users
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${i}
    RETURNING id, name, email, created_at, updated_at, google_id, email_alerts, is_email_verified
  `;
  
  const { rows } = await db.query(query, values);
  return rows[0];
};

exports.saveResetToken = async (userId, token, expiry) => {
  const query = `
    UPDATE users
    SET reset_token = $1, reset_token_expiry = $2
    WHERE id = $3
    RETURNING id
  `;
  
  const { rows } = await db.query(query, [token, expiry, userId]);
  return rows[0];
};

exports.findByResetToken = async (token) => {
  const query = `
    SELECT id, reset_token_expiry
    FROM users
    WHERE reset_token = $1
  `;
  
  const { rows } = await db.query(query, [token]);
  return rows[0];
};

exports.updatePassword = async (userId, newPassword) => {
  const query = `
    UPDATE users
    SET password = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
    WHERE id = $2
    RETURNING id
  `;
  
  const { rows } = await db.query(query, [newPassword, userId]);
  return rows[0];
};

exports.findByVerificationToken = async (token) => {
    const query = `
      SELECT * FROM users
      WHERE email_verification_token = $1
      LIMIT 1
    `;
    const values = [token];
  
    const result = await db.query(query, values);
    return result.rows[0];
  };

exports.verifyEmail = async (userId) => {
  const query = `
    UPDATE users
    SET is_email_verified = TRUE,
        email_verification_token = NULL,
        email_verification_expiry = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *;
  `;

  const values = [userId];

  const result = await db.query(query, values);
  return result.rows[0];
};

// Update verification token for resending
exports.updateVerificationToken = async (userId, token, expiry) => {
  const query = `
    UPDATE users
    SET email_verification_token = $1, email_verification_expiry = to_timestamp($2 / 1000.0)
    WHERE id = $3
    RETURNING id
  `;
  
  const { rows } = await db.query(query, [token, expiry, userId]);
  return rows[0];
};

// Delete Google ID from user account
exports.deleteGoogleId = async (userId) => {
  const query = `
    UPDATE users
    SET google_id = NULL, updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, email, google_id, email_alerts, is_email_verified, created_at
  `;
  
  const { rows } = await db.query(query, [userId]);
  return rows[0];
};


exports.storeOtp = async (userId, otp) => {
  const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
   let type="login_otp"

  
  // Check for existing unused and unexpired OTP of same type
  const existingQuery = `
    SELECT id FROM otps
    WHERE user_id = $1 AND type = $2 AND used = false AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const { rows } = await db.query(existingQuery, [userId, type]);

  if (rows.length > 0) {
    // Update the existing OTP
    const updateQuery = `
      UPDATE otps
      SET otp_code = $1, expires_at = $2, updated_at = NOW()
      WHERE id = $3
    `;
    await db.query(updateQuery, [otp, expires_at, rows[0].id]);
  } else {
    // Insert a new OTP
    const insertQuery = `
      INSERT INTO otps (user_id, otp_code, expires_at, used, type)
      VALUES ($1, $2, $3, false, $4)
    `;
    await db.query(insertQuery, [userId, otp, expires_at, type]);
  }

 };
 exports.findLatestOtp = async (userId, otpCode) => {
  const query = `
    SELECT * FROM otps
    WHERE user_id = $1 AND otp_code = $2 AND used = false
    LIMIT 1
  `;
  const { rows } = await db.query(query, [userId, otpCode]);
  return rows[0];
};

exports.markOtpAsUsed = async (otpId) => {
  const query = `
    UPDATE otps SET used = true, updated_at = NOW() WHERE id = $1
  `;
  await db.query(query, [otpId]);
};

exports.updateOnboardComplete = async (userId) => {
  const query = `
    UPDATE users SET is_onboarded= true, updated_at = NOW() WHERE id = $1
  `;
  await db.query(query, [userId]);
};
