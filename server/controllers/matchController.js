const Match = require("../models/Match");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const { asyncHandler, validateRequired, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

// Create Match
exports.createMatch = asyncHandler(async (req, res) => {
    const { tournamentId, round, matchNumber, team1, team2, scheduledAt, venue, serverInfo } = req.body;

    const validation = validateRequired(['tournamentId', 'round', 'matchNumber', 'team1', 'team2', 'scheduledAt'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse(validation.message, 400));
    }

    if (!validateObjectId(tournamentId) || !validateObjectId(team1) || !validateObjectId(team2)) {
        return sendResponse(res, errorResponse("Invalid ID format for tournament, team1, or team2", 400));
    }

    if (team1 === team2) {
        return sendResponse(res, errorResponse("Team 1 and Team 2 cannot be the same", 400));
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        return sendResponse(res, errorResponse("Tournament not found", 404));
    }

    const [team1Doc, team2Doc] = await Promise.all([
        Team.findById(team1),
        Team.findById(team2)
    ]);

    if (!team1Doc || !team2Doc) {
        return sendResponse(res, errorResponse("One or both teams not found", 404));
    }

    const existingMatch = await Match.findOne({ tournamentId, round, matchNumber });
    if (existingMatch) {
        return sendResponse(res, errorResponse("Match with this round and match number already exists", 409));
    }

    const scheduled = new Date(scheduledAt);
    if (isNaN(scheduled.getTime())) {
        return sendResponse(res, errorResponse("Invalid scheduled date format", 400));
    }

    const team1Matches = await Match.find({
        $or: [{ team1: team1 }, { team2: team1 }],
        scheduledAt: { $gte: new Date(scheduled.getTime() - 2 * 60 * 60 * 1000), $lte: new Date(scheduled.getTime() + 2 * 60 * 60 * 1000) },
        status: { $ne: "cancelled" }
    });

    const team2Matches = await Match.find({
        $or: [{ team1: team2 }, { team2: team2 }],
        scheduledAt: { $gte: new Date(scheduled.getTime() - 2 * 60 * 60 * 1000), $lte: new Date(scheduled.getTime() + 2 * 60 * 60 * 1000) },
        status: { $ne: "cancelled" }
    });

    if (team1Matches.length > 0 || team2Matches.length > 0) {
        return sendResponse(res, errorResponse("Scheduling conflict: one or both teams have a match within 2 hours of this time", 409));
    }

    const match = await Match.create({
        tournamentId,
        round: parseInt(round),
        matchNumber: parseInt(matchNumber),
        team1,
        team2,
        scheduledAt: scheduled,
        venue: venue || "",
        serverInfo: serverInfo || "",
        status: "scheduled"
    });

    await match.populate(['team1', 'team2', 'tournamentId']);
    sendResponse(res, successResponse("Match created successfully", match, 201));
});

// Get All Matches
exports.getAllMatches = asyncHandler(async (req, res) => {
    const { tournamentId, status, round } = req.query;
    const filter = {};

    if (tournamentId) {
        if (!validateObjectId(tournamentId)) {
            return sendResponse(res, errorResponse("Invalid tournament ID format", 400));
        }
        filter.tournamentId = tournamentId;
    }
    if (status) filter.status = status;
    if (round) filter.round = parseInt(round);

    const matches = await Match.find(filter)
        .populate('team1', 'teamName game')
        .populate('team2', 'teamName game')
        .populate('tournamentId', 'name game')
        .populate('winner', 'teamName')
        .sort({ scheduledAt: 1 });

    sendResponse(res, successResponse(`Found ${matches.length} matches`, matches));
});

// Get Match By ID
exports.getMatchById = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid match ID format", 400));
    }

    const match = await Match.findById(req.params.id)
        .populate('team1', 'teamName game logo')
        .populate('team2', 'teamName game logo')
        .populate('tournamentId', 'name game type status')
        .populate('winner', 'teamName');

    if (!match) {
        return sendResponse(res, errorResponse("Match not found", 404));
    }

    sendResponse(res, successResponse("Match found", match));
});

