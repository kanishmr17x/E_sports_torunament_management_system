const { protect } = require("./authMiddleware");
const { sendResponse, errorResponse } = require("./centralizedErrorHandler");

// Require an authenticated user with one of the given roles.
const requireRoles = (...roles) => async (req, res, next) => {
    await protect(req, res, () => {
        if (req.user && roles.includes(req.user.role)) {
            return next();
        }
        return sendResponse(res, errorResponse("Admin access required", 403));
    });
};

// Admin-only middleware (role === 'admin')
exports.adminOnly = requireRoles("admin");

// Admin or organizer middleware (staff)
exports.staffOnly = requireRoles("admin", "organizer");