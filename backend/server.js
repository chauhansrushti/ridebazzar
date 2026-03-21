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

const app = express();

// Initialize database on startup
const initializeDatabase = async () => {
  try {
    console.log('🔄 Checking database...');
    
    // Check if users table exists
    const [tables] = await db.execute("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      console.log('📋 Creating database tables from schema...');
      
      const schemaPath = path.join(__dirname, 'database', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => {
          // Remove empty, comment lines, USE statements, and CREATE DATABASE statements
          const isValid = stmt && 
                         !stmt.startsWith('--') && 
                         !stmt.toUpperCase().startsWith('USE ') &&
                         !stmt.toUpperCase().startsWith('CREATE DATABASE');
          return isValid;
        });
      
      for (const statement of statements) {
        if (statement) {
          try {
            await db.execute(statement);
          } catch (err) {
            // Log but continue with other statements
            console.warn(`⚠️ Statement skipped: ${err.message.substring(0, 80)}`);
          }
        }
      }
      
      console.log('✅ Database tables created successfully');
    } else {
      console.log('✅ Database tables already exist');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Error details:', error);
    // Don't exit, let the app continue
  }
};

// Seed test data if database is empty
const seedTestData = async () => {
  try {
    const [cars] = await db.execute('SELECT COUNT(*) as count FROM cars');
    
    if (cars[0].count > 0) {
      console.log(`✅ Database already has ${cars[0].count} cars`);
      return; // Data already exists
    }

    console.log('📊 Seeding test data...');
    
    // Check if admin user exists
    const [adminUsers] = await db.execute('SELECT id FROM users WHERE username = ?', ['admin']);
    let adminId = 1;
    
    if (adminUsers.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const [result] = await db.execute(
        'INSERT INTO users (username, email, password, full_name, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', 'admin@ridebazzar.com', hashedPassword, 'Admin User', true, true]
      );
      adminId = result.insertId;
      console.log('  ✓ Admin user created');
    } else {
      adminId = adminUsers[0].id;
    }

    // Insert test cars
    const testCars = [
      { make: 'Maruti', model: 'Swift', year: 2022, price: 650000, status: 'available', description: 'Well maintained Swift' },
      { make: 'Hyundai', model: 'Creta', year: 2021, price: 1200000, status: 'sold', description: 'Excellent Creta with low mileage' },
      { make: 'Honda', model: 'City', year: 2023, price: 1100000, status: 'available', description: 'Brand new Honda City' },
      { make: 'Tata', model: 'Nexon', year: 2020, price: 950000, status: 'available', description: 'Reliable Nexon' },
      { make: 'Mahindra', model: 'XUV700', year: 2022, price: 1700000, status: 'sold', description: 'Premium XUV700' },
    ];

    const carIds = [];
    for (const car of testCars) {
      const [result] = await db.execute(
        'INSERT INTO cars (make, model, year, price, status, seller_id, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [car.make, car.model, car.year, car.price, car.status, adminId, car.description]
      );
      carIds.push(result.insertId);
      console.log(`  ✓ Added ${car.make} ${car.model}`);
    }

    // Add test bookings
    if (carIds.length >= 2) {
      await db.execute(
        'INSERT INTO bookings (car_id, buyer_id, seller_id, booking_amount, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [carIds[1], adminId, adminId, 100000, testCars[1].price, 'confirmed']
      );
      console.log('  ✓ Booking 1 created');

      if (carIds.length >= 5) {
        await db.execute(
          'INSERT INTO bookings (car_id, buyer_id, seller_id, booking_amount, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [carIds[4], adminId, adminId, 100000, testCars[4].price, 'confirmed']
        );
        console.log('  ✓ Booking 2 created');
      }
    }

    console.log('✅ Test data seeded successfully\n');

  } catch (error) {
    console.warn('⚠️  Could not seed test data:', error.message);
  }
};

// Initialize database before starting server
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/messages', messagesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RideBazzar API is running',
    timestamp: new Date().toISOString()
  });
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

// Start initialization and seeding
(async () => {
  try {
    await initializeDatabase();
    await seedTestData();
  } catch (err) {
    console.error('Setup error:', err);
  }
})();

app.listen(PORT, HOST, () => {
  console.log(`🚗 RideBazzar Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Server bound to: ${HOST}:${PORT}`);
});

module.exports = app;
