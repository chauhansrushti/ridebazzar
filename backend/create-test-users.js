// Script to add test users to production database
// Usage: node create-test-users.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testUsers = [
  { username: 'srushti', email: 'srushtichauhan2006@gmail.com', password: 'srushti123', fullName: 'Srushti Chauhan', role: 'user' },
  { username: 'priti', email: 'priti@gmail.com', password: 'priti17', fullName: 'Priti', role: 'user' },
  { username: 'neel', email: 'neel@gmail.com', password: 'neel123', fullName: 'Neel', role: 'user' },
  { username: 'tanisha', email: 'tan@gmail.com', password: 'tan123', fullName: 'Tanisha', role: 'user' }
];

async function createTestUsers() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ridebazzar',
      waitForConnections: true,
      connectionLimit: 5
    });

    const promisePool = pool.promise();

    console.log('\n=== CREATING TEST USERS ===');

    for (const user of testUsers) {
      try {
        // Check if user exists
        const [existing] = await promisePool.execute(
          'SELECT id FROM users WHERE username = ?',
          [user.username]
        );

        if (existing.length > 0) {
          console.log(`⏭️  ${user.username}: Already exists, skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Insert user
        const [result] = await promisePool.execute(
          'INSERT INTO users (username, email, password, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
          [user.username, user.email, hashedPassword, user.fullName, user.role]
        );

        console.log(`✅ ${user.username}: Created successfully`);
      } catch (error) {
        console.log(`❌ ${user.username}: ${error.message}`);
      }
    }

    // Verify users
    const [allUsers] = await promisePool.execute(
      'SELECT id, username, email, role FROM users'
    );

    console.log('\n=== ALL USERS IN DATABASE ===');
    allUsers.forEach(u => {
      console.log(`ID: ${u.id} | ${u.username.padEnd(12)} | ${u.email.padEnd(30)} | Role: ${u.role}`);
    });

    await pool.end();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUsers();
