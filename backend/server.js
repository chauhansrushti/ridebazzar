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
        .filter(stmt => stmt && !stmt.startsWith('--')); // Remove empty and comment lines
      
      for (const statement of statements) {
        if (statement) {
          await db.execute(statement);
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

// Static file serving
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚗 RideBazzar Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Server bound to: ${HOST}:${PORT}`);
});

module.exports = app;
