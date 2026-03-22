const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function verifyPasswords() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'SS@2006',
      database: 'ridebazzar'
    });

    const testCredentials = {
      'srushti': 'srushti123',
      'priti': 'priti17',
      'neel': 'neel123',
      'tanisha': 'tan123'
    };

    console.log('\n=== VERIFYING USER PASSWORDS ===');
    
    for (const [username, password] of Object.entries(testCredentials)) {
      const [users] = await pool.execute('SELECT id, username, password FROM users WHERE username = ?', [username]);
      
      if (users.length === 0) {
        console.log(`❌ ${username}: User not found`);
        continue;
      }

      const user = users[0];
      try {
        const match = await bcrypt.compare(password, user.password);
        console.log(`${match ? '✅' : '❌'} ${username}:${password} - ${match ? 'MATCH' : 'NO MATCH'}`);
      } catch (e) {
        console.log(`❌ ${username}: Error verifying - ${e.message}`);
      }
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyPasswords();
