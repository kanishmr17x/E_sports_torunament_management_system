const express = require("express");
const router = express.Router();

const {
    createMatch,
    getAllMatches,
    getMatchById,
    updateMatch,
    enterMatchResult,
    deleteMatch,
    getMatchesByTournament,
    getUpcomingMatches,
    getCompletedMatches
} = require("../controllers/matchController");

const { protect } = require("../middleware/authMiddleware");
const { staffOnly } = require("../middleware/adminMiddleware");

router.get("/upcoming", getUpcomingMatches);
router.get("/completed", getCompletedMatches);
router.get("/tournament/:tournamentId", getMatchesByTournament);
router.get("/", getAllMatches);
router.get("/:id", getMatchById);
router.post("/", protect, staffOnly, createMatch);
router.put("/:id", protect, staffOnly, updateMatch);
router.put("/:id/result", protect, staffOnly, enterMatchResult);
router.delete("/:id", protect, staffOnly, deleteMatch);

module.exports = router;