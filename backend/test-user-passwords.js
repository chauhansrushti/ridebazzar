const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function testUserPasswords() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'SS@2006',
      database: 'ridebazzar'
    });

    const [users] = await pool.execute('SELECT id, username, password FROM users');
    
    console.log('\n=== TESTING USER PASSWORDS ===');
    
    for (const user of users) {
      console.log(`\nUser: ${user.username}`);
      console.log(`  Password hash: ${user.password}`);
      console.log(`  Hash length: ${user.password.length}`);
      console.log(`  Is bcrypt hash: ${user.password.startsWith('$2a$') || user.password.startsWith('$2b$') ? 'YES' : 'NO'}`);
      
      // Try to verify with common test passwords
      const commonPasswords = ['password', 'test123', user.username, 'Admin123', 'admin123'];
      for (const pass of commonPasswords) {
        try {
          const match = await bcrypt.compare(pass, user.password);
          if (match) {
            console.log(`  ✅ Matches password: "${pass}"`);
          }
        } catch (e) {
          // Not a valid bcrypt hash
        }
      }
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUserPasswords();
