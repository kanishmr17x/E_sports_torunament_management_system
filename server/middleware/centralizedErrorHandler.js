const mongoose = require('mongoose');

// Centralized Error Handler Middleware
const centralizedErrorHandler = (err, req, res, next) => {
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });

    let error = { ...err };
    error.message = err.message;

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = {
            message,
            statusCode: 400
        };
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = {
            message,
            statusCode: 409
        };
    }

    // Mongoose Cast Error (Invalid ObjectId)
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = {
            message,
            statusCode: 404
        };
    }

    // Mongoose Network/Timeout Errors
    if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
        const message = 'Database connection error. Please try again later.';
        error = {
            message,
            statusCode: 503
        };
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again.';
        error = {
            message,
            statusCode: 401
        };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Your token has expired. Please log in again.';
        error = {
            message,
            statusCode: 401
        };
    }

    // Default Error
    if (!error.statusCode) {
        error.statusCode = 500;
        error.message = 'Internal Server Error';
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Async Error Handler Wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation Helper
const validateRequired = (fields, body) => {
    const missing = fields.filter(field => !body[field] || body[field].toString().trim() === '');
    if (missing.length > 0) {
        return {
            isValid: false,
            message: `Missing required fields: ${missing.join(', ')}`
        };
    }
    return { isValid: true };
};

// Email Validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// ObjectId Validation
const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Success Response
const successResponse = (message, data = null, statusCode = 200) => {
    return {
        success: true,
        message,
        ...(data !== null && { data }),
        statusCode
    };
};

// Error Response
const errorResponse = (message, statusCode = 400) => {
    return {
        success: false,
        message,
        statusCode
    };
};

// Send Response Helper
const sendResponse = (res, response) => {
    const statusCode = response.statusCode || 200;
    delete response.statusCode; // Remove statusCode from response object
    res.status(statusCode).json(response);
};

module.exports = {
    centralizedErrorHandler,
    asyncHandler,
    validateRequired,
    validateEmail,
    validateObjectId,
    successResponse,
    errorResponse,
    sendResponse
};
