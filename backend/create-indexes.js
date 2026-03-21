const db = require('./config/database');

async function createIndexes() {
    try {
        console.log('Creating indexes on cars table...');
        
        const indexes = [
            { name: 'idx_created_at', column: 'created_at' },
            { name: 'idx_price', column: 'price' },
            { name: 'idx_year', column: 'year' },
            { name: 'idx_mileage', column: 'mileage' },
            { name: 'idx_views_count', column: 'views_count' },
            { name: 'idx_status', column: 'status' }
        ];
        
        for (const idx of indexes) {
            try {
                await db.execute(`CREATE INDEX ${idx.name} ON cars(${idx.column})`);
                console.log(`✓ Index ${idx.name} on ${idx.column} created`);
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    console.log(`✓ Index ${idx.name} already exists`);
                } else {
                    throw error;
                }
            }
        }
        
        const [indexList] = await db.execute('SHOW INDEX FROM cars');
        console.log(`\n✅ All indexes created! Total indexes: ${indexList.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating indexes:', error);
        process.exit(1);
    }
}

createIndexes();
