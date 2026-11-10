const Contact = require("../models/Contact");
const { asyncHandler, validateRequired, validateEmail, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

// Send Contact Message
exports.sendMessage = asyncHandler(async (req, res) => {
    const { fullName, email, message } = req.body;

    const validation = validateRequired(['fullName', 'email', 'message'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse(validation.message, 400));
    }

    if (!validateEmail(email)) {
        return sendResponse(res, errorResponse("Please provide a valid email address", 400));
    }

    if (fullName.trim().length < 2) {
        return sendResponse(res, errorResponse("Name must be at least 2 characters", 400));
    }

    if (message.trim().length < 5) {
        return sendResponse(res, errorResponse("Message must be at least 5 characters", 400));
    }

    const contact = await Contact.create({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        message: message.trim()
    });

    sendResponse(res, successResponse("Message sent successfully", contact, 201));
});
