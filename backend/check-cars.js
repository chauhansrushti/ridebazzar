const db = require('./config/database');

async function checkCars() {
  try {
    const [cars] = await db.execute('SELECT * FROM cars');
    console.log(`\n📊 Total cars in database: ${cars.length}`);
    
    if (cars.length > 0) {
      console.log('\n🚗 Cars list:');
      cars.forEach((car, index) => {
        console.log(`\n${index + 1}. ${car.make} ${car.model} (${car.year})`);
        console.log(`   Price: ₹${car.price}`);
        console.log(`   Status: ${car.status}`);
        console.log(`   Seller ID: ${car.seller_id}`);
        console.log(`   Created: ${car.created_at}`);
      });
    } else {
      console.log('\n⚠️ No cars found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCars();
