const bcrypt = require('bcrypt');
const db = require('./config/database');

async function fixSrushtiPassword() {
    try {
        // Hash the password 'srushti123'
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('srushti123', saltRounds);
        
        console.log('🔄 Updating srushti user password...');
        
        // Update the password in database
        const [result] = await db.execute(
            'UPDATE users SET password = ? WHERE username = ?',
            [hashedPassword, 'srushti']
        );
        
        if (result.affectedRows > 0) {
            console.log('✅ Srushti password updated successfully!');
            console.log('📋 Login credentials:');
            console.log('   Username: srushti');
            console.log('   Password: srushti123');
            
            // Verify the user exists with correct role
            const [users] = await db.execute(
                'SELECT username, email, role FROM users WHERE username = ?',
                ['srushti']
            );
            
            if (users.length > 0) {
                console.log('👤 User info:');
                console.table(users[0]);
                console.log('🎯 This user should redirect to dashboard.html after login');
            }
        } else {
            console.log('❌ No user found with username "srushti"');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing password:', error.message);
        process.exit(1);
    }
}

fixSrushtiPassword();
