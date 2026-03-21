const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all messages for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationWith } = req.query;

        let query = `
            SELECT m.*, 
                   u1.username as sender_username,
                   u2.username as receiver_username,
                   c.make, c.model
            FROM messages m
            LEFT JOIN users u1 ON m.sender_id = u1.id
            LEFT JOIN users u2 ON m.receiver_id = u2.id
            LEFT JOIN cars c ON m.car_id = c.id
            WHERE (m.sender_id = ? OR m.receiver_id = ?)`;
        
        let params = [userId, userId];

        if (conversationWith) {
            query += ' AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))';
            params.push(userId, parseInt(conversationWith), parseInt(conversationWith), userId);
        }

        query += ' ORDER BY m.created_at DESC';

        const [messages] = await db.execute(query, params);
        res.json({ success: true, messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send a message
router.post('/', auth, async (req, res) => {
    try {
        const { receiver_id, car_id, subject, message } = req.body;
        const sender_id = req.user.id;

        if (!receiver_id || !message) {
            return res.status(400).json({ success: false, error: 'Receiver ID and message are required' });
        }

        const query = `
            INSERT INTO messages (sender_id, receiver_id, car_id, subject, message, is_read)
            VALUES (?, ?, ?, ?, ?, 0)
        `;

        const [result] = await db.execute(query, [
            sender_id,
            receiver_id,
            car_id || null,
            subject || null,
            message
        ]);

        res.json({ 
            success: true, 
            message_id: result.insertId,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mark message as read
router.put('/:messageId/read', auth, async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const userId = req.user.id;

        const query = `
            UPDATE messages 
            SET is_read = 1
            WHERE id = ? AND receiver_id = ?
        `;

        await db.execute(query, [messageId, userId]);
        res.json({ success: true, message: 'Message marked as read' });
    } catch (error) {
        console.error('Mark message as read error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get conversation with a specific user
router.get('/conversation/:userId', auth, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = parseInt(req.params.userId);

        const query = `
            SELECT m.*, 
                   u1.username as sender_username,
                   u2.username as receiver_username,
                   c.make, c.model
            FROM messages m
            LEFT JOIN users u1 ON m.sender_id = u1.id
            LEFT JOIN users u2 ON m.receiver_id = u2.id
            LEFT JOIN cars c ON m.car_id = c.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `;

        const [messages] = await db.execute(query, [
            currentUserId, otherUserId,
            otherUserId, currentUserId
        ]);

        res.json({ success: true, messages });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
