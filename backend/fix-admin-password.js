// Fix admin password script
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'SS@2006',
    database: process.env.DB_NAME || 'ridebazzar'
});

async function fixAdminPassword() {
    try {
        console.log('🔧 Fixing admin password...');
        
        // Connect to database
        connection.connect(async (err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                return;
            }
            console.log('✅ Connected to database');

            try {
                // Create new hash for 'admin123'
                const newPassword = 'admin123';
                const newHash = await bcrypt.hash(newPassword, 10);
                console.log('✅ New hash created for "admin123"');
                console.log('   Hash:', newHash);

                // Verify the new hash works
                const isValid = await bcrypt.compare(newPassword, newHash);
                console.log('✅ Hash verification:', isValid ? 'PASS' : 'FAIL');

                if (isValid) {
                    // Update the password in database
                    connection.query(
                        'UPDATE users SET password = ? WHERE username = ?',
                        [newHash, 'admin'],
                        (err, result) => {
                            if (err) {
                                console.error('❌ Error updating password:', err.message);
                            } else {
                                console.log('✅ Admin password updated successfully!');
                                console.log('✅ You can now login with:');
                                console.log('   Username: admin');
                                console.log('   Password: admin123');
                                
                                // Verify the update worked
                                connection.query('SELECT username, password FROM users WHERE username = ?', ['admin'], (err, results) => {
                                    if (err) {
                                        console.error('❌ Error verifying update:', err.message);
                                    } else {
                                        console.log('✅ Password update verified in database');
                                    }
                                    connection.end();
                                });
                            }
                        }
                    );
                } else {
                    console.error('❌ Hash verification failed');
                    connection.end();
                }
            } catch (hashError) {
                console.error('❌ Error creating hash:', hashError.message);
                connection.end();
            }
        });

    } catch (error) {
        console.error('❌ Script failed:', error.message);
    }
}

fixAdminPassword();
