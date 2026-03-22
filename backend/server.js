const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const inquiryRoutes = require('./routes/inquiries');
const messagesRoutes = require('./routes/messages');
const db = require('./config/database');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();

// Initialize database on startup
const initializeDatabase = async () => {
  console.log('\n🔧 initializeDatabase() starting...');
  try {
    console.log('🔄 Checking if tables exist...');
    
    // Check if users table exists
    const [tables] = await db.execute("SHOW TABLES LIKE 'users'");
    console.log(`  Tables check result: found ${tables.length} existing tables`);
    
    if (tables.length === 0) {
      console.log('📋 Users table NOT found. Creating all tables directly...');
      
      // CREATE TABLES directly as hardcoded SQL (no file dependency)
      const createTables = [
        `CREATE TABLE IF NOT EXISTS users (
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_email (email)
        )`,
        
        `CREATE TABLE IF NOT EXISTS cars (
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
          images LONGTEXT,
          contact VARCHAR(15),
          location VARCHAR(100),
          status ENUM('available', 'pending', 'sold') DEFAULT 'available',
          views_count INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_seller_id (seller_id),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
        )`,
        
        `CREATE TABLE IF NOT EXISTS bookings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          car_id INT NOT NULL,
          buyer_id INT NOT NULL,
          seller_id INT NOT NULL,
          booking_date DATE NOT NULL,
          status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
          FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_car_id (car_id),
          INDEX idx_buyer_id (buyer_id),
          INDEX idx_seller_id (seller_id)
        )`,
        
        `CREATE TABLE IF NOT EXISTS transactions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          car_id INT NOT NULL,
          buyer_id INT NOT NULL,
          seller_id INT NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          payment_method VARCHAR(50),
          payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
          transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
          FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_car_id (car_id),
          INDEX idx_buyer_id (buyer_id),
          INDEX idx_seller_id (seller_id)
        )`,
        
        `CREATE TABLE IF NOT EXISTS inquiries (
          id INT PRIMARY KEY AUTO_INCREMENT,
          car_id INT NOT NULL,
          user_id INT NOT NULL,
          message TEXT,
          status ENUM('open', 'replied', 'closed') DEFAULT 'open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_car_id (car_id),
          INDEX idx_user_id (user_id)
        )`,
        
        `CREATE TABLE IF NOT EXISTS messages (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sender_id INT NOT NULL,
          receiver_id INT NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_sender_id (sender_id),
          INDEX idx_receiver_id (receiver_id)
        )`
      ];
      
      console.log(`  Executing ${createTables.length} CREATE TABLE statements...`);
      
      let executed = 0;
      for (const statement of createTables) {
        try {
          await db.execute(statement);
          const match = statement.match(/CREATE TABLE.*?(\w+)\s*\(/i);
          if (match) {
            console.log(`    ✅ Created table: ${match[1]}`);
            executed++;
          }
        } catch (err) {
          console.warn(`    ⚠️  Error: ${err.message.substring(0, 60)}`);
        }
      }
      
      console.log(`✅ Database tables initialized: ${executed}/${createTables.length} tables created`);
    } else {
      console.log('✅ Database tables already exist (users table found)');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;  // THROW error so server doesn't continue without tables
  }
  console.log('🔧 initializeDatabase() complete\n');
};

// Seed test data if database is empty
const seedTestData = async () => {
  console.log('\n🌱 seedTestData() starting...');
  try {
    // Check if cars table has data
    let carCount = 0;
    try {
      console.log('📊 Attempting COUNT query on cars table...');
      const [cars] = await db.execute('SELECT COUNT(*) as count FROM cars');
      carCount = cars[0].count;
      console.log(`✅ Cars count query succeeded: ${carCount} cars in database`);
    } catch (err) {
      // Table doesn't exist or other error
      console.error('❌ Cars count query failed:', err.message);
      console.log('⚠️  Skipping seeding (tables may not be ready)');
      return;
    }
    
    if (carCount > 0) {
      console.log(`✅ Database already has ${carCount} cars. Checking for missing images...`);
      
      // Update existing test cars with images if they don't have them
      try {
        const testCarsWithImages = [
          { make: 'Maruti', model: 'Swift', images: ['images/bmw.jpg'] },
          { make: 'Hyundai', model: 'Creta', images: ['images/volkswagen.avif'] },
          { make: 'Honda', model: 'City', images: ['images/honda-city.png'] },
          { make: 'Tata', model: 'Nexon', images: ['images/toyota.avif'] },
          { make: 'Mahindra', model: 'XUV700', images: ['images/car login.jpg'] },
        ];
        
        for (const testCar of testCarsWithImages) {
          const [existingCars] = await db.execute(
            'SELECT id, images FROM cars WHERE make = ? AND model = ?',
            [testCar.make, testCar.model]
          );
          
          if (existingCars.length > 0) {
            const car = existingCars[0];
            // ALWAYS update test cars with local image paths (remove old/broken images)
            await db.execute(
              'UPDATE cars SET images = ? WHERE id = ?',
              [JSON.stringify(testCar.images), car.id]
            );
            console.log(`  📸 Updated images for ${testCar.make} ${testCar.model} to ${testCar.images[0]}`);
          }
        }
      } catch (updateErr) {
        console.warn('  ⚠️  Could not update car images:', updateErr.message);
      }
      
      return; // Data already exists
    }

    console.log('📊 Database is empty. Starting seed process...');
    
    // Check if admin user exists
    const [adminUsers] = await db.execute('SELECT id FROM users WHERE username = ?', ['admin']);
    let adminId = 1;
    
    if (adminUsers.length === 0) {
      console.log('  👤 Creating admin user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const [result] = await db.execute(
        'INSERT INTO users (username, email, password, full_name, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', 'admin@ridebazzar.com', hashedPassword, 'Admin User', true, true]
      );
      adminId = result.insertId;
      console.log(`  ✓ Admin user created (ID: ${adminId})`);
    } else {
      adminId = adminUsers[0].id;
      console.log(`  ✓ Admin user already exists (ID: ${adminId})`);
    }

    // Get all existing users
    const [allUsers] = await db.execute('SELECT id, username FROM users');
    console.log(`  📊 Found ${allUsers.length} existing users in database`);
    console.log(`     Users: ${allUsers.map(u => u.username).join(', ')}`);

    // Insert test cars with placeholder images
    const testCars = [
      { make: 'Maruti', model: 'Swift', year: 2022, price: 650000, status: 'available', description: 'Well maintained Swift', fuel_type: 'Petrol', transmission: 'Manual', condition_status: 'Excellent', mileage: 25000, color: 'Red', contact: '9999999999', location: 'Mumbai', images: ['images/bmw.jpg'] },
      { make: 'Hyundai', model: 'Creta', year: 2021, price: 1200000, status: 'available', description: 'Excellent Creta with low mileage', fuel_type: 'Diesel', transmission: 'Automatic', condition_status: 'Excellent', mileage: 15000, color: 'Blue', contact: '9999999998', location: 'Delhi', images: ['images/volkswagen.avif'] },
      { make: 'Honda', model: 'City', year: 2023, price: 1100000, status: 'available', description: 'Brand new Honda City', fuel_type: 'Petrol', transmission: 'Automatic', condition_status: 'Excellent', mileage: 5000, color: 'White', contact: '9999999997', location: 'Bangalore', images: ['images/honda-city.png'] },
      { make: 'Tata', model: 'Nexon', year: 2020, price: 950000, status: 'available', description: 'Reliable Nexon', fuel_type: 'Petrol', transmission: 'Manual', condition_status: 'Good', mileage: 45000, color: 'Black', contact: '9999999996', location: 'Mumbai', images: ['images/toyota.avif'] },
      { make: 'Mahindra', model: 'XUV700', year: 2022, price: 1700000, status: 'available', description: 'Premium XUV700', fuel_type: 'Diesel', transmission: 'Automatic', condition_status: 'Excellent', mileage: 20000, color: 'Silver', contact: '9999999995', location: 'Hyderabad', images: ['images/car login.jpg'] },
    ];

    console.log(`  🚗 Inserting ${testCars.length} test cars...`);
    const carIds = [];
    for (const car of testCars) {
      try {
        const [result] = await db.execute(
          'INSERT INTO cars (make, model, year, price, status, seller_id, description, fuel_type, transmission, condition_status, mileage, color, contact, location, images, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
          [car.make, car.model, car.year, car.price, car.status, adminId, car.description, car.fuel_type, car.transmission, car.condition_status, car.mileage, car.color, car.contact, car.location, JSON.stringify(car.images || [])]
        );
        carIds.push(result.insertId);
        console.log(`    ✓ Added ${car.make} ${car.model}`);
      } catch (carErr) {
        console.error(`    ✗ Failed to add ${car.make} ${car.model}:`, carErr.message);
      }
    }

    console.log(`  📋 Creating ${Math.min(2, carIds.length)} test bookings...`);
    // Add test bookings
    if (carIds.length >= 2) {
      try {
        await db.execute(
          'INSERT INTO bookings (car_id, buyer_id, seller_id, booking_amount, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [carIds[1], adminId, adminId, 100000, testCars[1].price, 'confirmed']
        );
        console.log('    ✓ Booking 1 created');

        if (carIds.length >= 5) {
          await db.execute(
            'INSERT INTO bookings (car_id, buyer_id, seller_id, booking_amount, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [carIds[4], adminId, adminId, 100000, testCars[4].price, 'confirmed']
          );
          console.log('    ✓ Booking 2 created');
        }
      } catch (bookErr) {
        console.error('    ✗ Failed to create bookings:', bookErr.message);
      }
    }

    console.log('✅ Test data seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Unexpected error in seedTestData:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Enable CORS for all origins in development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Trust proxy - needed for Railway and other reverse proxies to send X-Forwarded-For header
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving - Serve frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Static file serving - Serve uploads
app.use('/uploads', express.static('uploads'));

// IMPORTANT: Define custom endpoints BEFORE route handlers so they're checked first
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RideBazzar API is running',
    timestamp: new Date().toISOString()
  });
});

