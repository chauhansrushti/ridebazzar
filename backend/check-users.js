const mysql = require('mysql2/promise');

async function checkUsers() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'ridebazzar'
  });

  try {
    const [users] = await pool.execute('SELECT id, username, email, role FROM users');
    console.log('\n=== USERS IN DATABASE ===');
    users.forEach(u => {
      console.log(`ID: ${u.id} | Username: ${u.username} | Email: ${u.email} | Role: ${u.role || 'user'}`);
    });
    
    const [cars] = await pool.execute('SELECT id, make, model, seller_id FROM cars WHERE id = 7');
    console.log('\n=== CAR ID 7 (the one you tried to delete) ===');
    cars.forEach(c => {
      console.log(`Car ID: ${c.id} | Make: ${c.make} | Model: ${c.model} | Seller ID: ${c.seller_id}`);
    });
  } catch(err) {
    console.error('Error:', err.message);
  }
  
  process.exit(0);
}

checkUsers();
