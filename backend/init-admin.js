const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',  // Try empty password first
    database: process.env.DB_NAME || 'ridebazzar'
});

async function initializeDatabase() {
    try {
        console.log('🔄 Connecting to database...');
        
        // Test connection
        connection.connect((err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                return;
            }
            console.log('✅ Connected to database successfully');
        });

        // Check if admin user exists
        connection.query('SELECT * FROM users WHERE username = ?', ['admin'], async (err, results) => {
            if (err) {
                console.error('❌ Error checking admin user:', err.message);
                return;
            }

            if (results.length === 0) {
                console.log('🔧 Admin user not found, creating...');
                
                // Hash the password
                const hashedPassword = await bcrypt.hash('admin123', 10);
                
                // Insert admin user
                const adminUser = {
                    username: 'admin',
                    email: 'admin@ridebazzar.com',
                    password: hashedPassword,
                    full_name: 'Admin User',
                    phone: '9999999999',
                    location: 'Mumbai',
                    is_verified: true
                };

                connection.query('INSERT INTO users SET ?', adminUser, (err, result) => {
                    if (err) {
                        console.error('❌ Error creating admin user:', err.message);
                        return;
                    }
                    console.log('✅ Admin user created successfully with ID:', result.insertId);
                    
                    // Verify the user was created
                    connection.query('SELECT username, email FROM users WHERE username = ?', ['admin'], (err, results) => {
                        if (err) {
                            console.error('❌ Error verifying admin user:', err.message);
                            return;
                        }
                        console.log('✅ Admin user verified:', results[0]);
                        connection.end();
                    });
                });
            } else {
                console.log('✅ Admin user already exists:', results[0].username);
                connection.end();
            }
        });

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
    }
}

initializeDatabase();
