const express = require("express");
const router = express.Router();

const {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    broadcastNotification
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.get("/", protect, getUserNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);
router.post("/", protect, adminOnly, createNotification);
router.post("/broadcast", protect, adminOnly, broadcastNotification);

module.exports = router;