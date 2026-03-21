const mysql = require('mysql2/promise');

async function createInquiriesTable() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'ridebazzar'
        });

        // Create inquiries table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS inquiries (
                id INT PRIMARY KEY AUTO_INCREMENT,
                car_id INT NOT NULL,
                buyer_id INT NOT NULL,
                seller_id INT NOT NULL,
                message TEXT NOT NULL,
                phone VARCHAR(20) NOT NULL,
                response TEXT,
                status ENUM('pending', 'responded', 'closed') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (car_id) REFERENCES cars (id) ON DELETE CASCADE,
                FOREIGN KEY (buyer_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE,
                INDEX idx_car (car_id),
                INDEX idx_buyer (buyer_id),
                INDEX idx_seller (seller_id),
                INDEX idx_status (status)
            )
        `);

        console.log('✅ Inquiries table created successfully!');

        // Check if inquiries column exists in cars table
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME='cars' AND COLUMN_NAME='inquiries'
        `);

        if (columns.length === 0) {
            await connection.execute(`ALTER TABLE cars ADD COLUMN inquiries INT DEFAULT 0`);
            console.log('✅ Added inquiries column to cars table');
        } else {
            console.log('ℹ️ Inquiries column already exists in cars table');
        }

        await connection.end();
        console.log('✅ Database setup complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createInquiriesTable();
