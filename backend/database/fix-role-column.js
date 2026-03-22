// Auto-fix: Add role column to users table if missing
const mysql = require('mysql2/promise');

async function addRoleColumn() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ridebazzar'
    });

    // Check if role column exists
    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`
    );

    if (columns.length === 0) {
      console.log('⚠️ Role column missing - Adding it now...');
      
      // Add role column
      await pool.execute(
        `ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' AFTER bio`
      );
      console.log('✅ Role column added to users table');

      // Update existing admin user
      await pool.execute(
        `UPDATE users SET role = 'admin' WHERE username = 'admin'`
      );
      console.log('✅ Admin user role updated');
    } else {
      console.log('✅ Role column already exists');
    }

    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('❌ Error adding role column:', error.message);
    // Don't throw - just log the warning
  }
}

// Run on module load
addRoleColumn().catch(console.error);

module.exports = { addRoleColumn };
