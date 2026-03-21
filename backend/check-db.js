const mysql = require('mysql2/promise');

async function checkCars() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'SS@2006',
      database: 'ridebazzar'
    });

    const [cars] = await connection.execute('SELECT id, make, model, images FROM cars LIMIT 1');
    console.log('First car from database:');
    console.log(JSON.stringify(cars[0], null, 2));
    
    await connection.end();
  } catch (err) {
    console.error('Database error:', err.message);
  }
}

checkCars();
