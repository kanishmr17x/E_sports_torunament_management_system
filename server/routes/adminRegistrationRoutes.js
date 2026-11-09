const express = require("express");
const router = express.Router();

const {
    getAllRegistrations,
    getRegistrationById,
    approveRegistration,
    rejectRegistration,
    getRegistrationStats
} = require("../controllers/adminRegistrationController");

const { protect } = require("../middleware/authMiddleware");
const { staffOnly } = require("../middleware/adminMiddleware");

router.get("/stats", protect, staffOnly, getRegistrationStats);
router.get("/", protect, staffOnly, getAllRegistrations);
router.get("/:id", protect, staffOnly, getRegistrationById);
router.post("/:id/approve", protect, staffOnly, approveRegistration);
router.post("/:id/reject", protect, staffOnly, rejectRegistration);

module.exports = router;