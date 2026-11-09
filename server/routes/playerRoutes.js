const express = require("express");
const router = express.Router();

const {
    addPlayer,
    getAllPlayers,
    getPlayerById,
    getPlayersByTeam,
    deletePlayer
} = require("../controllers/playerController");

const { protect } = require("../middleware/authMiddleware");
const { staffOnly } = require("../middleware/adminMiddleware");

// Public read
router.get("/", getAllPlayers);
router.get("/team/:teamId", getPlayersByTeam);
router.get("/:id", getPlayerById);
router.post("/add", protect, addPlayer);

// Staff only (admin or organizer)
router.delete("/:id", protect, deletePlayer);

module.exports = router;