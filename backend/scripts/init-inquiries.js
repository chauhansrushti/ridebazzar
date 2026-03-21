#!/usr/bin/env node

/**
 * Initialize Inquiries Table
 * Run this script to create the inquiries table if it doesn't exist
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function initInquiriesTable() {
  let connection;
  try {
    console.log('🔄 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ridebazzar'
    });

    console.log('✅ Connected to database');

    // Check if inquiries table exists
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = 'inquiries' AND TABLE_SCHEMA = ?",
      [process.env.DB_NAME || 'ridebazzar']
    );

    if (tables.length > 0) {
      console.log('✅ Inquiries table already exists');
    } else {
      console.log('📝 Creating inquiries table...');
      
      await connection.execute(`
        CREATE TABLE inquiries (
          id INT PRIMARY KEY AUTO_INCREMENT,
          car_id INT NOT NULL,
          buyer_id INT NOT NULL,
          seller_id INT NOT NULL,
          message TEXT NOT NULL,
          phone VARCHAR(20) NOT NULL,
          response TEXT,
          status ENUM('pending', 'responded', 'closed') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (car_id) REFERENCES cars (id) ON DELETE CASCADE,
          FOREIGN KEY (buyer_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE,
          INDEX idx_car (car_id),
          INDEX idx_buyer (buyer_id),
          INDEX idx_seller (seller_id),
          INDEX idx_status (status)
        )
      `);
      
      console.log('✅ Inquiries table created successfully');
    }

    // Check if cars table has inquiries column
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME = 'cars' AND TABLE_SCHEMA = ? AND COLUMN_NAME = 'inquiries'",
      [process.env.DB_NAME || 'ridebazzar']
    );

    if (columns.length === 0) {
      console.log('📝 Adding inquiries column to cars table...');
      await connection.execute('ALTER TABLE cars ADD COLUMN inquiries INT DEFAULT 0');
      console.log('✅ Inquiries column added to cars table');
    } else {
      console.log('✅ Cars table already has inquiries column');
    }

    console.log('\n🎉 All setup complete! You can now use the inquiry system.');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initInquiriesTable();
