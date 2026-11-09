const express = require("express");
const router = express.Router();

const {
    createTeam,
    getAllTeams,
    getMyTeams,
    getTeamById,
    updateTeam,
    deleteTeam
} = require("../controllers/teamController");

const { protect } = require("../middleware/authMiddleware");
const { staffOnly } = require("../middleware/adminMiddleware");

// Public read
router.get("/", getAllTeams);

// User's own teams
router.get("/my-teams", protect, getMyTeams);
router.get("/:id", getTeamById);

// Team creation (requires login)
router.post("/", protect, createTeam);

// Team owner or admin
router.put("/:id", protect, updateTeam);
router.delete("/:id", protect, deleteTeam);

module.exports = router;
