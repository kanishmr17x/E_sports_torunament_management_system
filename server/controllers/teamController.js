const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const Player = require("../models/Player");
const mongoose = require("mongoose");
const { asyncHandler, validateRequired, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

// Create Team
exports.createTeam = asyncHandler(async (req, res) => {
    const { teamName, game, status, tournamentId } = req.body;

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

        // Create team with tournament reference
        const team = await Team.create({
            teamName: teamName.trim(),
            game: game.trim(),
            status: status || "current",
            tournament: tournamentId
        });

        // Add team to tournament's teams array
        tournament.teams.push(team._id);
        await tournament.save();

        // Populate tournament for response
        await team.populate('tournament');
        
        sendResponse(res, successResponse("Team created successfully", team, 201));

    } catch (error) {
        throw error;
    }
});

// Get All Teams
exports.getAllTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({ isDeleted: false }).sort({ createdAt: -1 }).populate('tournament');
    
    sendResponse(res, successResponse(`Found ${teams.length} teams`, teams));
});

// Get Team By ID
exports.getTeamById = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid team ID format", 400));
    }
    
    const team = await Team.findOne({ _id: req.params.id, isDeleted: false }).populate('tournament');
    
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

// Update Team
exports.updateTeam = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid team ID format", 400));
    }
    
    const team = await Team.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        req.body,
        { new: true, runValidators: true }
    ).populate('tournament');
    
    if (!team) {
        return sendResponse(res, errorResponse("Team not found", 404));
    }
    
    sendResponse(res, successResponse("Team updated successfully", team));
});

// Soft Delete Team with Admin Validation
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

        // Soft delete the team
        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true, runValidators: true }
        ).populate('tournament');
        
        sendResponse(res, successResponse("Team deleted successfully", updatedTeam));

    } catch (error) {
        throw error;
    }
});
