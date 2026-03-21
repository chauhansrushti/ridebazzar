const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');

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
                message: 'Server configuration error' 
            });
        }

        // Verify token
        console.log('🔐 Verifying token:', token.substring(0, 20) + '...');
        const decoded = jwt.verify(token, jwtSecret);
        console.log('✅ Token verified successfully:', decoded);
        req.user = decoded;
        next();

    } catch (error) {
        console.error('❌ Auth error:', error.message);
        console.error('   Error name:', error.name);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            console.error('   JWT Error details:', error);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        } else {
            return res.status(401).json({ 
                success: false, 
                message: 'Token verification failed: ' + error.message 
            });
        }
    }
};

module.exports = auth;
