const express = require("express");
const router = express.Router();

const {
    createTournament,
    getAllTournaments,
    getTournamentById,
    updateTournament,
    deleteTournament,
    getOpenRegistrations
} = require("../controllers/tournamentController");

const { protect } = require("../middleware/authMiddleware");
const { staffOnly } = require("../middleware/adminMiddleware");

// Public read
router.get("/", getAllTournaments);
router.get("/open-registrations", getOpenRegistrations);
router.get("/:id", getTournamentById);

// Staff only (admin or organizer)
router.post("/", protect, staffOnly, createTournament);
router.put("/:id", protect, staffOnly, updateTournament);
router.delete("/:id", protect, staffOnly, deleteTournament);

module.exports = router;
