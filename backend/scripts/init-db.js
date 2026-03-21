const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

async function initializeDatabase() {
    let connection;
    
    try {
        console.log('🔄 Connecting to MySQL...');
        
        // Create connection without database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to MySQL');

        // Create database if it doesn't exist
        const dbName = process.env.DB_NAME || 'ridebazzar';
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Database '${dbName}' created/verified`);

        // Switch to the database
        await connection.execute(`USE \`${dbName}\``);

        // Read and execute schema
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        if (fs.existsSync(schemaPath)) {
            console.log('📋 Executing database schema...');
            
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Remove comments and split by semicolon
            const cleanSchema = schema
                .replace(/--.*$/gm, '') // Remove SQL comments
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
                .replace(/^\s*$/gm, ''); // Remove empty lines
            
            const statements = cleanSchema.split(';').filter(stmt => stmt.trim());
            
            for (const statement of statements) {
                const trimmedStatement = statement.trim();
                if (trimmedStatement && !trimmedStatement.toLowerCase().startsWith('use ')) {
                    try {
                        await connection.query(trimmedStatement);
                        console.log('✅ Executed:', trimmedStatement.substring(0, 50) + '...');
                    } catch (error) {
                        if (!error.message.includes('already exists')) {
                            console.error('❌ Error executing statement:', trimmedStatement.substring(0, 50) + '...');
                            console.error('Error:', error.message);
                        }
                    }
                }
            }
            
            console.log('✅ Database schema executed successfully');
        } else {
            console.error('❌ Schema file not found at:', schemaPath);
            return;
        }

        // Create admin user if not exists
        const [users] = await connection.execute("SELECT id FROM users WHERE username = 'admin'");
        
        if (users.length === 0) {
            console.log('👤 Creating admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(`
                INSERT INTO users (username, email, password, full_name, phone, location, is_verified) 
                VALUES ('admin', 'admin@ridebazzar.com', ?, 'Admin User', '9999999999', 'Mumbai', true)
            `, [hashedPassword]);
            
            console.log('✅ Admin user created');
            console.log('   Username: admin');
            console.log('   Password: admin123');
        } else {
            console.log('✅ Admin user already exists');
        }

        console.log('\n🎉 Database initialization completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Update your .env file with the correct database credentials');
        console.log('2. Start the backend server: npm run dev');
        console.log('3. Test the API at: http://localhost:5000/api/health');

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the initialization
initializeDatabase();
