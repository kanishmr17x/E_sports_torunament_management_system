// Standardized Response Helper
const createResponse = (success, message, data = null, statusCode = 200) => {
    const response = {
        success,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return response;
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
    createResponse,
    successResponse,
    errorResponse,
    sendResponse
};
