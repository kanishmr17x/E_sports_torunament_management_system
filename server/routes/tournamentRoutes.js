const express = require("express");
const router = express.Router();

const {
    createTournament,
    getAllTournaments,
    getTournamentById,
    updateTournament,
    deleteTournament
} = require("../controllers/tournamentController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Public
router.post("/", createTournament);
router.get("/", getAllTournaments);
router.get("/:id", getTournamentById);

// Admin only
router.put("/:id", protect, adminOnly, updateTournament);
router.delete("/:id", protect, adminOnly, deleteTournament);

module.exports = router;
