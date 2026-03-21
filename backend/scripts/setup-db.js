const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

async function createTables(connection) {
    console.log('📋 Creating database tables...');

    // Create users table
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            phone VARCHAR(15),
            location VARCHAR(100),
            profile_picture VARCHAR(255),
            bio TEXT,
            is_verified BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Users table created');

    // Create cars table
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS cars (
            id INT PRIMARY KEY AUTO_INCREMENT,
            seller_id INT NOT NULL,
            make VARCHAR(50) NOT NULL,
            model VARCHAR(50) NOT NULL,
            year YEAR NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            mileage INT,
            fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG') NOT NULL,
            transmission ENUM('Manual', 'Automatic') NOT NULL,
            condition_status ENUM('Excellent', 'Good', 'Fair', 'Poor') NOT NULL,
            color VARCHAR(30),
            description TEXT,
            images JSON,
            contact VARCHAR(15),
            location VARCHAR(100),
            status ENUM('available', 'booked', 'sold') DEFAULT 'available',
            views_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    console.log('✅ Cars table created');

    // Create bookings table
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            car_id INT NOT NULL,
            buyer_id INT NOT NULL,
            seller_id INT NOT NULL,
            booking_amount DECIMAL(10, 2) NOT NULL,
            total_amount DECIMAL(10, 2) NOT NULL,
            status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
            inspection_date DATE,
            buyer_info JSON,
            notes TEXT,
            cancellation_reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            cancelled_at TIMESTAMP NULL,
            FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
            FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    console.log('✅ Bookings table created');

    // Create transactions table
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(50) PRIMARY KEY,
            booking_id INT NOT NULL,
            user_id INT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            payment_method ENUM('card', 'upi', 'netbanking', 'wallet') NOT NULL,
            payment_status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
            payment_gateway_response JSON,
            transaction_type ENUM('booking', 'payment', 'refund') DEFAULT 'booking',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    console.log('✅ Transactions table created');
}

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

        // Create tables
        await createTables(connection);

        // Check if admin user exists
        const [users] = await connection.execute("SELECT id FROM users WHERE username = 'admin'");
        
        if (users.length === 0) {
            console.log('👤 Creating admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(`
                INSERT INTO users (username, email, password, full_name, phone, location, is_verified) 
                VALUES ('admin', 'admin@ridebazzar.com', ?, 'Admin User', '9999999999', 'Mumbai', true)
            `, [hashedPassword]);
            
            console.log('✅ Admin user created (username: admin, password: admin123)');
        } else {
            console.log('✅ Admin user already exists');
        }

        // Add some sample data
        const [carCount] = await connection.execute("SELECT COUNT(*) as count FROM cars");
        if (carCount[0].count === 0) {
            console.log('🚗 Adding sample cars...');
            
            const [adminUser] = await connection.execute("SELECT id FROM users WHERE username = 'admin'");
            const adminId = adminUser[0].id;
            
            await connection.execute(`
                INSERT INTO cars (seller_id, make, model, year, price, mileage, fuel_type, transmission, condition_status, color, description, location) 
                VALUES 
                (?, 'Maruti Suzuki', 'Swift', 2020, 650000, 15000, 'Petrol', 'Manual', 'Excellent', 'Red', 'Well maintained car with complete service history', 'Delhi'),
                (?, 'Hyundai', 'i20', 2021, 750000, 8000, 'Petrol', 'Automatic', 'Excellent', 'White', 'Single owner, barely used', 'Mumbai'),
                (?, 'Tata', 'Nexon', 2022, 1200000, 5000, 'Electric', 'Automatic', 'Excellent', 'Blue', 'Electric vehicle in pristine condition', 'Bangalore')
            `, [adminId, adminId, adminId]);
            
            console.log('✅ Sample cars added');
        }

        console.log('🎉 Database initialization completed successfully!');
        console.log('📡 You can now start the server with: npm run dev');

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.error('📋 Please check your .env file and MySQL connection');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the initialization
initializeDatabase();
