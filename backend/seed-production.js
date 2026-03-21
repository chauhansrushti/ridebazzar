const mysql = require('mysql2/promise');
require('dotenv').config();

// Test data
const testCars = [
  { make: 'Maruti', model: 'Swift', year: 2022, price: 650000, status: 'available', seller_id: 1, description: 'Well maintained Swift' },
  { make: 'Hyundai', model: 'Creta', year: 2021, price: 1200000, status: 'sold', seller_id: 1, description: 'Excellent Creta with low mileage' },
  { make: 'Honda', model: 'City', year: 2023, price: 1100000, status: 'available', seller_id: 1, description: 'Brand new Honda City' },
  { make: 'Tata', model: 'Nexon', year: 2020, price: 950000, status: 'available', seller_id: 2, description: 'Reliable Nexon' },
  { make: 'Mahindra', model: 'XUV700', year: 2022, price: 1700000, status: 'sold', seller_id: 2, description: 'Premium XUV700' },
];

async function seedData() {
  let connection;
  try {
    // Connect using Railway environment variables (or local defaults)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ridebazzar'
    });

    console.log('✅ Connected to database');
    console.log(`🌐 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`📦 Database: ${process.env.DB_NAME || 'ridebazzar'}\n`);

    // Check if cars already exist
    const [existingCars] = await connection.execute('SELECT COUNT(*) as count FROM cars');
    if (existingCars[0].count > 0) {
      console.log(`ℹ️  Database already has ${existingCars[0].count} cars. Skipping seed to avoid duplicates.\n`);
      return;
    }

    // Check if admin user exists
    const [adminUser] = await connection.execute('SELECT id FROM users WHERE username = ?', ['admin']);
    
    let adminId = 1;
    if (adminUser.length === 0) {
      console.log('👤 Creating admin user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, password, full_name, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', 'admin@ridebazzar.com', hashedPassword, 'Admin User', true, true]
      );
      adminId = result.insertId;
      console.log('  ✓ Admin user created (username: admin, password: admin123)\n');
    } else {
      adminId = adminUser[0].id;
      console.log('✓ Admin user already exists\n');
    }

    // Add test cars
    console.log('🚗 Adding test cars...');
    const carIds = [];
    for (const car of testCars) {
      const [result] = await connection.execute(
        'INSERT INTO cars (make, model, year, price, status, seller_id, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [car.make, car.model, car.year, car.price, car.status, car.seller_id || adminId, car.description]
      );
      carIds.push(result.insertId);
      console.log(`  ✓ Added ${car.make} ${car.model} (₹${car.price.toLocaleString('en-IN')})`);
    }

    // Add test bookings
    console.log('\n📅 Adding test bookings...');
    if (carIds.length >= 2) {
      // First booking
      await connection.execute(
        'INSERT INTO bookings (car_id, buyer_id, seller_id, booking_amount, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [carIds[1], adminId, adminId, 100000, testCars[1].price, 'confirmed']
      );
      console.log(`  ✓ Booking 1: ${testCars[1].make} ${testCars[1].model} - ₹${testCars[1].price.toLocaleString('en-IN')}`);

      if (carIds.length >= 5) {
        await connection.execute(
          'INSERT INTO bookings (car_id, buyer_id, seller_id, booking_amount, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [carIds[4], adminId, adminId, 100000, testCars[4].price, 'confirmed']
        );
        console.log(`  ✓ Booking 2: ${testCars[4].make} ${testCars[4].model} - ₹${testCars[4].price.toLocaleString('en-IN')}`);
      }
    }

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Dashboard will now show:');
    console.log('  ✓ Total Inventory: 5 cars');
    console.log('  ✓ Available Cars: 3');
    console.log('  ✓ Sold Cars: 2');
    console.log('  ✓ Total Bookings: 2\n');
    console.log('🎯 Next: Refresh admin dashboard to see updated data!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    if (error.code === 'ER_NO_DB_ERROR') {
      console.error('\n⚠️  Database "ridebazzar" not found. Make sure it was created first.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedData();
