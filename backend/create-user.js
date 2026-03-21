const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function createUser() {
    try {
        const username = 'srushti';
        const email = 'srushti@ridebazzar.com';
        const password = 'srushti123';
        const role = 'admin';
        
        // Check if user exists
        const [existing] = await db.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existing.length > 0) {
            console.log('User already exists. Updating password...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.execute(
                'UPDATE users SET password = ?, role = ? WHERE username = ?',
                [hashedPassword, role, username]
            );
            console.log('Password updated successfully!');
        } else {
            console.log('Creating new user...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.execute(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, role]
            );
            console.log('User created successfully!');
        }
        
        console.log(`\nLogin credentials:`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        console.log(`Role: ${role}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createUser();
