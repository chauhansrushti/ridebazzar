const mysql = require('mysql2/promise');

// Test data
const testCars = [
  { make: 'Maruti', model: 'Swift', year: 2022, price: 650000, status: 'available', seller_id: 1, description: 'Well maintained Swift' },
  { make: 'Hyundai', model: 'Creta', year: 2021, price: 1200000, status: 'sold', seller_id: 1, description: 'Excellent Creta with low mileage' },
  { make: 'Honda', model: 'City', year: 2023, price: 1100000, status: 'available', seller_id: 1, description: 'Brand new Honda City' },
  { make: 'Tata', model: 'Nexon', year: 2020, price: 950000, status: 'available', seller_id: 2, description: 'Reliable Nexon' },
  { make: 'Mahindra', model: 'XUV700', year: 2022, price: 1700000, status: 'sold', seller_id: 2, description: 'Premium XUV700' },
];

const testUsers = [
  { username: 'seller1', email: 'seller1@test.com', password: 'password123', role: 'seller', full_name: 'Seller One' },
  { username: 'seller2', email: 'seller2@test.com', password: 'password123', role: 'seller', full_name: 'Seller Two' },
  { username: 'buyer1', email: 'buyer1@test.com', password: 'password123', role: 'user', full_name: 'Buyer One' },
];

const testBookings = [
  { car_id: 2, buyer_id: 3, seller_id: 1, booking_amount: 100000, total_amount: 1200000, status: 'confirmed' },
  { car_id: 5, buyer_id: 3, seller_id: 2, booking_amount: 100000, total_amount: 1700000, status: 'confirmed' },
];

async function addTestData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'SS@2006',
    database: 'ridebazzar'
  });

  try {
    console.log('📊 Adding test data to database...\n');

    // Add test cars
    console.log('🚗 Adding test cars...');
    for (const car of testCars) {
      await connection.execute(
        'INSERT INTO cars (make, model, year, price, status, seller_id, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [car.make, car.model, car.year, car.price, car.status, car.seller_id, car.description]
      );
      console.log(`  ✓ Added ${car.make} ${car.model}`);
    }

    // Add test bookings
    console.log('\n📅 Adding test bookings...');
    // Get the IDs of the cars we just inserted
    const [carResults] = await connection.execute('SELECT id FROM cars ORDER BY id DESC LIMIT 5');
    const carIds = carResults.map(r => r.id).reverse(); // Get first 5 cars
    
    if (carIds.length >= 2) {
      // Create first booking
      await connection.execute(
        'INSERT INTO bookings (car_id, buyer_id, seller_id, booking_amount, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [carIds[1], 2, 1, 100000, 1200000, 'confirmed']
      );
      console.log(`  ✓ Added booking for car ${carIds[1]}`);
      
      // Create second booking if we have enough cars
      if (carIds.length >= 5) {
        await connection.execute(
          'INSERT INTO bookings (car_id, buyer_id, seller_id, booking_amount, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [carIds[4], 2, 2, 100000, 1700000, 'confirmed']
        );
        console.log(`  ✓ Added booking for car ${carIds[4]}`);
      }
    }

    console.log('\n✅ Test data added successfully!\n');
    console.log('📊 Report will now show:');
    console.log('  - Total Inventory: 5 cars');
    console.log('  - Available Cars: 3');
    console.log('  - Sold Cars: 2');
    console.log('  - Total Bookings: 2\n');

  } catch (error) {
    console.error('❌ Error adding test data:', error);
  } finally {
    await connection.end();
  }
}

addTestData();
