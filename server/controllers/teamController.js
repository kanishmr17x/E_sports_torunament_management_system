const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const Player = require("../models/Player");
const mongoose = require("mongoose");
const { asyncHandler, validateRequired, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

// Create Team (requires authentication)
exports.createTeam = asyncHandler(async (req, res) => {
    const { teamName, game, status, tournamentId } = req.body;
    const captainId = req.user._id;

    // Strict validation
    const validation = validateRequired(['teamName', 'game', 'tournamentId'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse(validation.message, 400));
    }

    // Validate ObjectId format
    if (!validateObjectId(tournamentId)) {
        return sendResponse(res, errorResponse("Invalid tournament ID format", 400));
    }

    // Validate team name length
    if (teamName.trim().length < 3) {
        return sendResponse(res, errorResponse("Team name must be at least 3 characters", 400));
    }

    // Validate game enum
    const validGames = ["PUBG", "BGMI", "Free Fire", "COD", "Valorant", "Other"];
    if (!validGames.includes(game.trim())) {
        return sendResponse(res, errorResponse("Invalid game. Must be one of: " + validGames.join(", "), 400));
    }

    try {
        // Check if tournament exists and has capacity
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return sendResponse(res, errorResponse("Tournament not found", 404));
        }

        // Check tournament capacity
        if (tournament.teams.length >= tournament.maxTeams) {
            return sendResponse(res, errorResponse("Tournament is full. Maximum teams reached.", 409));
        }

        // Check if user already has a team in this tournament
        const existingTeam = await Team.findOne({ captain: captainId, tournament: tournamentId, isDeleted: false });
        if (existingTeam) {
            return sendResponse(res, errorResponse("You already have a team in this tournament", 409));
        }

        // Create team with tournament reference and captain
        const team = await Team.create({
            teamName: teamName.trim(),
            game: game.trim(),
            status: status || "current",
            tournament: tournamentId,
            captain: captainId
        });

        // Add team to tournament's teams array
        tournament.teams.push(team._id);
        await tournament.save();

        // Populate tournament for response
        await team.populate('tournament');
        await team.populate('captain', 'username email');
        
        sendResponse(res, successResponse("Team created successfully", team, 201));

    } catch (error) {
        if (error.code === 11000) {
            return sendResponse(res, errorResponse("Team name already exists in this tournament", 409));
        }
        throw error;
    }
});

// Get All Teams
exports.getAllTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .populate('tournament', 'name game')
        .populate('captain', 'username email');
    
    sendResponse(res, successResponse(`Found ${teams.length} teams`, teams));
});

// Get My Teams (for logged in user)
exports.getMyTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({ captain: req.user._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .populate('tournament', 'name game status startDate endDate');
    
    sendResponse(res, successResponse(`Found ${teams.length} teams`, teams));
});

// Get Team By ID
exports.getTeamById = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid team ID format", 400));
    }
    
    const team = await Team.findOne({ _id: req.params.id, isDeleted: false })
        .populate('tournament', 'name game status startDate endDate')
        .populate('captain', 'username email');
    
    if (!team) {
        return sendResponse(res, errorResponse("Team not found", 404));
    }
    
    // Get players for this team (only non-deleted ones)
    const players = await Player.find({ teamId: req.params.id, isDeleted: false });
    
    // Add players to team object
    const teamWithPlayers = {
        ...team.toObject(),
        players: players
    };
    
    sendResponse(res, successResponse("Team found", teamWithPlayers));
});

// Update Team (only captain or admin)
exports.updateTeam = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid team ID format", 400));
    }
    
    const team = await Team.findOne({ _id: req.params.id, isDeleted: false });
    if (!team) {
        return sendResponse(res, errorResponse("Team not found", 404));
    }

    // Check ownership
    const isCaptain = team.captain.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    
    if (!isCaptain && !isAdmin) {
        return sendResponse(res, errorResponse("Not authorized to update this team", 403));
    }

    const allowedFields = ["teamName", "game", "status", "totalMembers", "logo"];
    if (isAdmin) allowedFields.push("captain");
    const updates = Object.fromEntries(
        allowedFields
            .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
            .map((field) => [field, req.body[field]])
    );

    const updatedTeam = await Team.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        updates,
        { new: true, runValidators: true }
    ).populate('tournament', 'name game')
     .populate('captain', 'username email');
    
    sendResponse(res, successResponse("Team updated successfully", updatedTeam));
});

// Soft Delete Team (only captain or admin)
exports.deleteTeam = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid team ID format", 400));
    }

    try {
        // Find team to ensure it exists and is not already deleted
        const team = await Team.findOne({ _id: req.params.id, isDeleted: false });
        if (!team) {
            return sendResponse(res, errorResponse("Team not found or already deleted", 404));
        }

        // Check ownership
        const isCaptain = team.captain.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";
        
        if (!isCaptain && !isAdmin) {
            return sendResponse(res, errorResponse("Not authorized to delete this team", 403));
        }

        // Soft delete the team
        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true, runValidators: true }
        ).populate('tournament', 'name game')
         .populate('captain', 'username email');
        
        // Remove from tournament teams array
        await Tournament.findByIdAndUpdate(team.tournament, {
            $pull: { teams: team._id }
        });

        sendResponse(res, successResponse("Team deleted successfully", updatedTeam));

    } catch (error) {
        throw error;
    }
});
