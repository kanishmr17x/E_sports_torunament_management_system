const Registration = require("../models/Registration");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const { asyncHandler, validateRequired, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

// Register Team to Tournament
exports.registerTeamToTournament = asyncHandler(async (req, res) => {
    const { teamId, tournamentId } = req.body;
    const userId = req.user._id;

    // Strict validation
    const validation = validateRequired(['teamId', 'tournamentId'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse(validation.message, 400));
    }

    // Validate ObjectId format
    if (!validateObjectId(teamId) || !validateObjectId(tournamentId)) {
        return sendResponse(res, errorResponse("Invalid team ID or tournament ID format", 400));
    }

    // Check if team exists and belongs to user
    const team = await Team.findById(teamId);
    if (!team) {
        return sendResponse(res, errorResponse("Team not found", 404));
    }

    if (team.captain.toString() !== userId.toString()) {
        return sendResponse(res, errorResponse("Not authorized to register this team", 403));
    }

    if (team.tournament.toString() !== tournamentId.toString()) {
        return sendResponse(res, errorResponse("Team does not belong to this tournament", 400));
    }

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        return sendResponse(res, errorResponse("Tournament not found", 404));
    }

    // Check tournament status
    if (tournament.status !== "registration_open") {
        return sendResponse(res, errorResponse(`Tournament registration is not open. Current status: ${tournament.status}`, 400));
    }

    // Check registration deadline
    const now = new Date();
    if (tournament.registrationStart && tournament.registrationStart > now) {
        return sendResponse(res, errorResponse("Registration has not started yet", 400));
    }
    if (tournament.registrationDeadline && tournament.registrationDeadline < now) {
        return sendResponse(res, errorResponse("Registration deadline has passed", 400));
    }

    // Check tournament capacity
    if (tournament.registeredTeams >= tournament.maxTeams) {
        return sendResponse(res, errorResponse("Tournament is full. Maximum teams reached.", 409));
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({ teamId, tournamentId });
    if (existingRegistration) {
        return sendResponse(res, errorResponse("Team already registered for this tournament", 409));
    }

    // Check if team already has a registration in this tournament (via captain)
    const captainTeams = await Team.find({ captain: userId, tournament: tournamentId, isDeleted: false });
    if (captainTeams.length > 0) {
        const otherTeamIds = captainTeams.map(t => t._id.toString());
        if (!otherTeamIds.includes(teamId)) {
            return sendResponse(res, errorResponse("You already have a team registered in this tournament", 409));
        }
    }

    const registration = await Registration.create({
        teamId,
        tournamentId
    });

    // Update tournament registeredTeams count
    tournament.registeredTeams = (tournament.registeredTeams || 0) + 1;
    if (!tournament.teams.includes(teamId)) {
        tournament.teams.push(teamId);
    }
    await tournament.save();

    // Populate for response
    await registration.populate('teamId', 'teamName game');
    await registration.populate('tournamentId', 'name game status entryFee');
    
    sendResponse(res, successResponse("Team registered to tournament successfully", registration, 201));
});

// Get All Registrations (admin)
exports.getRegistrations = asyncHandler(async (req, res) => {
    const registrations = await Registration.find()
        .populate("teamId", "teamName game captain")
        .populate("tournamentId", "name game status")
        .sort({ registeredAt: -1 });

    sendResponse(res, successResponse(`Found ${registrations.length} registrations`, registrations));
});

// Get My Registrations (user)
exports.getMyRegistrations = asyncHandler(async (req, res) => {
    const userTeams = await Team.find({ captain: req.user._id, isDeleted: false }).select('_id');
    const teamIds = userTeams.map(t => t._id);
    
    const registrations = await Registration.find({ teamId: { $in: teamIds } })
        .populate("teamId", "teamName game")
        .populate("tournamentId", "name game status startDate endDate entryFee prizePool")
        .sort({ registeredAt: -1 });

    sendResponse(res, successResponse(`Found ${registrations.length} registrations`, registrations));
});

// Get Registration By ID
exports.getRegistrationById = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid registration ID format", 400));
    }

    const registration = await Registration.findById(req.params.id)
        .populate("teamId", "teamName game captain")
        .populate("tournamentId", "name game status startDate endDate entryFee prizePool");

    if (!registration) {
        return sendResponse(res, errorResponse("Registration not found", 404));
    }

    // Check ownership
    const team = await Team.findById(registration.teamId._id);
    if (team.captain.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return sendResponse(res, errorResponse("Not authorized to view this registration", 403));
    }

    sendResponse(res, successResponse("Registration found", registration));
});

// Cancel Registration (user)
exports.cancelRegistration = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid registration ID format", 400));
    }

    const registration = await Registration.findById(req.params.id)
        .populate("teamId", "captain")
        .populate("tournamentId", "status registeredTeams");

    if (!registration) {
        return sendResponse(res, errorResponse("Registration not found", 404));
    }

    // Check ownership
    if (registration.teamId.captain.toString() !== req.user._id.toString()) {
        return sendResponse(res, errorResponse("Not authorized to cancel this registration", 403));
    }

    // Check if tournament allows cancellation
    if (registration.tournamentId.status === "live" || registration.tournamentId.status === "completed") {
        return sendResponse(res, errorResponse("Cannot cancel registration for ongoing or completed tournament", 400));
    }

    // Check if payment was made
    const Payment = require("../models/Payment");
    const payment = await Payment.findOne({ registrationId: registration._id, status: "paid" });
    if (payment) {
        return sendResponse(res, errorResponse("Cannot cancel registration with completed payment. Contact admin for refund.", 400));
    }

    await Registration.findByIdAndDelete(req.params.id);

    // Update tournament registeredTeams count
    const tournament = registration.tournamentId;
    tournament.registeredTeams = Math.max(0, (tournament.registeredTeams || 1) - 1);
    tournament.teams = tournament.teams.filter(t => t.toString() !== registration.teamId._id.toString());
    await tournament.save();

    sendResponse(res, successResponse("Registration cancelled successfully"));
});
