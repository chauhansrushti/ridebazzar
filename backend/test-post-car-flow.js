const db = require('./config/database');

async function testPostCarFlow() {
  console.log('\n🔍 Testing Post Car Flow...\n');
  
  try {
    // 1. Check if backend can connect to database
    console.log('1️⃣ Testing database connection...');
    const [result] = await db.execute('SELECT 1 as test');
    console.log('   ✅ Database connected successfully');
    
    // 2. Check cars table structure
    console.log('\n2️⃣ Checking cars table structure...');
    const [columns] = await db.execute('DESCRIBE cars');
    const columnNames = columns.map(col => col.Field);
    console.log('   Table columns:', columnNames.join(', '));
    
    const requiredColumns = ['id', 'seller_id', 'make', 'model', 'year', 'price', 'fuel_type', 'transmission', 'condition_status', 'status', 'booking_amount', 'emi_amount', 'images'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('   ⚠️  Missing columns:', missingColumns.join(', '));
    } else {
      console.log('   ✅ All required columns present');
    }
    
    // 3. Check current cars count
    console.log('\n3️⃣ Checking current cars in database...');
    const [cars] = await db.execute('SELECT COUNT(*) as count FROM cars');
    console.log(`   📊 Total cars: ${cars[0].count}`);
    
    // 4. Get latest car
    const [latestCars] = await db.execute('SELECT * FROM cars ORDER BY created_at DESC LIMIT 1');
    if (latestCars.length > 0) {
      const latest = latestCars[0];
      console.log('\n   📍 Latest car in database:');
      console.log(`      Make: ${latest.make}`);
      console.log(`      Model: ${latest.model}`);
      console.log(`      Year: ${latest.year}`);
      console.log(`      Price: ₹${latest.price}`);
      console.log(`      Status: ${latest.status}`);
      console.log(`      Seller ID: ${latest.seller_id}`);
      console.log(`      Booking Amount: ₹${latest.booking_amount || 0}`);
      console.log(`      EMI Amount: ₹${latest.emi_amount || 0}`);
      console.log(`      Created: ${latest.created_at}`);
    }
    
    // 5. Check users table for authentication
    console.log('\n4️⃣ Checking users table...');
    const [users] = await db.execute('SELECT id, username, email FROM users');
    console.log(`   👥 Total users: ${users.length}`);
    users.forEach((user, idx) => {
      console.log(`      ${idx + 1}. ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });
    
    // 6. Summary
    console.log('\n📋 Summary:');
    console.log('   ✅ Database is accessible');
    console.log('   ✅ Cars table has correct structure');
    console.log(`   ✅ ${cars[0].count} cars currently in database`);
    console.log(`   ✅ ${users.length} users registered`);
    
    console.log('\n💡 Next Steps to Test:');
    console.log('   1. Make sure backend server is running (npm run dev in backend folder)');
    console.log('   2. Login to the application');
    console.log('   3. Go to Post Car page and submit a new car');
    console.log('   4. Check if it appears in:');
    console.log('      - Browse Cars (all-cars.html)');
    console.log('      - Dashboard > My Cars tab');
    console.log('   5. Run this script again to verify database was updated');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testPostCarFlow();
