const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        console.log('🔍 Auth middleware checking token...');
        console.log('   Auth header exists:', !!authHeader);
        console.log('   Auth header value:', authHeader?.substring(0, 30) + '...' || 'NO HEADER');

        if (!token) {
            console.warn('🚫 No token provided in Authorization header');
            console.warn('   Headers:', Object.keys(req.headers));
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }

        // Debug: Check JWT_SECRET
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('🚫 JWT_SECRET not configured in environment');
            return res.status(500).json({ 
                success: false, 
                message: 'Server configuration error: JWT_SECRET missing' 
            });
        }

        console.log('   Token length:', token.length);
        console.log('   JWT_SECRET length:', jwtSecret.length);
        console.log('   Token preview:', token.substring(0, 20) + '...');

        // Verify token
        console.log('🔐 Verifying token with JWT_SECRET...');
        const decoded = jwt.verify(token, jwtSecret);
        console.log('✅ Token verified successfully for user:', decoded.username);
        req.user = decoded;
        next();

    } catch (error) {
        console.error('❌ Auth error:', error.message);
        console.error('   Error name:', error.name);
        
        if (error.name === 'TokenExpiredError') {
            console.warn('   Token expired at:', error.expiredAt);
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired',
                expiresAt: error.expiredAt
            });
        } else if (error.name === 'JsonWebTokenError') {
            console.error('   JWT parsing failed:', error.message);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token format',
                error: error.message 
            });
        } else {
            console.error('   Unexpected error:', error.message);
            return res.status(401).json({ 
                success: false, 
                message: 'Token verification failed',
                error: error.message
            });
        }
    }
};

module.exports = auth;
