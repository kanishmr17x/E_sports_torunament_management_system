// Enhanced centralized error handler
// Provides detailed error information and proper JSON responses

function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('ERROR:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
    return res.status(400).json({
      success: false,
      error: message
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = {
      message,
      statusCode: 400
    };
    return res.status(400).json({
      success: false,
      error: message
    });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404
    };
    return res.status(404).json({
      success: false,
      error: message
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401
    };
    return res.status(401).json({
      success: false,
      error: message
    });
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401
    };
    return res.status(401).json({
      success: false,
      error: message
    });
  }

  // Default server error
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = { errorHandler };