// Update Match
exports.updateMatch = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid match ID format", 400));
    }

    const { scheduledAt, venue, serverInfo, status, round, matchNumber } = req.body;
    const updateData = {};

    if (scheduledAt) {
        const scheduled = new Date(scheduledAt);
        if (isNaN(scheduled.getTime())) {
            return sendResponse(res, errorResponse("Invalid scheduled date format", 400));
        }
        updateData.scheduledAt = scheduled;
    }
    if (venue !== undefined) updateData.venue = venue;
    if (serverInfo !== undefined) updateData.serverInfo = serverInfo;
    if (status) {
        const validStatuses = ["scheduled", "live", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return sendResponse(res, errorResponse("Invalid match status", 400));
        }
        updateData.status = status;
    }
    if (round) updateData.round = parseInt(round);
    if (matchNumber) updateData.matchNumber = parseInt(matchNumber);

    const currentMatch = await Match.findById(req.params.id);
    if (!currentMatch) {
        return sendResponse(res, errorResponse("Match not found", 404));
    }

    if (round || matchNumber) {
        const existingMatch = await Match.findOne({
            tournamentId: currentMatch.tournamentId,
            round: updateData.round || round,
            matchNumber: updateData.matchNumber || matchNumber,
            _id: { $ne: req.params.id }
        });
        if (existingMatch) {
            return sendResponse(res, errorResponse("Match with this round and match number already exists", 409));
        }
    }

    const match = await Match.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
        .populate('team1', 'teamName game')
        .populate('team2', 'teamName game')
        .populate('tournamentId', 'name game')
        .populate('winner', 'teamName');

    if (!match) {
        return sendResponse(res, errorResponse("Match not found", 404));
    }

    sendResponse(res, successResponse("Match updated successfully", match));
});

// Enter Match Result
exports.enterMatchResult = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid match ID format", 400));
    }

    const { team1Score, team2Score, winner, notes } = req.body;

    if (team1Score === undefined || team2Score === undefined) {
        return sendResponse(res, errorResponse("Both team scores are required", 400));
    }

    const score1 = parseInt(team1Score);
    const score2 = parseInt(team2Score);

    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
        return sendResponse(res, errorResponse("Scores must be non-negative integers", 400));
    }

    let result = "pending";
    let winnerId = null;

    if (score1 > score2) {
        result = "team1_win";
    } else if (score2 > score1) {
        result = "team2_win";
    } else {
        result = "draw";
    }

    const currentMatch = await Match.findById(req.params.id);
    if (!currentMatch) {
        return sendResponse(res, errorResponse("Match not found", 404));
    }

    if (winner) {
        if (!validateObjectId(winner)) {
            return sendResponse(res, errorResponse("Invalid winner ID format", 400));
        }
        winnerId = winner;
    } else {
        winnerId = result === "team1_win" ? currentMatch.team1 :
                   result === "team2_win" ? currentMatch.team2 : null;
    }

    const match = await Match.findByIdAndUpdate(
        req.params.id,
        {
            team1Score: score1,
            team2Score: score2,
            winner: winnerId,
            result,
            status: "completed",
            notes: notes || ""
        },
        { new: true, runValidators: true }
    ).populate('team1', 'teamName game logo')
     .populate('team2', 'teamName game logo')
     .populate('tournamentId', 'name game')
     .populate('winner', 'teamName');

    if (!match) {
        return sendResponse(res, errorResponse("Match not found", 404));
    }

    sendResponse(res, successResponse("Match result recorded successfully", match));
});

// Delete/Cancel Match
exports.deleteMatch = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid match ID format", 400));
    }

    const match = await Match.findById(req.params.id);
    if (!match) {
        return sendResponse(res, errorResponse("Match not found", 404));
    }

    if (match.status === "completed") {
        return sendResponse(res, errorResponse("Cannot delete a completed match. Cancel it instead.", 400));
    }

    await Match.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
    sendResponse(res, successResponse("Match cancelled successfully"));
});

// Get Matches by Tournament
exports.getMatchesByTournament = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.tournamentId)) {
        return sendResponse(res, errorResponse("Invalid tournament ID format", 400));
    }

    const matches = await Match.find({ tournamentId: req.params.tournamentId })
        .populate('team1', 'teamName game logo')
        .populate('team2', 'teamName game logo')
        .populate('winner', 'teamName')
        .sort({ round: 1, matchNumber: 1 });

    sendResponse(res, successResponse(`Found ${matches.length} matches`, matches));
});

// Get Upcoming Matches for User
exports.getUpcomingMatches = asyncHandler(async (req, res) => {
    const matches = await Match.find({
        scheduledAt: { $gte: new Date() },
        status: { $in: ["scheduled", "live"] }
    })
        .populate('team1', 'teamName game logo')
        .populate('team2', 'teamName game logo')
        .populate('tournamentId', 'name game status')
        .sort({ scheduledAt: 1 })
        .limit(50);

    sendResponse(res, successResponse(`Found ${matches.length} upcoming matches`, matches));
});

// Get Completed Matches
exports.getCompletedMatches = asyncHandler(async (req, res) => {
    const { tournamentId } = req.query;
    const filter = { status: "completed" };

    if (tournamentId) {
        if (!validateObjectId(tournamentId)) {
            return sendResponse(res, errorResponse("Invalid tournament ID format", 400));
        }
        filter.tournamentId = tournamentId;
    }

    const matches = await Match.find(filter)
        .populate('team1', 'teamName game logo')
        .populate('team2', 'teamName game logo')
        .populate('tournamentId', 'name game')
        .populate('winner', 'teamName')
        .sort({ scheduledAt: -1 })
        .limit(50);

    sendResponse(res, successResponse(`Found ${matches.length} completed matches`, matches));
});