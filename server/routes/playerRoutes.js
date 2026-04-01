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
const { adminOnly } = require("../middleware/adminMiddleware");

// Public
router.get("/", getAllPlayers);
router.get("/:id", getPlayerById);
router.get("/team/:teamId", getPlayersByTeam);
router.post("/add", addPlayer);

// Admin only
router.delete("/:id", protect, adminOnly, deletePlayer);

module.exports = router;