const db = require('./database');

// Initialize database tables
async function initializeDatabase() {
    try {
        console.log('🔄 Initializing database...');

        // Check if users table exists
        const [tables] = await db.execute("SHOW TABLES LIKE 'users'");
        
        if (tables.length === 0) {
            console.log('📋 Creating database tables...');
            
            // Read and execute schema file
            const fs = require('fs');
            const path = require('path');
            const schemaPath = path.join(__dirname, 'schema.sql');
            
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                
                // Split schema into individual statements
                const statements = schema.split(';').filter(stmt => stmt.trim());
                
                for (const statement of statements) {
                    if (statement.trim()) {
                        await db.execute(statement);
                    }
                }
                
                console.log('✅ Database tables created successfully');
            } else {
                console.warn('⚠️ Schema file not found, please run schema.sql manually');
            }
        } else {
            console.log('✅ Database tables already exist');
        }

        // Test connection
        await db.execute('SELECT 1');
        console.log('✅ Database connection successful');

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
}

// Seed initial data (for development)
async function seedDatabase() {
    try {
        console.log('🌱 Checking for seed data...');

        // Check if admin user exists
        const [users] = await db.execute("SELECT id FROM users WHERE username = 'admin'");
        
        if (users.length === 0) {
            console.log('👤 Creating admin user...');
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await db.execute(`
                INSERT INTO users (username, email, password, full_name, phone, location, is_verified) 
                VALUES ('admin', 'admin@ridebazzar.com', ?, 'Admin User', '9999999999', 'Mumbai', true)
            `, [hashedPassword]);
            
            console.log('✅ Admin user created (username: admin, password: admin123)');
        }

        console.log('✅ Database seeded successfully');

    } catch (error) {
        console.error('❌ Database seeding failed:', error.message);
        throw error;
    }
}

// Close database connection
async function closeDatabase() {
    try {
        await db.end();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database:', error.message);
    }
}

module.exports = {
    initializeDatabase,
    seedDatabase,
    closeDatabase
};
