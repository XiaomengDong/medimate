const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(username, email, password) {
    try {
      // Hash the password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, created_at
      `;
      
      const result = await pool.query(query, [username, email, passwordHash]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Find user by username
  static async findByUsername(username) {
    try {
      console.log('Searching for:', username);
      const query = 'SELECT * FROM users WHERE username = $1';
      
      const result = await pool.query(query, [username]);
      console.log(result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }
  
  // Find user by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Find user by ID
  static async findById(id) {
    try {
      const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;