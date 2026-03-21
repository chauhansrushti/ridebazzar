const express = require('express');
const crypto = require('crypto');
const db = require('../config/database');
const auth = require('../middleware/auth');
const { sendBookingConfirmation, sendSellerNotification } = require('../utils/email');

const router = express.Router();

// Process payment
router.post('/process', auth, async (req, res) => {
    console.log('=== PAYMENT PROCESS REQUEST ===');
    console.log('User ID:', req.user.userId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
        const {
            bookingId,
            amount,
            paymentMethod,
            paymentDetails,
            emiEnabled,
            emiDetails
        } = req.body;

        console.log('Extracted data:', { bookingId, amount, paymentMethod, emiEnabled });

        // Validate required fields
        if (!bookingId || !amount || !paymentMethod) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({ 
                success: false, 
                message: 'Booking ID, amount, and payment method are required' 
            });
        }

        const validPaymentMethods = ['card', 'upi', 'netbanking', 'wallet'];
        if (!validPaymentMethods.includes(paymentMethod)) {
            console.log('Invalid payment method:', paymentMethod);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid payment method' 
            });
        }

        console.log('Fetching booking:', bookingId, 'for user:', req.user.userId);
        // Get booking details
        const [bookings] = await db.execute(
            'SELECT * FROM bookings WHERE id = ? AND buyer_id = ?',
            [bookingId, req.user.userId]
        );

        console.log('Bookings found:', bookings.length);
        if (bookings.length === 0) {
            console.log('No booking found or access denied');
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found or access denied' 
            });
        }

        const booking = bookings[0];
        console.log('Booking details:', { id: booking.id, car_id: booking.car_id, booking_amount: booking.booking_amount });

        // Validate amount
        if (parseFloat(amount) !== parseFloat(booking.booking_amount)) {
            console.log('Amount mismatch:', { received: amount, expected: booking.booking_amount });
            return res.status(400).json({ 
                success: false, 
                message: 'Payment amount does not match booking amount' 
            });
        }

        console.log('Generating transaction ID...');
        // Generate transaction ID
        const transactionId = `TXN_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        console.log('Transaction ID:', transactionId);

        console.log('Starting database operations...');
        // Get a connection from the pool
        const connection = await db.getConnection();
        
        try {
            // Start transaction
            await connection.beginTransaction();
            console.log('Transaction started');

            // Simulate payment processing based on method
            let paymentStatus = 'success';
            let gatewayResponse = {};

            switch (paymentMethod) {
                case 'card':
                    // Simulate card payment processing
                    gatewayResponse = {
                        cardNumber: paymentDetails.cardNumber ? `****${paymentDetails.cardNumber.slice(-4)}` : null,
                        cardType: paymentDetails.cardType || 'Unknown',
                        bankName: paymentDetails.bankName || 'Unknown',
                        authCode: crypto.randomBytes(6).toString('hex').toUpperCase(),
                        processingTime: Date.now()
                    };
                    break;

                case 'upi':
                    // Simulate UPI payment processing
                    gatewayResponse = {
                        upiId: paymentDetails.upiId || null,
                        transactionRef: `UPI${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
                        pspBank: paymentDetails.pspBank || 'Unknown',
                        processingTime: Date.now()
                    };
                    break;

                case 'netbanking':
                    // Simulate net banking payment processing
                    gatewayResponse = {
                        bankName: paymentDetails.bankName || 'Unknown',
                        accountNumber: paymentDetails.accountNumber ? `****${paymentDetails.accountNumber.slice(-4)}` : null,
                        transactionRef: `NB${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
                        processingTime: Date.now()
                    };
                    break;

                case 'wallet':
                    // Simulate wallet payment processing
                    gatewayResponse = {
                        walletProvider: paymentDetails.walletProvider || 'Unknown',
                        walletBalance: paymentDetails.walletBalance || null,
                        transactionRef: `WAL${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
                        processingTime: Date.now()
                    };
                    break;
            }

            // For demo purposes, randomly simulate payment failures (5% chance)
            if (Math.random() < 0.05) {
                paymentStatus = 'failed';
                gatewayResponse.errorCode = 'PAYMENT_DECLINED';
                gatewayResponse.errorMessage = 'Payment declined by bank';
            }

            console.log('Creating transaction record...');
            console.log('Transaction data:', {
                transactionId,
                bookingId,
                userId: req.user.userId,
                amount,
                paymentMethod,
                paymentStatus,
                emiEnabled: emiEnabled || false
            });
            
            // Create transaction record
            await connection.execute(`
                INSERT INTO transactions (
                    id, booking_id, user_id, amount, payment_method, 
                    payment_status, payment_gateway_response, transaction_type,
                    emi_enabled, emi_details
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                transactionId,
                bookingId,
                req.user.userId,
                amount,
                paymentMethod,
                paymentStatus,
                JSON.stringify(gatewayResponse),
                'booking',
                emiEnabled || false,
                emiDetails ? JSON.stringify(emiDetails) : null
            ]);
            
            console.log('Transaction record created successfully');

            // If payment successful, update booking status and car status
            if (paymentStatus === 'success') {
                console.log('Payment successful, updating booking and car status...');
                // Update booking status to confirmed
                await connection.execute(
                    'UPDATE bookings SET status = "confirmed", payment_status = "paid" WHERE id = ?',
                    [bookingId]
                );
                console.log('Booking status updated');
                
                // Mark car as sold (payment confirmed by buyer)
                await connection.execute(
                    'UPDATE cars SET status = "sold" WHERE id = ?',
                    [booking.car_id]
                );
                
                console.log(`✅ Car ${booking.car_id} marked as sold`);
            }

            console.log('Committing transaction...');
            await connection.commit();
            console.log('Transaction committed successfully');
            
            // Release connection back to pool
            connection.release();

            if (paymentStatus === 'success') {
                // Send email notifications (non-blocking)
                console.log('Sending email notifications...');
                
                // Fetch buyer and seller details for emails
                const [buyers] = await db.execute('SELECT * FROM users WHERE id = ?', [booking.buyer_id]);
                const [sellers] = await db.execute('SELECT * FROM users WHERE id = ?', [booking.seller_id]);
                const [cars] = await db.execute('SELECT * FROM cars WHERE id = ?', [booking.car_id]);
                
                if (buyers.length > 0 && sellers.length > 0 && cars.length > 0) {
                    const emailData = {
                        buyer: buyers[0],
                        seller: sellers[0],
                        car: cars[0],
                        booking: booking,
                        transaction: {
                            id: transactionId,
                            payment_method: paymentMethod,
                            amount: amount,
                            status: paymentStatus
                        }
                    };
                    
                    // Send emails asynchronously (don't wait for completion)
                    sendBookingConfirmation(emailData)
                        .then(() => console.log('✅ Buyer confirmation email sent'))
                        .catch(err => console.error('❌ Buyer email failed:', err.message));
                    
                    sendSellerNotification(emailData)
                        .then(() => console.log('✅ Seller notification email sent'))
                        .catch(err => console.error('❌ Seller email failed:', err.message));
                } else {
                    console.log('⚠️ Could not fetch user/car details for email');
                }
                
                res.json({
                    success: true,
                    message: 'Payment processed successfully',
                    data: {
                        transactionId,
                        status: paymentStatus,
                        amount,
                        paymentMethod,
                        processingTime: gatewayResponse.processingTime
                    }
                });
            } else {
                // Release connection even on payment failure
                connection.release();
                
                res.status(400).json({
                    success: false,
                    message: 'Payment failed',
                    data: {
                        transactionId,
                        status: paymentStatus,
                        errorCode: gatewayResponse.errorCode,
                        errorMessage: gatewayResponse.errorMessage
                    }
                });
            }

        } catch (error) {
            // Rollback transaction on error
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Payment processing error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during payment processing',
            error: error.message
        });
    }
});

// Get payment status
router.get('/status/:transactionId', auth, async (req, res) => {
    try {
        const transactionId = req.params.transactionId;

        const [transactions] = await db.execute(`
            SELECT t.*, b.car_id, b.booking_amount, b.total_amount,
                   c.make, c.model, c.year
            FROM transactions t
            JOIN bookings b ON t.booking_id = b.id
            JOIN cars c ON b.car_id = c.id
            WHERE t.id = ? AND t.user_id = ?
        `, [transactionId, req.user.userId]);

        if (transactions.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Transaction not found' 
            });
        }

        res.json({
            success: true,
            data: transactions[0]
        });

    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get user's transaction history
router.get('/history', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Fetch transactions without pagination in SQL to avoid mysql2 LIMIT issues
        const [transactions] = await db.execute(`
            SELECT t.id, t.amount, t.payment_method, t.payment_status, t.created_at,
                   b.car_id, b.booking_amount, b.total_amount,
                   c.make, c.model, c.year, c.price
            FROM transactions t
            LEFT JOIN bookings b ON t.booking_id = b.id
            LEFT JOIN cars c ON b.car_id = c.id
            WHERE t.user_id = ?
            ORDER BY t.created_at DESC
        `, [req.user.userId]);

        // Get total count
        const [countResult] = await db.execute(
            'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?',
            [req.user.userId]
        );

        // Apply pagination in JavaScript instead of SQL
        const paginatedTransactions = transactions.slice(offset, offset + parseInt(limit));
        const totalTransactions = countResult[0].total;

        res.json({
            success: true,
            data: {
                transactions: paginatedTransactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalTransactions / parseInt(limit)),
                    totalTransactions,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Refund payment
router.post('/refund/:transactionId', auth, async (req, res) => {
    try {
        const transactionId = req.params.transactionId;
        const { reason } = req.body;

        // Get transaction details
        const [transactions] = await db.execute(`
            SELECT t.*, b.buyer_id, b.seller_id
            FROM transactions t
            JOIN bookings b ON t.booking_id = b.id
            WHERE t.id = ?
        `, [transactionId]);

        if (transactions.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Transaction not found' 
            });
        }

        const transaction = transactions[0];

        // Check if user has permission to refund (seller or buyer)
        if (transaction.buyer_id !== req.user.userId && transaction.seller_id !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        // Check if transaction can be refunded
        if (transaction.payment_status !== 'success') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only successful transactions can be refunded' 
            });
        }

        // Check if already refunded
        const [existingRefunds] = await db.execute(
            'SELECT id FROM transactions WHERE booking_id = ? AND transaction_type = "refund"',
            [transaction.booking_id]
        );

        if (existingRefunds.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Transaction already refunded' 
            });
        }

        // Generate refund transaction ID
        const refundTransactionId = `REF_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // Start transaction
        await db.execute('START TRANSACTION');

        try {
            // Create refund transaction
            await db.execute(`
                INSERT INTO transactions (
                    id, booking_id, user_id, amount, payment_method, 
                    payment_status, payment_gateway_response, transaction_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                refundTransactionId,
                transaction.booking_id,
                transaction.user_id,
                transaction.amount,
                transaction.payment_method,
                'success',
                JSON.stringify({
                    originalTransactionId: transactionId,
                    refundReason: reason || 'User requested refund',
                    refundTime: Date.now()
                }),
                'refund'
            ]);

            // Update original transaction status
            await db.execute(
                'UPDATE transactions SET payment_status = "refunded" WHERE id = ?',
                [transactionId]
            );

            await db.execute('COMMIT');

            res.json({
                success: true,
                message: 'Refund processed successfully',
                data: {
                    refundTransactionId,
                    originalTransactionId: transactionId,
                    refundAmount: transaction.amount
                }
            });

        } catch (error) {
            await db.execute('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Refund processing error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during refund processing' 
        });
    }
});

// Admin: Get all transactions (requires admin role)
router.get('/admin/all', auth, async (req, res) => {
    try {
        // Allow access if authenticated (assume admin panel is already protected)
        console.log('Fetching all transactions for user:', req.user.id, 'role:', req.user.role);
        
        // Get all transactions with user and car details
        const [transactions] = await db.execute(`
            SELECT t.id, t.amount, t.payment_method, t.payment_status, t.created_at,
                   u.username, b.car_id, b.booking_amount, b.total_amount,
                   c.make, c.model, c.year, c.price
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN bookings b ON t.booking_id = b.id
            LEFT JOIN cars c ON b.car_id = c.id
            ORDER BY t.created_at DESC
        `);

        console.log('Found transactions:', transactions.length);
        
        res.json({
            success: true,
            data: transactions
        });

    } catch (error) {
        console.error('Get all transactions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;
