const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendResponse, errorResponse } = require("./centralizedErrorHandler");

// Authentication middleware: verifies JWT and attaches the user to req.user
exports.protect = async (req, res, next) => {
    let token;

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

        if (!req.user.isActive) {
            return sendResponse(res, errorResponse("User account is inactive", 403));
        }

        next();
    } catch (error) {
        return sendResponse(res, errorResponse("Token invalid or expired", 401));
    }
};