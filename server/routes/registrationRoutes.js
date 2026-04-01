const express = require("express");
const router = express.Router();

const {
    registerTeamToTournament,
    getRegistrations
} = require("../controllers/registrationController");

const { protect } = require("../middleware/authMiddleware");

// Team registers to tournament
router.post("/team", protect, registerTeamToTournament);

// Admin gets all registered teams
router.get("/", protect, getRegistrations);

module.exports = router;
