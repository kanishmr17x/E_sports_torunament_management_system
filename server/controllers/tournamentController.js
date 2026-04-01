const Tournament = require("../models/Tournament");
const { asyncHandler, validateRequired, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

// Create Tournament
exports.createTournament = asyncHandler(async (req, res) => {
    const { name, game, type, startDate, endDate, maxTeams, prizePool, description } = req.body;

    // Strict validation
    const validation = validateRequired(['name', 'game', 'type', 'startDate', 'endDate', 'maxTeams'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse(validation.message, 400));
    }

    // Validate tournament type
    const validTypes = ["solo", "team", "duo"];
    if (!validTypes.includes(type.trim())) {
        return sendResponse(res, errorResponse("Invalid tournament type. Must be one of: " + validTypes.join(", "), 400));
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return sendResponse(res, errorResponse("Invalid date format", 400));
    }
    
    if (start >= end) {
        return sendResponse(res, errorResponse("Start date must be before end date", 400));
    }

    // Validate maxTeams
    const maxTeamsNum = parseInt(maxTeams);
    if (isNaN(maxTeamsNum) || maxTeamsNum < 1) {
        return sendResponse(res, errorResponse("Max teams must be a positive number", 400));
    }

    const tournament = await Tournament.create({
        name: name.trim(),
        game: game.trim(),
        type: type.trim(),
        startDate: start,
        endDate: end,
        maxTeams: maxTeamsNum,
        prizePool: prizePool || "$0",
        description: description ? description.trim() : "",
        status: "upcoming"
    });
    
    sendResponse(res, successResponse("Tournament created successfully", tournament, 201));
});

// Get All Tournaments
exports.getAllTournaments = asyncHandler(async (req, res) => {
    const tournaments = await Tournament.find({ isDeleted: false }).sort({ startDate: 1 }).populate('teams');
    
    sendResponse(res, successResponse(`Found ${tournaments.length} tournaments`, tournaments));
});

// Get Tournament By ID
exports.getTournamentById = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid tournament ID format", 400));
    }
    
    const tournament = await Tournament.findOne({ _id: req.params.id, isDeleted: false }).populate('teams');
    
    if (!tournament) {
        return sendResponse(res, errorResponse("Tournament not found", 404));
    }
    
    sendResponse(res, successResponse("Tournament found", tournament));
});

// Update Tournament
exports.updateTournament = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid tournament ID format", 400));
    }
    
    // Validate dates if provided
    if (req.body.startDate || req.body.endDate) {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return sendResponse(res, errorResponse("Tournament not found", 404));
        }
        
        const start = req.body.startDate ? new Date(req.body.startDate) : tournament.startDate;
        const end = req.body.endDate ? new Date(req.body.endDate) : tournament.endDate;
        
        if (start >= end) {
            return sendResponse(res, errorResponse("Start date must be before end date", 400));
        }
    }
    
    const updatedTournament = await Tournament.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        req.body,
        { new: true, runValidators: true }
    ).populate('teams');
    
    if (!updatedTournament) {
        return sendResponse(res, errorResponse("Tournament not found", 404));
    }
    
    sendResponse(res, successResponse("Tournament updated successfully", updatedTournament));
});

// Soft Delete Tournament with Admin Validation
exports.deleteTournament = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid tournament ID format", 400));
    }

    try {
        // Find tournament to ensure it exists and is not already deleted
        const tournament = await Tournament.findOne({ _id: req.params.id, isDeleted: false });
        if (!tournament) {
            return sendResponse(res, errorResponse("Tournament not found or already deleted", 404));
        }

        // Soft delete the tournament
        const updatedTournament = await Tournament.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true, runValidators: true }
        ).populate('teams');
        
        sendResponse(res, successResponse("Tournament deleted successfully", updatedTournament));

    } catch (error) {
        throw error;
    }
});
