const mysql = require('mysql2');
require('dotenv').config();

// First, create a connection without database to create the database if needed
const createDatabaseIfNotExists = async () => {
  const rootPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  });

  const rootPromisePool = rootPool.promise();

  try {
    const dbName = process.env.DB_NAME || 'ridebazzar';
    console.log(`🔧 Ensuring database '${dbName}' exists...`);
    
    await rootPromisePool.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' ready`);
    
    await rootPool.end();
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    await rootPool.end();
    throw error;
  }
};

// Create connection pool with the specified database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ridebazzar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based connection
const promisePool = pool.promise();

// Test connection
const testConnection = async () => {
  try {
    // First ensure database exists
    await createDatabaseIfNotExists();
    
    // Then test the main connection
    const connection = await promisePool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Waiting 5 seconds before retrying...');
    setTimeout(() => {
      testConnection();
    }, 5000);
  }
};

testConnection();

module.exports = promisePool;
