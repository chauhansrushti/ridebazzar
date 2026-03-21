const db = require('./config/database');

async function updateCarsTable() {
  try {
    console.log('Updating cars table...');
    
    // Add booking_amount column
    try {
      await db.execute('ALTER TABLE cars ADD COLUMN booking_amount DECIMAL(10, 2) DEFAULT 0');
      console.log('✓ Added booking_amount column');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ booking_amount column already exists');
      } else {
        throw e;
      }
    }
    
    // Add emi_amount column
    try {
      await db.execute('ALTER TABLE cars ADD COLUMN emi_amount DECIMAL(10, 2) DEFAULT 0');
      console.log('✓ Added emi_amount column');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ emi_amount column already exists');
      } else {
        throw e;
      }
    }
    
    console.log('\n✅ Database updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    process.exit(1);
  }
}

updateCarsTable();
