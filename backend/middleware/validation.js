// Validation middleware for request validation
const { body, validationResult } = require('express-validator');
const { sendValidationError } = require('../utils/helpers');

// Handle validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendValidationError(res, errors.array());
    }
    next();
};

// User registration validation
const validateRegister = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('fullName')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    
    body('phone')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid Indian phone number'),
    
    handleValidationErrors
];

// User login validation
const validateLogin = [
    body('username')
        .notEmpty()
        .withMessage('Username or email is required'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

// Car creation validation
const validateCar = [
    body('make')
        .notEmpty()
        .withMessage('Car make is required')
        .isLength({ max: 50 })
        .withMessage('Car make must not exceed 50 characters'),
    
    body('model')
        .notEmpty()
        .withMessage('Car model is required')
        .isLength({ max: 50 })
        .withMessage('Car model must not exceed 50 characters'),
    
    body('year')
        .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
        .withMessage(`Year must be between 1950 and ${new Date().getFullYear() + 1}`),
    
    body('price')
        .isFloat({ min: 1000, max: 50000000 })
        .withMessage('Price must be between ₹1,000 and ₹5,00,00,000'),
    
    body('mileage')
        .optional()
        .isInt({ min: 0, max: 1000000 })
        .withMessage('Mileage must be between 0 and 10,00,000 km'),
    
    body('fuelType')
        .isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'])
        .withMessage('Invalid fuel type'),
    
    body('transmission')
        .isIn(['Manual', 'Automatic'])
        .withMessage('Transmission must be Manual or Automatic'),
    
    body('conditionStatus')
        .isIn(['Excellent', 'Good', 'Fair', 'Poor'])
        .withMessage('Invalid condition status'),
    
    body('color')
        .optional()
        .isLength({ max: 30 })
        .withMessage('Color name must not exceed 30 characters'),
    
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    
    body('contact')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid Indian phone number'),
    
    body('location')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Location must not exceed 100 characters'),
    
    handleValidationErrors
];

// Booking validation
const validateBooking = [
    body('carId')
        .isInt({ min: 1 })
        .withMessage('Valid car ID is required'),
    
    body('bookingAmount')
        .isFloat({ min: 100, max: 1000000 })
        .withMessage('Booking amount must be between ₹100 and ₹10,00,000'),
    
    body('totalAmount')
        .isFloat({ min: 1000, max: 50000000 })
        .withMessage('Total amount must be between ₹1,000 and ₹5,00,00,000'),
    
    body('inspectionDate')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid inspection date'),
    
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes must not exceed 500 characters'),
    
    handleValidationErrors
];

// Payment validation
const validatePayment = [
    body('bookingId')
        .isInt({ min: 1 })
        .withMessage('Valid booking ID is required'),
    
    body('amount')
        .isFloat({ min: 100, max: 1000000 })
        .withMessage('Payment amount must be between ₹100 and ₹10,00,000'),
    
    body('paymentMethod')
        .isIn(['card', 'upi', 'netbanking', 'wallet'])
        .withMessage('Invalid payment method'),
    
    body('paymentDetails')
        .optional()
        .isObject()
        .withMessage('Payment details must be an object'),
    
    handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
    body('fullName')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    
    body('phone')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid Indian phone number'),
    
    body('location')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Location must not exceed 100 characters'),
    
    body('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio must not exceed 500 characters'),
    
    handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateCar,
    validateBooking,
    validatePayment,
    validateProfileUpdate,
    validatePasswordChange,
    handleValidationErrors
};
