const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'SS@2006',
  database: 'ridebazzar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function deleteTestData() {
  const connection = await pool.getConnection();
  
  try {
    console.log('📊 Deleting test data from database...\n');
    
    // Test car names that were added
    const testCarNames = ['Maruti Swift', 'Hyundai Creta', 'Honda City', 'Tata Nexon', 'Mahindra XUV700'];
    
    // Get IDs of test cars to delete
    const [testCars] = await connection.execute(
      `SELECT id FROM cars WHERE make = 'Maruti' AND model = 'Swift' 
       OR make = 'Hyundai' AND model = 'Creta'
       OR make = 'Honda' AND model = 'City'
       OR make = 'Tata' AND model = 'Nexon'
       OR make = 'Mahindra' AND model = 'XUV700'`
    );
    
    if (testCars.length === 0) {
      console.log('✅ No test cars found to delete');
      await connection.end();
      process.exit(0);
    }
    
    const testCarIds = testCars.map(car => car.id);
    console.log(`🚗 Found ${testCars.length} test cars to delete:`);
    testCars.forEach(car => {
      console.log(`  - ID ${car.id}`);
    });
    
    // Delete bookings associated with test cars
    console.log('\n📅 Deleting test bookings...');
    const placeholders = testCarIds.map(() => '?').join(',');
    const [deleteBookingsResult] = await connection.execute(
      `DELETE FROM bookings WHERE car_id IN (${placeholders})`,
      testCarIds
    );
    console.log(`  ✓ Deleted ${deleteBookingsResult.affectedRows} bookings`);
    
    // Delete the test cars
    console.log('\n🗑️ Deleting test cars...');
    const [deleteCarsResult] = await connection.execute(
      `DELETE FROM cars WHERE id IN (${placeholders})`,
      testCarIds
    );
    console.log(`  ✓ Deleted ${deleteCarsResult.affectedRows} cars`);
    
    // Verify deletion
    const [remainingCars] = await connection.execute('SELECT COUNT(*) as count FROM cars');
    const [remainingBookings] = await connection.execute('SELECT COUNT(*) as count FROM bookings');
    
    console.log('\n✅ Test data deleted successfully!');
    console.log(`\n📊 Database status:\n  - Total Cars: ${remainingCars[0].count}\n  - Total Bookings: ${remainingBookings[0].count}`);
    
  } catch (error) {
    console.error('❌ Error deleting test data:', error.message);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

deleteTestData();
