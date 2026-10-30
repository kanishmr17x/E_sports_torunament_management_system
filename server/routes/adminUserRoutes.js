const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deactivateUser,
    activateUser,
    getUserStats
} = require("../controllers/adminUserController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.get("/stats", protect, adminOnly, getUserStats);
router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUserById);
router.put("/:id/role", protect, adminOnly, updateUserRole);
router.put("/:id/deactivate", protect, adminOnly, deactivateUser);
router.put("/:id/activate", protect, adminOnly, activateUser);

module.exports = router;