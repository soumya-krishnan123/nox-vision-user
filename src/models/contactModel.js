const db = require('../config/db');

  exports.create = async (contactData) => {
    const { name, email, company, services } = contactData;
    
    const query = `
      INSERT INTO contact_requests (name, email, company, services)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [name, email, company, services || []];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  exports.findAll = async () => {
    const query = 'SELECT * FROM contact_requests ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }

  exports.findById = async (id) => {
    const query = 'SELECT * FROM contact_requests WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  exports.updateStatus = async (id, status) => {
    const query = `
      UPDATE contact_requests 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }

  exports.delete = async (id) => {
    const query = 'DELETE FROM contact_requests WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  exports.findByEmail = async (email) => {
    const query = 'SELECT * FROM contact_requests WHERE email = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [email]);
    return result.rows;
  }


 