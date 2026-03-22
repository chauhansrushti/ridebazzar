// Script to initialize localStorage fallback with users from database
const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function initializeLocalStorageFallback() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'SS@2006',
      database: 'ridebazzar'
    });

    const [users] = await pool.execute('SELECT id, username, email, role, password FROM users WHERE is_active = 1');
    
    console.log('\n=== INITIALIZING LOCALSTORAGE FALLBACK ===');
    console.log('This data should be available in browser localStorage for offline mode');
    console.log('\nAdd this to your browser localStorage (F12 > Console):\n');

    // Create a safe format for localStorage (without storing actual passwords for security)
    const fallbackUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      // Store a hash of the password for verification, not the plain password
      passwordHash: u.password
    }));

    console.log(`localStorage.setItem('ridebazzar_users', '${JSON.stringify(fallbackUsers)}');`);
    console.log('\nTotal users:', users.length);

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

initializeLocalStorageFallback();
