const { sendResponse, errorResponse } = require("./centralizedErrorHandler");

// Admin-only middleware
exports.adminOnly = async (req, res, next) => {
    // First ensure user is authenticated
    const { protect } = require("./authMiddleware");
    
    await protect(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return sendResponse(res, errorResponse("Admin access required", 403));
        }
    });
};
