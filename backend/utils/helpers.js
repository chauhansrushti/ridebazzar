// API response helpers
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

const sendError = (res, message = 'Something went wrong', statusCode = 500, data = null) => {
    res.status(statusCode).json({
        success: false,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

const sendValidationError = (res, errors) => {
    res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString()
    });
};

// Validation helpers
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

const validatePassword = (password) => {
    // At least 6 characters
    return password && password.length >= 6;
};

// Pagination helpers
const getPagination = (page, limit) => {
    const currentPage = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 10;
    const offset = (currentPage - 1) * pageLimit;
    
    return {
        currentPage,
        limit: pageLimit,
        offset
    };
};

const getPaginationMeta = (currentPage, limit, totalItems) => {
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
        currentPage,
        totalPages,
        totalItems,
        limit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
    };
};

// Date helpers
const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// String helpers
const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// Price helpers
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(price);
};

const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number);
};

// Car helpers
const getCarDisplayName = (car) => {
    return `${car.year} ${car.make} ${car.model}`;
};

const getCarImageUrl = (images, index = 0) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
        return '/images/default-car.jpg';
    }
    return images[index] || images[0];
};

// Error helpers
const createError = (message, statusCode = 500, code = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// File upload helpers
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const isValidImageType = (mimetype) => {
    return allowedImageTypes.includes(mimetype);
};

const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
};

module.exports = {
    // Response helpers
    sendSuccess,
    sendError,
    sendValidationError,
    
    // Validation helpers
    validateEmail,
    validatePhone,
    validatePassword,
    
    // Pagination helpers
    getPagination,
    getPaginationMeta,
    
    // Date helpers
    formatDate,
    addDays,
    
    // String helpers
    generateRandomString,
    slugify,
    
    // Price helpers
    formatPrice,
    formatNumber,
    
    // Car helpers
    getCarDisplayName,
    getCarImageUrl,
    
    // Error helpers
    createError,
    asyncHandler,
    
    // File helpers
    isValidImageType,
    getFileExtension
};
