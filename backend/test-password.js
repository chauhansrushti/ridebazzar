// Password verification test script
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'SS@2006',
    database: process.env.DB_NAME || 'ridebazzar'
});

async function testAdminPassword() {
    try {
        console.log('🔍 Testing admin password...');
        
        // Connect to database
        connection.connect((err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                return;
            }
            console.log('✅ Connected to database');
        });

        // Get admin user
        connection.query('SELECT * FROM users WHERE username = ?', ['admin'], async (err, results) => {
            if (err) {
                console.error('❌ Error fetching admin user:', err.message);
                connection.end();
                return;
            }

            if (results.length === 0) {
                console.log('❌ Admin user not found');
                connection.end();
                return;
            }

            const admin = results[0];
            console.log('✅ Admin user found:');
            console.log('   Username:', admin.username);
            console.log('   Email:', admin.email);
            console.log('   Is Active:', admin.is_active);
            console.log('   Password Hash:', admin.password);
            console.log('   Hash Length:', admin.password.length);

            // Test password verification
            const testPasswords = ['admin123', 'Admin123', 'ADMIN123'];
            
            for (const testPassword of testPasswords) {
                try {
                    const isValid = await bcrypt.compare(testPassword, admin.password);
                    console.log(`   Testing "${testPassword}": ${isValid ? '✅ MATCH' : '❌ NO MATCH'}`);
                } catch (error) {
                    console.log(`   Testing "${testPassword}": ❌ ERROR - ${error.message}`);
                }
            }

            // Test if the hash is valid bcrypt format
            const bcryptRegex = /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9\.\/]{53}$/;
            const isValidBcryptHash = bcryptRegex.test(admin.password);
            console.log('   Is valid bcrypt hash:', isValidBcryptHash ? '✅ YES' : '❌ NO');

            if (!isValidBcryptHash) {
                console.log('🔧 Creating new bcrypt hash for admin123...');
                const newHash = await bcrypt.hash('admin123', 10);
                console.log('   New hash:', newHash);
                
                // Update the password in database
                connection.query(
                    'UPDATE users SET password = ? WHERE username = ?',
                    [newHash, 'admin'],
                    (err, result) => {
                        if (err) {
                            console.error('❌ Error updating password:', err.message);
                        } else {
                            console.log('✅ Password updated successfully');
                            console.log('✅ Admin can now login with username: admin, password: admin123');
                        }
                        connection.end();
                    }
                );
            } else {
                connection.end();
            }
        });

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        connection.end();
    }
}

testAdminPassword();
