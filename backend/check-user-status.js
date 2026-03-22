const mysql = require('mysql2/promise');

async function checkUserStatus() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'SS@2006',
      database: 'ridebazzar'
    });

    const [users] = await pool.execute('SELECT id, username, email, role, is_active, is_verified FROM users');
    console.log('\n=== USER ACCOUNT STATUS ===');
    users.forEach(u => {
      console.log(`${u.username.padEnd(12)} | Role: ${(u.role || 'user').padEnd(5)} | Active: ${u.is_active ? '✅' : '❌'} | Verified: ${u.is_verified ? '✅' : '❌'}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUserStatus();
