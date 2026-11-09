const Notification = require("../models/Notification");
const { asyncHandler, validateRequired, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

exports.getUserNotifications = asyncHandler(async (req, res) => {
    const { unreadOnly, limit } = req.query;
    const filter = { userId: req.user._id };

    if (unreadOnly === "true") {
        filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) || 50);

    sendResponse(res, successResponse(`Found ${notifications.length} notifications`, notifications));
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    sendResponse(res, successResponse("Unread count retrieved", { count }));
});

exports.markAsRead = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid notification ID format", 400));
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { isRead: true, readAt: new Date() },
        { new: true }
    );

    if (!notification) {
        return sendResponse(res, errorResponse("Notification not found", 404));
    }

    sendResponse(res, successResponse("Notification marked as read", notification));
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
    );

    sendResponse(res, successResponse("All notifications marked as read"));
});

exports.deleteNotification = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid notification ID format", 400));
    }

    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!notification) {
        return sendResponse(res, errorResponse("Notification not found", 404));
    }

    sendResponse(res, successResponse("Notification deleted"));
});

exports.createNotification = asyncHandler(async (req, res) => {
    const { userId, type, title, message, relatedEntity } = req.body;

    const validation = validateRequired(['userId', 'type', 'title', 'message'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse(validation.message, 400));
    }

    if (!validateObjectId(userId)) {
        return sendResponse(res, errorResponse("Invalid user ID format", 400));
    }

    const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        relatedEntity: relatedEntity || {}
    });

    sendResponse(res, successResponse("Notification created", notification, 201));
});

exports.broadcastNotification = asyncHandler(async (req, res) => {
    const { userIds, type, title, message, relatedEntity } = req.body;

    const validation = validateRequired(['userIds', 'type', 'title', 'message'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse(validation.message, 400));
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
        return sendResponse(res, errorResponse("userIds must be a non-empty array", 400));
    }

    const validIds = userIds.filter(id => validateObjectId(id));
    if (validIds.length === 0) {
        return sendResponse(res, errorResponse("No valid user IDs provided", 400));
    }

    const notifications = await Notification.insertMany(
        validIds.map(userId => ({
            userId,
            type,
            title,
            message,
            relatedEntity: relatedEntity || {}
        }))
    );

    sendResponse(res, successResponse(`${notifications.length} notifications sent`, { count: notifications.length }));
});