const mysql = require('mysql2/promise');

async function clearOldCars() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'SS@2006',
      database: 'ridebazzar'
    });

    // Delete all cars
    await connection.execute('DELETE FROM cars');
    console.log('✅ Deleted all old cars from database');
    
    // Verify deletion
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM cars');
    console.log('✅ Cars remaining:', result[0].count);
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

clearOldCars();
