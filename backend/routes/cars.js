const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// DEBUG: Check database tables
router.get('/debug/check-tables', async (req, res) => {
    try {
        console.log('🔍 Checking database tables...');
        
        // Check if cars table exists
        const [carsTables] = await db.execute("SHOW TABLES LIKE 'cars'");
        console.log('   Cars table found:', carsTables.length > 0);
        
        // Check if users table exists
        const [usersTables] = await db.execute("SHOW TABLES LIKE 'users'");
        console.log('   Users table found:', usersTables.length > 0);
        
        // Get cars table structure
        if (carsTables.length > 0) {
            const [carsColumns] = await db.execute("SHOW COLUMNS FROM cars");
            console.log('   Cars columns:', carsColumns.map(c => c.Field).join(', '));
        } else {
            console.error('   ❌ CARS TABLE NOT FOUND!');
            // Try to create it
            console.log('   🔄 Attempting to create cars table...');
            await db.execute(`
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
                    booking_amount DECIMAL(10, 2) DEFAULT 0,
                    emi_amount DECIMAL(10, 2) DEFAULT 0,
                    status ENUM('available', 'booked', 'sold') DEFAULT 'available',
                    views_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE,
                    INDEX idx_seller (seller_id),
                    INDEX idx_make_model (make, model),
                    INDEX idx_price (price),
                    INDEX idx_status (status),
                    INDEX idx_location (location)
                )
            `);
            console.log('   ✅ Cars table created');
        }
        
        res.json({
            success: true,
            tables: {
                cars: carsTables.length > 0,
                users: usersTables.length > 0
            }
        });
    } catch (error) {
        console.error('❌ Error checking tables:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DEBUG: Simple test endpoint
router.get('/test/debug', async (req, res) => {
    try {
        const [result] = await db.execute('SELECT COUNT(*) as count FROM cars');
        const carCount = result[0].count;
        
        const [userResult] = await db.execute('SELECT COUNT(*) as count FROM users');
        const userCount = userResult[0].count;
        
        res.json({
            success: true,
            debug: {
                cars_count: carCount,
                users_count: userCount,
                message: 'Database is connected'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code
        });
    }
});

// Get all cars with filters
router.get('/', async (req, res) => {
    try {
        console.log('📋 GET /api/cars - Fetching all cars');
        
        const { 
            make, 
            model, 
            yearFrom, 
            yearTo, 
            priceFrom, 
            priceTo, 
            fuelType, 
            transmission, 
            location, 
            status,
            search,
            page, 
            limit,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;
        
        console.log('   Query params:', { make, model, status, fuelType, transmission, location, search, page, limit });
        
        // Convert to numbers explicitly
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;

        let query = `
            SELECT c.id, c.seller_id, c.make, c.model, c.year, c.price, c.mileage, 
                   c.fuel_type, c.transmission, c.condition_status, c.color, 
                   c.description, c.images, c.contact, c.location, c.status, 
                   c.views_count, c.created_at, c.updated_at, u.username as seller_username 
            FROM cars c
            LEFT JOIN users u ON c.seller_id = u.id
            WHERE 1=1`;
        let params = [];

        // Apply filters
        if (make) {
            query += ' AND c.make LIKE ?';
            params.push(`%${make}%`);
        }
        if (model) {
            query += ' AND c.model LIKE ?';
            params.push(`%${model}%`);
        }
        if (status) {
            query += ' AND c.status = ?';
            params.push(status);
        }
        if (yearFrom) {
            query += ' AND c.year >= ?';
            params.push(yearFrom);
        }
        if (yearTo) {
            query += ' AND c.year <= ?';
            params.push(yearTo);
        }
        if (priceFrom) {
            query += ' AND c.price >= ?';
            params.push(priceFrom);
        }
        if (priceTo) {
            query += ' AND c.price <= ?';
            params.push(priceTo);
        }
        if (fuelType) {
            query += ' AND c.fuel_type = ?';
            params.push(fuelType);
        }
        if (transmission) {
            query += ' AND c.transmission = ?';
            params.push(transmission);
        }
        if (location) {
            query += ' AND c.location LIKE ?';
            params.push(`%${location}%`);
        }
        if (search) {
            query += ' AND (c.make LIKE ? OR c.model LIKE ? OR c.location LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Add sorting - simple indexed column only
        query += ' ORDER BY c.id DESC';

        // Add pagination - use string concatenation instead of placeholders
        const offset = (pageNum - 1) * limitNum;
        query += ` LIMIT ${limitNum} OFFSET ${offset}`;

        const [cars] = await db.execute(query, params);

        // Parse images JSON for each car
        const parsedCars = cars.map(car => {
            try {
                if (car.images && typeof car.images === 'string') {
                    car.images = JSON.parse(car.images);
                } else if (!car.images) {
                    car.images = [];
                }
            } catch (e) {
                car.images = [];
            }
            return car;
        });

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM cars WHERE 1=1';
        let countParams = [];

        // Apply same filters to count query
        if (make) {
            countQuery += ' AND make LIKE ?';
            countParams.push(`%${make}%`);
        }
        if (model) {
            countQuery += ' AND model LIKE ?';
            countParams.push(`%${model}%`);
        }
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
        if (yearFrom) {
            countQuery += ' AND year >= ?';
            countParams.push(yearFrom);
        }
        if (yearTo) {
            countQuery += ' AND year <= ?';
            countParams.push(yearTo);
        }
        if (priceFrom) {
            countQuery += ' AND price >= ?';
            countParams.push(priceFrom);
        }
        if (priceTo) {
            countQuery += ' AND price <= ?';
            countParams.push(priceTo);
        }
        if (fuelType) {
            countQuery += ' AND fuel_type = ?';
            countParams.push(fuelType);
        }
        if (transmission) {
            countQuery += ' AND transmission = ?';
            countParams.push(transmission);
        }
        if (location) {
            countQuery += ' AND location LIKE ?';
            countParams.push(`%${location}%`);
        }
        if (search) {
            countQuery += ' AND (make LIKE ? OR model LIKE ? OR location LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [countResult] = await db.execute(countQuery, countParams);
        const totalCars = countResult[0].total;

        res.json({
            success: true,
            data: {
                cars: parsedCars,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCars / limitNum),
                    totalCars,
                    limit: limitNum
                }
            }
        });

    } catch (error) {
        console.error('❌ Get cars error:', error);
        console.error('   Error message:', error.message);
        console.error('   Error code:', error.code);
        console.error('   Error stack:', error.stack);
        
        // Check for specific database issues
        if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_REFERENCED_TABLE') {
            console.error('   Issue: Database schema mismatch - table or column missing');
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch cars',
            debug: process.env.NODE_ENV === 'production' ? undefined : {
                error: error.message,
                code: error.code,
                sqlState: error.sqlState
            }
        });
    }
});

// Get single car by ID
router.get('/:id', async (req, res) => {
    try {
        const carId = req.params.id;

        const [cars] = await db.execute(`
            SELECT c.*, u.username as seller_username, u.full_name as seller_name, 
                   u.phone as seller_phone, u.email as seller_email, u.location as seller_location
            FROM cars c 
            JOIN users u ON c.seller_id = u.id 
            WHERE c.id = ?
        `, [carId]);

        if (cars.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Car not found' 
            });
        }

        // Increment view count
        await db.execute(
            'UPDATE cars SET views_count = views_count + 1 WHERE id = ?',
            [carId]
        );

        // Parse images JSON
        const car = cars[0];
        try {
            if (car.images && typeof car.images === 'string') {
                car.images = JSON.parse(car.images);
            } else if (!car.images) {
                car.images = [];
            }
        } catch (e) {
            car.images = [];
        }

        res.json({
            success: true,
            data: car
        });

    } catch (error) {
        console.error('Get car error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Create new car listing
router.post('/', auth, async (req, res) => {
    try {
        console.log('📋 POST /api/cars - Creating new car listing');
        console.log('   User ID:', req.user?.userId);
        console.log('   Username:', req.user?.username);
        
        const {
            make,
            model,
            year,
            price,
            mileage,
            fuelType,
            transmission,
            conditionStatus,
            color,
            description,
            images,
            contact,
            location,
            bookingAmount,
            emiAmount
        } = req.body;

        console.log('   Received fields:', {
            make, model, year, price, fuelType, transmission, conditionStatus
        });

        // Validate required fields
        if (!make || !model || !year || !price || !fuelType || !transmission || !conditionStatus) {
            console.warn('❌ Missing required fields');
            return res.status(400).json({ 
                success: false, 
                message: 'Required fields: make, model, year, price, fuelType, transmission, conditionStatus' 
            });
        }

        // Verify user exists in database
        const [userCheck] = await db.execute('SELECT id FROM users WHERE id = ?', [req.user.userId]);
        if (userCheck.length === 0) {
            console.error('❌ User not found in database:', req.user.userId);
            return res.status(404).json({ 
                success: false, 
                message: 'User not found in database' 
            });
        }

        console.log('✅ User verified in database');

        // Insert new car
        console.log('🔄 Inserting car into database...');
        const [result] = await db.execute(`
            INSERT INTO cars (
                seller_id, make, model, year, price, mileage, fuel_type, 
                transmission, condition_status, color, description, images, 
                contact, location, booking_amount, emi_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            req.user.userId,
            make,
            model,
            year,
            price,
            mileage || null,
            fuelType,
            transmission,
            conditionStatus,
            color || null,
            description || null,
            JSON.stringify(images || []),
            contact || null,
            location || null,
            bookingAmount || 0,
            emiAmount || 0
        ]);

        console.log('✅ Car created successfully with ID:', result.insertId);

        res.status(201).json({
            success: true,
            message: 'Car listed successfully',
            data: {
                carId: result.insertId
            }
        });

    } catch (error) {
        console.error('❌ Create car error:', error);
        console.error('   Error message:', error.message);
        console.error('   Error code:', error.code);
        console.error('   Error stack:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            debug: process.env.NODE_ENV === 'production' ? undefined : {
                error: error.message,
                code: error.code,
                sqlState: error.sqlState
            }
        });
    }
});

// Update car listing
router.put('/:id', auth, async (req, res) => {
    try {
        const carId = req.params.id;
        const {
            make,
            model,
            year,
            price,
            mileage,
            fuelType,
            transmission,
            conditionStatus,
            color,
            description,
            images,
            contact,
            location,
            status
        } = req.body;

        // Check if car exists and belongs to user
        const [cars] = await db.execute(
            'SELECT seller_id FROM cars WHERE id = ?',
            [carId]
        );

        if (cars.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Car not found' 
            });
        }

        if (cars[0].seller_id !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only edit your own cars' 
            });
        }

        // Update car
        await db.execute(`
            UPDATE cars SET 
                make = ?, model = ?, year = ?, price = ?, mileage = ?, 
                fuel_type = ?, transmission = ?, condition_status = ?, 
                color = ?, description = ?, images = ?, contact = ?, 
                location = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            make,
            model,
            year,
            price,
            mileage,
            fuelType,
            transmission,
            conditionStatus,
            color,
            description,
            JSON.stringify(images || []),
            contact,
            location,
            status || 'available',
            carId
        ]);

        res.json({
            success: true,
            message: 'Car updated successfully'
        });

    } catch (error) {
        console.error('Update car error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Delete car listing
router.delete('/:id', auth, async (req, res) => {
    try {
        const carId = req.params.id;

        // Check if car exists and belongs to user
        const [cars] = await db.execute(
            'SELECT seller_id FROM cars WHERE id = ?',
            [carId]
        );

        if (cars.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Car not found' 
            });
        }

        // Check if user is owner or admin
        if (cars[0].seller_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only delete your own cars' 
            });
        }

        // Delete car (this will cascade delete related bookings and transactions)
        await db.execute('DELETE FROM cars WHERE id = ?', [carId]);

        res.json({
            success: true,
            message: 'Car deleted successfully'
        });

    } catch (error) {
        console.error('Delete car error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get user's cars
router.get('/user/my-cars', auth, async (req, res) => {
    try {
        const [cars] = await db.execute(
            'SELECT * FROM cars WHERE seller_id = ? ORDER BY created_at DESC',
            [req.user.userId]
        );

        res.json({
            success: true,
            data: cars
        });

    } catch (error) {
        console.error('Get user cars error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

module.exports = router;
