const mysql = require('mysql2/promise');

async function checkUsers() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'SS@2006',
    database: 'ridebazzar'
  });

  try {
    const [users] = await pool.execute('SELECT id, username, email, role FROM users');
    console.log('\n=== USERS IN DATABASE ===');
    users.forEach(u => {
      console.log(`ID: ${u.id} | Username: ${u.username} | Email: ${u.email} | Role: ${u.role || 'user'}`);
    });
    
    const [tableInfo] = await pool.execute('DESCRIBE users');
    console.log('\n=== USERS TABLE STRUCTURE ===');
    tableInfo.forEach(col => {
      console.log(`${col.Field} - ${col.Type}${col.Null === 'NO' ? ' NOT NULL' : ''}`);
    });
  } catch(err) {
    console.error('Error:', err.message);
  }
  
  process.exit(0);
}

checkUsers();
