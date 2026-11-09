const express = require("express");
const router = express.Router();

const {
    getLeaderboard,
    getAllTournamentsLeaderboard
} = require("../controllers/leaderboardController");

const { protect } = require("../middleware/authMiddleware");

router.get("/all", protect, getAllTournamentsLeaderboard);
router.get("/", protect, getLeaderboard);

module.exports = router;