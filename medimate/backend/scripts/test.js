const pool = require('../config/database');

const test = async () => {
  try {
    console.log('Testing database connection...');
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Connected to database successfully');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database query successful:', result.rows[0]);
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Users table exists');
      
      // Count users
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`📊 Total users: ${userCount.rows[0].count}`);
    } else {
      console.log('❌ Users table does not exist. Run setup-db script.');
    }
    
    client.release();
    console.log('✅ Connection test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

test();