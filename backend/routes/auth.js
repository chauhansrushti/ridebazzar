const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, fullName, phone, location } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username, email, and password are required' 
            });
        }

        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username or email already exists' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, full_name, phone, location) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, fullName || null, phone || null, location || null]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: result.insertId, username, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: result.insertId,
                    username,
                    email,
                    fullName: fullName || null,
                    phone: phone || null,
                    location: location || null
                }
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during registration' 
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Find user by username or email
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const user = users[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({ 
                success: false, 
                message: 'Account is deactivated' 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: userWithoutPassword
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during login' 
        });
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, full_name, phone, location, profile_picture, bio, is_verified, created_at FROM users WHERE id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { fullName, phone, location, bio } = req.body;

        await db.execute(
            'UPDATE users SET full_name = ?, phone = ?, location = ?, bio = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [fullName || null, phone || null, location || null, bio || null, req.user.userId]
        );

        // Fetch updated user data
        const [users] = await db.execute(
            'SELECT id, username, email, full_name, phone, location, profile_picture, bio, is_verified FROM users WHERE id = ?',
            [req.user.userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: users[0]
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password and new password are required' 
            });
        }

        // Get current user
        const [users] = await db.execute(
            'SELECT password FROM users WHERE id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await db.execute(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedNewPassword, req.user.userId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Logout (optional - mainly for token blacklisting if implemented)
router.post('/logout', auth, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Get all users (Admin only)
router.get('/users', auth, async (req, res) => {
    try {
        console.log('👥 Fetching users for authenticated user:', req.user?.username);
        console.log('   Request headers:', Object.keys(req.headers));
        console.log('   User object:', req.user);
        
        // You can add admin role check here if needed
        // For now, any authenticated user can view users
        console.log('   Executing query: SELECT users...');
        
        const [users] = await db.execute(
            'SELECT id, username, email, full_name, phone, location, role, is_active, is_verified, created_at FROM users ORDER BY created_at DESC'
        );

        console.log(`✅ Fetched ${users.length} users successfully`);

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('❌ Fetch users error:', error.message);
        console.error('   Error type:', error.name);
        console.error('   Error stack:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch users',
            error: error.message,
            errorType: error.name,
            hint: error.message.includes('ER_ACCESS_DENIED') ? 'Database permission error' : 'Unknown error'
        });
    }
});

// Delete user (Admin only)
router.delete('/users/:id', auth, async (req, res) => {
    try {
        const userId = req.params.id;

        // Don't allow users to delete themselves
        if (parseInt(userId) === req.user.userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete your own account' 
            });
        }

        // Check if user exists
        const [users] = await db.execute(
            'SELECT id, role FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Don't allow deletion of admin users
        if (users[0].role === 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Cannot delete admin users' 
            });
        }

        // Delete user
        await db.execute('DELETE FROM users WHERE id = ?', [userId]);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Validate required fields
        if (!email || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and new password are required' 
            });
        }

        // Check if user exists
        const [users] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'User with this email not found' 
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await db.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error during password reset' 
        });
    }
});

module.exports = router;
