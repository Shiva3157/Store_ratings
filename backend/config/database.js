const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const connect = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL database connected successfully');
    connection.release();
    return pool;
  } catch (error) {
    console.error('MySQL connection failed:', error);
    throw error;
  }
};

module.exports = {
  pool,
  connect
};