// Ultra-simple test endpoint (minimal response)
app.get('/api/test', (req, res) => {
  res.json({ ok: true });
});

// Public endpoint to get all users (no auth required)
app.get('/api/public/users', async (req, res) => {
  try {
    console.log('📊 Fetching all users from database...');
    const [users] = await db.execute('SELECT id, username, email, phone, is_active, created_at FROM users ORDER BY id');
    console.log(`✅ Retrieved ${users.length} users`);
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      count: 0,
      data: []
    });
  }
});

// Simple status endpoint (no database required)
app.get('/api/status', (req, res) => {
  try {
    res.json({
      success: true,
      status: 'Backend is running',
      environment: process.env.NODE_ENV,
      port: process.env.PORT,
      jwtConfigured: !!process.env.JWT_SECRET,
      dbConfigured: !!process.env.DB_HOST,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Configuration check endpoint - shows what's configured
app.get('/api/config-check', (req, res) => {
  console.log('🔍 Config check requested...');
  try {
    const jwtSecret = process.env.JWT_SECRET || '';
    const dbHost = process.env.DB_HOST || '';
    const dbUser = process.env.DB_USER || '';
    const dbName = process.env.DB_NAME || '';
    
    let jwtSecretHash = 'NOT_CONFIGURED';
    if (jwtSecret) {
      try {
        jwtSecretHash = crypto.createHash('sha256').update(jwtSecret).digest('hex').substring(0, 16);
      } catch (e) {
        jwtSecretHash = 'ERROR_HASHING';
      }
    }
    
    const response = {
      success: true,
      config: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        jwtSecretConfigured: !!jwtSecret,
        jwtSecretLength: jwtSecret ? jwtSecret.length : 0,
        jwtSecretHash: jwtSecretHash,
        dbHostConfigured: !!dbHost,
        dbHost: dbHost || 'NOT_CONFIGURED',
        dbUserConfigured: !!dbUser,
        dbNameConfigured: !!dbName,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('✅ Config check response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ Config check error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.name
    });
  }
});

// Public endpoint for all cars (no auth required)
app.get('/api/public/cars', async (req, res) => {
  try {
    console.log('📊 Fetching all cars from database...');
    const [cars] = await db.execute('SELECT * FROM cars ORDER BY id');
    console.log(`✅ Retrieved ${cars.length} cars`);
    res.json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    console.error('❌ Error fetching cars:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      count: 0,
      data: []
    });
  }
});

// Public endpoint for all bookings/test drives (no auth required)
app.get('/api/public/bookings', async (req, res) => {
  try {
    console.log('📊 Fetching all bookings from database...');
    const [bookings] = await db.execute('SELECT * FROM bookings ORDER BY id DESC');
    console.log(`✅ Retrieved ${bookings.length} bookings`);
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      count: 0,
      data: []
    });
  }
});

// Public endpoint for stats/analytics (no auth required)
app.get('/api/public/stats', async (req, res) => {
  try {
    console.log('📊 Fetching statistics...');
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [carCount] = await db.execute('SELECT COUNT(*) as count FROM cars');
    const [bookingCount] = await db.execute('SELECT COUNT(*) as count FROM bookings');
    const [availableCars] = await db.execute("SELECT COUNT(*) as count FROM cars WHERE status = 'available'");
    
    res.json({
      success: true,
      stats: {
        totalUsers: userCount[0].count,
        totalCars: carCount[0].count,
        totalBookings: bookingCount[0].count,
        availableCars: availableCars[0].count,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Routes - Register AFTER custom endpoints
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/messages', messagesRoutes);

// Diagnostics endpoint - check admin user and JWT config
app.get('/api/diagnostics', async (req, res) => {
  try {
    console.log('📋 Diagnostics requested...');
    console.log('   JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('   DB_HOST:', process.env.DB_HOST);
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    
    // Check if admin user exists
    const [adminUsers] = await db.execute('SELECT id, username, email FROM users WHERE username = ?', ['admin']);
    const adminExists = adminUsers.length > 0;
    
    // Check if JWT_SECRET is set
    const jwtSecretSet = !!process.env.JWT_SECRET;
    const jwtSecretLength = process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0;
    
    // Count total users
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = userCount[0].count;
    
    // Count total cars
    const [carCount] = await db.execute('SELECT COUNT(*) as count FROM cars');
    const totalCars = carCount[0].count;
    
    console.log('✅ Diagnostics successful');
    
    res.json({
      success: true,
      diagnostics: {
        adminUserExists: adminExists,
        adminId: adminUsers[0]?.id || null,
        totalUsers,
        totalCars,
        jwtSecretConfigured: jwtSecretSet,
        jwtSecretLength,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Diagnostics error:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Diagnostics check failed',
      error: error.message,
      errorType: error.name,
      hint: error.message.includes('ENOTFOUND') ? 'Database connection failed' : 'Database query error'
    });
  }
});

// Admin login endpoint (explicit for debugging)
app.post('/api/admin-login', async (req, res) => {
  try {
    console.log('🔐 Admin login attempt...');
    const { username, password } = req.body;
    
    if (username !== 'admin' || password !== 'admin123') {
      console.log('❌ Invalid admin credentials');
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    
    // Find admin user
    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      console.log('❌ Admin user not found in database');
      return res.status(401).json({ success: false, message: 'Admin user not found' });
    }
    
    const adminUser = users[0];
    
    // Verify password with bcrypt
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    
    if (!isPasswordValid) {
      console.log('❌ Admin password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    // Generate token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: adminUser.id, username: adminUser.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Admin login successful, token generated');
    
    const { password: _, ...userWithoutPassword } = adminUser;
    
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('❌ Admin login error:', error.message);
    console.error('   Error type:', error.name);
    res.status(500).json({ 
      success: false, 
      message: 'Admin login failed',
      error: error.message,
      errorType: error.name
    });
  }
});

// Test token verification endpoint
app.post('/api/verify-token', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
        test: 'Token provided in request body: false'
      });
    }
    
    console.log('🔐 Testing token verification...');
    console.log('   Token length:', token.length);
    console.log('   Token preview:', token.substring(0, 30) + '...');
    console.log('   JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('   JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
    
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured!');
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET not configured on server',
        error: 'Missing JWT_SECRET environment variable'
      });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('✅ Token is valid:', decoded);
    
    res.json({
      success: true,
      message: 'Token is valid',
      decoded: decoded,
      expiresAt: new Date(decoded.exp * 1000)
    });
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    res.status(401).json({
      success: false,
      message: 'Token verification failed',
      error: error.name,
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - serve home.html for any unknown routes (SPA fallback)
app.use('*', (req, res) => {
  // If request has a file extension, return 404
  if (req.path.includes('.')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  
  // For root path, serve home.html directly
  if (req.path === '/') {
    return res.sendFile(path.join(__dirname, '..', 'home.html'), (homeErr) => {
      if (homeErr) {
        res.status(404).json({ error: 'home.html not found' });
      }
    });
  }
  
  // For other paths without extension, try to serve as HTML file with .html extension
  const htmlPath = path.join(__dirname, '..', req.path + '.html');
  res.sendFile(htmlPath, (err) => {
    if (err) {
      // If that fails, serve home.html as fallback
      res.sendFile(path.join(__dirname, '..', 'home.html'), (homeErr) => {
        if (homeErr) {
          res.status(404).json({ error: 'Route not found' });
        }
      });
    }
  });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all interfaces

// Start initialization and seeding, THEN start server
(async () => {
  try {
    console.log('⏳ Starting initialization...');
    await initializeDatabase();
    await seedTestData();
    
    // NOW start the server after initialization is complete
    app.listen(PORT, HOST, () => {
      console.log(`\n✅ RideBazzar Server running on port ${PORT}`);
      console.log(`📡 API URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Server bound to: ${HOST}:${PORT}\n`);
    });
  } catch (err) {
    console.error('❌ Setup error - Server failed to start:', err);
    process.exit(1);
  }
})();

module.exports = app;
