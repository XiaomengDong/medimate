const { Pool } = require('pg');
require('dotenv').config();

// const pool = new Pool({
  // host: process.env.DB_HOST,
  // port: process.env.DB_PORT,
  // database: process.env.DB_NAME,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD
// });

// Configuration for Render PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('✅ Successfully Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

module.exports = pool;