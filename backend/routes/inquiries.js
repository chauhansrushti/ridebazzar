const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// DEBUG: Check inquiries table
router.get('/debug/check-table', async (req, res) => {
  try {
    const [tables] = await db.execute("SHOW TABLES LIKE 'inquiries'");
    
    if (tables.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Inquiries table does not exist!',
        tables
      });
    }

    const [columns] = await db.execute('SHOW COLUMNS FROM inquiries');
    
    res.json({
      success: true,
      message: 'Inquiries table exists',
      columns: columns.map(c => ({ field: c.Field, type: c.Type }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DEBUG: Fix inquiries table - recreate with correct schema
router.post('/debug/fix-table', async (req, res) => {
  try {
    console.log('🔧 Fixing inquiries table schema...');
    
    // Drop existing table if it exists
    try {
      await db.execute('DROP TABLE IF EXISTS inquiries;');
      console.log('   ✅ Dropped old inquiries table');
    } catch (e) {
      console.log('   ℹ️ No old table to drop');
    }

    // Create inquiries table with correct schema
    const createTableSQL = `CREATE TABLE IF NOT EXISTS inquiries (
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
    );`;

    await db.execute(createTableSQL);
    console.log('   ✅ Created new inquiries table with correct schema');

    // Verify columns
    const [columns] = await db.execute('SHOW COLUMNS FROM inquiries');
    const columnNames = columns.map(c => c.Field);
    console.log('   ✅ Columns:', columnNames.join(', '));

    res.json({
      success: true,
      message: 'Inquiries table fixed successfully!',
      columns: columns.map(c => ({ field: c.Field, type: c.Type }))
    });
  } catch (error) {
    console.error('❌ Error fixing table:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix inquiries table',
      error: error.message
    });
  }
});

// Submit an inquiry for a car
router.post('/submit', auth, async (req, res) => {
  try {
    const { carId, message, phone } = req.body;
    const userId = req.user.userId;
    const username = req.user.username;

    console.log('Inquiry submission received:', { userId, username, carId, message, phone });
    console.log('Request user:', req.user);

    // Validate required fields
    if (!carId || !message || !phone) {
      console.log('Missing required fields:', { carId, message, phone });
      return res.status(400).json({
        success: false,
        message: 'Car ID, message, and phone are required',
        receivedFields: { carId, message, phone }
      });
    }

    // Validate user authentication
    if (!userId) {
      console.log('User ID missing from token');
      return res.status(400).json({
        success: false,
        message: 'User ID not found in token'
      });
    }

    // Check if car exists
    console.log('Checking if car exists with ID:', carId);
    const [cars] = await db.execute('SELECT id, seller_id FROM cars WHERE id = ?', [carId]);
    
    if (cars.length === 0) {
      console.log('Car not found with ID:', carId);
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    const car = cars[0];
    console.log('Car found:', car);

    // Check if user is not the seller
    if (car.seller_id === userId) {
      console.log('User is the seller of this car');
      return res.status(400).json({
        success: false,
        message: 'You cannot inquire about your own car'
      });
    }

    // Create inquiry
    console.log('Creating inquiry:', { carId, userId, seller_id: car.seller_id, message, phone });
    
    let result;
    try {
      [result] = await db.execute(
        `INSERT INTO inquiries (car_id, buyer_id, seller_id, message, phone, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [carId, userId, car.seller_id, message, phone, 'pending']
      );
    } catch (dbError) {
      console.error('❌ Database insert error:', dbError);
      console.error('Error code:', dbError.code);
      console.error('Error message:', dbError.message);
      
      // Check if table exists
      try {
        const [tables] = await db.execute("SHOW TABLES LIKE 'inquiries'");
        console.log('Inquiries table exists:', tables.length > 0);
      } catch (e) {
        console.error('Could not check table:', e.message);
      }
      
      throw dbError;
    }

    console.log('Inquiry created successfully:', { inquiryId: result.insertId });

    // Try to increment car inquiry count (if column exists)
    try {
      await db.execute('UPDATE cars SET inquiries = inquiries + 1 WHERE id = ?', [carId]);
    } catch (e) {
      console.warn('Could not update inquiry count (column might not exist):', e.message);
    }

    // Return success
    res.json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: {
        inquiryId: result.insertId,
        carId,
        message,
        phone,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error submitting inquiry:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry',
      error: error.message,
      errorStack: error.stack
    });
  }
});

// Get inquiries received (as seller)
router.get('/received', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [inquiries] = await db.execute(
      `SELECT i.*, c.make, c.model, c.year, c.price,
              u.username as buyer_username, u.email as buyer_email
       FROM inquiries i
       JOIN cars c ON i.car_id = c.id
       JOIN users u ON i.buyer_id = u.id
       WHERE i.seller_id = ?
       ORDER BY i.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('Error fetching received inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
});

// Get inquiries sent (as buyer)
router.get('/sent', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [inquiries] = await db.execute(
      `SELECT i.*, c.make, c.model, c.year, c.price,
              u.username as seller_username, u.email as seller_email
       FROM inquiries i
       JOIN cars c ON i.car_id = c.id
       JOIN users u ON i.seller_id = u.id
       WHERE i.buyer_id = ?
       ORDER BY i.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('Error fetching sent inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
});

// Get single inquiry
router.get('/:inquiryId', auth, async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const userId = req.user.userId;

    const [inquiries] = await db.execute(
      `SELECT i.*, c.make, c.model, c.year, c.price
       FROM inquiries i
       JOIN cars c ON i.car_id = c.id
       WHERE i.id = ? AND (i.buyer_id = ? OR i.seller_id = ?)`,
      [inquiryId, userId, userId]
    );

    if (inquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: inquiries[0]
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry',
      error: error.message
    });
  }
});

// Update inquiry status
router.put('/:inquiryId/status', auth, async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { status, response } = req.body;
    const userId = req.user.userId;

    const validStatuses = ['pending', 'responded', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if user is the seller (can respond to inquiries)
    const [inquiries] = await db.execute(
      'SELECT * FROM inquiries WHERE id = ? AND seller_id = ?',
      [inquiryId, userId]
    );

    if (inquiries.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this inquiry'
      });
    }

    // Update inquiry
    await db.execute(
      'UPDATE inquiries SET status = ?, response = ?, updated_at = NOW() WHERE id = ?',
      [status, response || null, inquiryId]
    );

    res.json({
      success: true,
      message: 'Inquiry updated successfully'
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry',
      error: error.message
    });
  }
});

// Cancel inquiry (delete)
router.delete('/:inquiryId', auth, async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const userId = req.user.userId;

    console.log('Attempting to cancel inquiry:', { inquiryId, userId });

    // Check if user is the buyer (can cancel inquiries they sent)
    const [inquiries] = await db.execute(
      'SELECT car_id FROM inquiries WHERE id = ? AND buyer_id = ?',
      [inquiryId, userId]
    );

    console.log('Query result:', { inquiriesFound: inquiries.length, inquiries });

    if (inquiries.length === 0) {
      console.log('Inquiry not found or user is not the buyer');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this inquiry'
      });
    }

    const carId = inquiries[0].car_id;

    // Delete the inquiry
    const [deleteResult] = await db.execute('DELETE FROM inquiries WHERE id = ?', [inquiryId]);
    console.log('Delete result:', deleteResult);

    // Decrement car inquiry count
    await db.execute('UPDATE cars SET inquiries = GREATEST(0, inquiries - 1) WHERE id = ?', [carId]);

    console.log('Inquiry cancelled successfully:', { inquiryId, carId });

    res.json({
      success: true,
      message: 'Inquiry cancelled successfully'
    });
  } catch (error) {
    console.error('❌ Error canceling inquiry:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel inquiry',
      error: error.message,
      errorStack: error.stack
    });
  }
});

module.exports = router;
