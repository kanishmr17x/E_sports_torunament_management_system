const express = require("express");
const router = express.Router();

const {
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    deleteTeam
} = require("../controllers/teamController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Public
router.get("/", getAllTeams);
router.get("/:id", getTeamById);

// Team creation - public for now (can add auth later)
router.post("/", createTeam);

// Admin only
router.post("/create", protect, adminOnly, createTeam);
router.put("/:id", protect, adminOnly, updateTeam);
router.delete("/:id", protect, adminOnly, deleteTeam);

module.exports = router;
