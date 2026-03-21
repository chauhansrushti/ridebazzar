const express = require('express');
const db = require('./config/database');

const router = express.Router();

// Test if the route works
async function test() {
  try {
    console.log('🧪 Testing cars route...');
    
    // Test 1: Get all cars
    const [allCars] = await db.execute('SELECT id, make, model, status FROM cars');
    console.log(`✅ Test 1: Got ${allCars.length} cars from database`);
    console.log('Sample cars:');
    allCars.slice(0, 3).forEach(car => {
      console.log(`  - ${car.id}: ${car.make} ${car.model} (${car.status})`);
    });
    
    // Test 2: Test query without status filter
    const query = 'SELECT * FROM cars WHERE 1=1 LIMIT 10';
    const [cars] = await db.execute(query);
    console.log(`✅ Test 2: Query without filter returned ${cars.length} cars`);
    
    // Test 3: Test query with status='available'
    const [availableCars] = await db.execute('SELECT * FROM cars WHERE status = ? LIMIT 10', ['available']);
    console.log(`✅ Test 3: Query with status='available' returned ${availableCars.length} cars`);
    
    // Test 4: Count all cars
    const [countAll] = await db.execute('SELECT COUNT(*) as total FROM cars');
    console.log(`✅ Test 4: Total cars in database: ${countAll[0].total}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
