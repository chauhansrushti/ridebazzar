const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new booking
router.post('/', auth, async (req, res) => {
    try {
        const {
            carId,
            bookingAmount,
            totalAmount,
            inspectionDate,
            buyerInfo,
            notes
        } = req.body;

        // Validate required fields
        if (!carId || !bookingAmount || !totalAmount) {
            return res.status(400).json({ 
                success: false, 
                message: 'Car ID, booking amount, and total amount are required' 
            });
        }

        // Check if car exists and is available
        const [cars] = await db.execute(
            'SELECT id, seller_id, price, status FROM cars WHERE id = ?',
            [carId]
        );

        if (cars.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Car not found' 
            });
        }

        const car = cars[0];

        if (car.status !== 'available') {
            return res.status(400).json({ 
                success: false, 
                message: 'Car is not available for booking' 
            });
        }

        // Check if user is not trying to book their own car
        if (car.seller_id === req.user.userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'You cannot book your own car' 
            });
        }

        // Check if user already has a PAID/CONFIRMED booking for this car
        // Allow multiple pending bookings (user can retry payment)
        const [existingBookings] = await db.execute(
            'SELECT id FROM bookings WHERE car_id = ? AND buyer_id = ? AND payment_status = "paid"',
            [carId, req.user.userId]
        );

        if (existingBookings.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already purchased this car' 
            });
        }

        // Create booking
        const [result] = await db.execute(`
            INSERT INTO bookings (
                car_id, buyer_id, seller_id, booking_amount, total_amount, 
                inspection_date, buyer_info, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            carId,
            req.user.userId,
            car.seller_id,
            bookingAmount,
            totalAmount,
            inspectionDate || null,
            JSON.stringify(buyerInfo || {}),
            notes || null
        ]);

        // Note: Car status remains 'available' until final payment is completed
        // Status will be updated to 'sold' when payment is processed

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                bookingId: result.insertId
            }
        });

    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get all bookings (admin only)
router.get('/admin/all-bookings', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only admins can view all bookings' 
            });
        }

        const [bookings] = await db.execute(`
            SELECT 
                b.*,
                c.make,
                c.model,
                buyer.username as buyer_name,
                seller.username as seller_name
            FROM bookings b
            LEFT JOIN cars c ON b.car_id = c.id
            LEFT JOIN users buyer ON b.buyer_id = buyer.id
            LEFT JOIN users seller ON b.seller_id = seller.id
            ORDER BY b.created_at DESC
        `);

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get user's bookings (as buyer)
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const [bookings] = await db.execute(`
            SELECT 
                b.*,
                c.make, c.model, c.year, c.price, c.images, c.fuel_type, c.transmission, c.mileage, c.location as car_location,
                u.username as seller_username, u.full_name as seller_name, u.phone as seller_phone, u.email as seller_email
            FROM bookings b
            JOIN cars c ON b.car_id = c.id
            JOIN users u ON c.seller_id = u.id
            WHERE b.buyer_id = ?
            ORDER BY b.created_at DESC
        `, [req.user.userId]);

        console.log('My-bookings query result for buyer_id:', req.user.userId);
        console.log('Number of bookings found:', bookings.length);
        if (bookings.length > 0) {
            console.log('First booking fields:', Object.keys(bookings[0]));
            console.log('First booking sample:', bookings[0]);
        }

        res.json({
            success: true,
            bookings: bookings
        });

    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get bookings for user's cars (as seller)
router.get('/my-sales', auth, async (req, res) => {
    try {
        const [bookings] = await db.execute(`
            SELECT 
                b.*,
                c.make, c.model, c.year, c.price, c.images, c.fuel_type, c.transmission, c.mileage, c.location as car_location,
                u.username as buyer_username, u.full_name as buyer_name, u.phone as buyer_phone, u.email as buyer_email
            FROM bookings b
            JOIN cars c ON b.car_id = c.id
            JOIN users u ON b.buyer_id = u.id
            WHERE c.seller_id = ?
            ORDER BY b.created_at DESC
        `, [req.user.userId]);

        console.log('My-sales query result for seller_id:', req.user.userId);
        console.log('Number of bookings found:', bookings.length);
        if (bookings.length > 0) {
            console.log('First booking fields:', Object.keys(bookings[0]));
            console.log('First booking sample:', bookings[0]);
        }

        res.json({
            success: true,
            sales: bookings
        });

    } catch (error) {
        console.error('Get my sales error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get single booking details
router.get('/:id', auth, async (req, res) => {
    try {
        const bookingId = req.params.id;

        const [bookings] = await db.execute(`
            SELECT 
                b.*,
                c.make, c.model, c.year, c.price, c.images, c.location as car_location,
                c.description, c.fuel_type, c.transmission, c.mileage,
                seller.username as seller_username, seller.full_name as seller_name, 
                seller.phone as seller_phone, seller.email as seller_email,
                buyer.username as buyer_username, buyer.full_name as buyer_name, 
                buyer.phone as buyer_phone, buyer.email as buyer_email
            FROM bookings b
            JOIN cars c ON b.car_id = c.id
            JOIN users seller ON b.seller_id = seller.id
            JOIN users buyer ON b.buyer_id = buyer.id
            WHERE b.id = ? AND (b.buyer_id = ? OR b.seller_id = ?)
        `, [bookingId, req.user.userId, req.user.userId]);

        if (bookings.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found or access denied' 
            });
        }

        res.json({
            success: true,
            data: bookings[0]
        });

    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Update booking status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { status, cancellationReason } = req.body;

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid status' 
            });
        }

        // Get booking details
        const [bookings] = await db.execute(
            'SELECT * FROM bookings WHERE id = ?',
            [bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found' 
            });
        }

        const booking = bookings[0];

        // Check if user has permission to update this booking
        if (booking.buyer_id !== req.user.userId && booking.seller_id !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        // Start transaction
        await db.execute('START TRANSACTION');

        try {
            // Update booking status
            if (status === 'cancelled') {
                await db.execute(
                    'UPDATE bookings SET status = ?, cancellation_reason = ?, cancelled_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [status, cancellationReason || null, bookingId]
                );

                // Make car available again
                await db.execute(
                    'UPDATE cars SET status = "available" WHERE id = ?',
                    [booking.car_id]
                );
            } else {
                await db.execute(
                    'UPDATE bookings SET status = ? WHERE id = ?',
                    [status, bookingId]
                );

                // If completed, mark car as sold
                if (status === 'completed') {
                    await db.execute(
                        'UPDATE cars SET status = "sold" WHERE id = ?',
                        [booking.car_id]
                    );
                }
            }

            await db.execute('COMMIT');

            res.json({
                success: true,
                message: `Booking ${status} successfully`
            });

        } catch (error) {
            await db.execute('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { cancellationReason } = req.body;

        // Get booking details
        const [bookings] = await db.execute(
            'SELECT * FROM bookings WHERE id = ?',
            [bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found' 
            });
        }

        const booking = bookings[0];

        // Check if user has permission to cancel this booking
        if (booking.buyer_id !== req.user.userId && booking.seller_id !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        // Check if booking can be cancelled
        if (booking.status === 'completed') {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot cancel completed booking' 
            });
        }

        // Update booking status to cancelled
        await db.execute(
            'UPDATE bookings SET status = ?, cancellation_reason = ?, cancelled_at = NOW() WHERE id = ?',
            ['cancelled', cancellationReason || 'Cancelled by user', bookingId]
        );

        // Make car available again
        await db.execute(
            'UPDATE cars SET status = ? WHERE id = ?',
            ['available', booking.car_id]
        );

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;
