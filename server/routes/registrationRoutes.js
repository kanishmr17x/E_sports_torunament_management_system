const express = require("express");
const router = express.Router();

const {
    registerTeamToTournament,
    getRegistrations,
    getMyRegistrations,
    getRegistrationById,
    cancelRegistration
} = require("../controllers/registrationController");

const { protect } = require("../middleware/authMiddleware");
const { staffOnly } = require("../middleware/adminMiddleware");

// Team registers to tournament (requires login)
router.post("/team", protect, registerTeamToTournament);

// User's own registrations
router.get("/my-registrations", protect, getMyRegistrations);
router.get("/my-registrations/:id", protect, getRegistrationById);
router.delete("/my-registrations/:id", protect, cancelRegistration);

// Staff gets all registered teams
router.get("/", protect, staffOnly, getRegistrations);

module.exports = router;
