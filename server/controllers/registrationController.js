const Registration = require("../models/Registration");
const { asyncHandler, validateRequired, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

// Register Team to Tournament
exports.registerTeamToTournament = asyncHandler(async (req, res) => {
    const { teamId, tournamentId } = req.body;

    // Strict validation
    const validation = validateRequired(['teamId', 'tournamentId'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse("teamId and tournamentId are required", 400));
    }

    // Validate ObjectId format
    if (!validateObjectId(teamId) || !validateObjectId(tournamentId)) {
        return sendResponse(res, errorResponse("Invalid team ID or tournament ID format", 400));
    }

    const registration = await Registration.create({
        teamId: teamId.trim(),
        tournamentId: tournamentId.trim()
    });

    sendResponse(res, successResponse("Team registered to tournament successfully", registration, 201));
});

// Get All Registrations
exports.getRegistrations = asyncHandler(async (req, res) => {
    const registrations = await Registration.find()
        .populate("teamId")
        .populate("tournamentId");

    sendResponse(res, successResponse(`Found ${registrations.length} registrations`, registrations));
});
