// Simple database initialization without external dependencies
const mysql = require('mysql2');

// Database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'SS@2006',
    database: process.env.DB_NAME || 'ridebazzar'
});

function initializeDatabase() {
    console.log('🔄 Initializing database...');
    
    // Test connection
    connection.connect((err) => {
        if (err) {
            console.error('❌ Database connection failed:', err.message);
            return;
        }
        console.log('✅ Connected to database successfully');
        
        // The password hash for 'admin123' using bcrypt with salt rounds 10
        const adminPasswordHash = '$2a$10$rOFLaEo2o.YVoVRrUhTAVuDJEpuVL9nt6TL4SyRVcfYoMYZJr3F9u';
        
        // Check if admin user exists
        connection.query('SELECT * FROM users WHERE username = ?', ['admin'], (err, results) => {
            if (err) {
                console.error('❌ Error checking admin user:', err.message);
                connection.end();
                return;
            }

            if (results.length === 0) {
                console.log('🔧 Admin user not found, creating...');
                
                // Insert admin user
                const insertAdminQuery = `
                    INSERT INTO users (
                        username, 
                        email, 
                        password, 
                        full_name, 
                        phone, 
                        location, 
                        is_verified
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                
                const adminData = [
                    'admin',
                    'admin@ridebazzar.com',
                    adminPasswordHash,
                    'Admin User',
                    '9999999999',
                    'Mumbai',
                    true
                ];

                connection.query(insertAdminQuery, adminData, (err, result) => {
                    if (err) {
                        console.error('❌ Error creating admin user:', err.message);
                        connection.end();
                        return;
                    }
                    console.log('✅ Admin user created successfully with ID:', result.insertId);
                    
                    // Verify the user was created
                    connection.query('SELECT username, email, full_name FROM users WHERE username = ?', ['admin'], (err, results) => {
                        if (err) {
                            console.error('❌ Error verifying admin user:', err.message);
                        } else {
                            console.log('✅ Admin user verified:', results[0]);
                        }
                        connection.end();
                    });
                });
            } else {
                console.log('✅ Admin user already exists:', {
                    username: results[0].username,
                    email: results[0].email,
                    full_name: results[0].full_name
                });
                connection.end();
            }
        });
    });
}

initializeDatabase();
