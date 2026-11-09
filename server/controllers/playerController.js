const Player = require("../models/Player");
const Team = require("../models/Team");
const { asyncHandler, validateRequired, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

// Add Player
exports.addPlayer = asyncHandler(async (req, res) => {
    const { playerName, playerEmail, gameId, age, contact, role, teamId } = req.body;

    // Strict validation
    const validation = validateRequired(['playerName', 'gameId', 'age', 'contact'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse(validation.message, 400));
    }

    // Validate contact format (could be email or phone)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (playerEmail && !emailRegex.test(playerEmail)) {
        return sendResponse(res, errorResponse("Please provide a valid email", 400));
    }

    // Validate player name length
    if (playerName.trim().length < 2) {
        return sendResponse(res, errorResponse("Player name must be at least 2 characters", 400));
    }

    // Validate age
    if (age < 13 || age > 100) {
        return sendResponse(res, errorResponse("Age must be between 13 and 100", 400));
    }

    if (teamId) {
        if (!validateObjectId(teamId)) {
            return sendResponse(res, errorResponse("Invalid team ID format", 400));
        }
        const team = await Team.findOne({ _id: teamId, isDeleted: false });
        if (!team) {
            return sendResponse(res, errorResponse("Team not found", 404));
        }
        if (team.captain.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return sendResponse(res, errorResponse("Not authorized to add a player to this team", 403));
        }
    } else if (req.user.role !== "admin") {
        return sendResponse(res, errorResponse("A team is required", 400));
    }

    const player = await Player.create({
        playerName: playerName.trim(),
        gameId: gameId.trim(),
        age: parseInt(age),
        contact: contact.trim(),
        role: role || "Other",
        teamId: teamId || null
    });

    sendResponse(res, successResponse("Player created successfully", player, 201));
});

// Get All Players
exports.getAllPlayers = asyncHandler(async (req, res) => {
    const players = await Player.find({ isDeleted: false }).populate("teamId", "teamName");
    sendResponse(res, successResponse(`Found ${players.length} players`, players));
});

// Get Player By ID
exports.getPlayerById = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid player ID format", 400));
    }

    const player = await Player.findOne({ _id: req.params.id, isDeleted: false }).populate("teamId", "teamName");
    
    if (!player) {
        return sendResponse(res, errorResponse("Player not found", 404));
    }

    sendResponse(res, successResponse("Player found", player));
});

// Get Players By Team
exports.getPlayersByTeam = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.teamId)) {
        return sendResponse(res, errorResponse("Invalid team ID format", 400));
    }

    const players = await Player.find({ teamId: req.params.teamId, isDeleted: false });
    sendResponse(res, successResponse(`Found ${players.length} players for team`, players));
});

// Soft Delete Player with Admin Validation
exports.deletePlayer = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid player ID format", 400));
    }

    // Find player to ensure it exists and is not already deleted
    const player = await Player.findOne({ _id: req.params.id, isDeleted: false });
    
    if (!player) {
        return sendResponse(res, errorResponse("Player not found or already deleted", 404));
    }

    // Soft delete the player
    const updatedPlayer = await Player.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true, runValidators: true }
    ).populate("teamId", "teamName");

    sendResponse(res, successResponse("Player deleted successfully", updatedPlayer));
});
