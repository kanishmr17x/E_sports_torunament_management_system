const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendResponse, errorResponse } = require("./centralizedErrorHandler");

exports.protect = async (req, res, next) => {
    let token;

    // Check Authorization header (case insensitive)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
    }

    if (!token) {
        return sendResponse(res, errorResponse("Not authorized, no token", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return sendResponse(res, errorResponse("User not found", 401));
        }

        next();
    } catch (error) {
        return sendResponse(res, errorResponse("Token invalid or expired", 401));
    }
};

// Admin-only middleware
exports.adminOnly = async (req, res, next) => {
    // First ensure user is authenticated
    await exports.protect(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return sendResponse(res, errorResponse("Admin access required", 403));
        }
    });
};
