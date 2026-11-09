const Tournament = require("../models/Tournament");
const { asyncHandler, validateRequired, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

const VALID_TYPES = ["solo", "team", "duo"];
const VALID_FORMATS = ["single_elimination", "double_elimination", "round_robin", "swiss", "group_knockout"];
const VALID_STATUSES = ["draft", "registration_open", "registration_closed", "live", "completed", "cancelled"];

// Create Tournament
exports.createTournament = asyncHandler(async (req, res) => {
    const { 
        name, game, type, format, startDate, endDate, maxTeams, 
        prizePool, entryFee, description, rules, registrationStart, registrationDeadline, banner 
    } = req.body;

    // Strict validation
    const validation = validateRequired(['name', 'game', 'type', 'startDate', 'endDate', 'maxTeams'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse(validation.message, 400));
    }

    // Validate tournament type
    if (!VALID_TYPES.includes(type.trim())) {
        return sendResponse(res, errorResponse("Invalid tournament type. Must be one of: " + VALID_TYPES.join(", "), 400));
    }

    // Validate format
    if (format && !VALID_FORMATS.includes(format.trim())) {
        return sendResponse(res, errorResponse("Invalid tournament format. Must be one of: " + VALID_FORMATS.join(", "), 400));
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

    // Validate registration dates if provided
    if (registrationStart) {
        const regStart = new Date(registrationStart);
        if (isNaN(regStart.getTime())) {
            return sendResponse(res, errorResponse("Invalid registration start date format", 400));
        }
        if (regStart >= start) {
            return sendResponse(res, errorResponse("Registration start must be before tournament start date", 400));
        }
    }

    if (registrationDeadline) {
        const regDeadline = new Date(registrationDeadline);
        if (isNaN(regDeadline.getTime())) {
            return sendResponse(res, errorResponse("Invalid registration deadline format", 400));
        }
        if (regDeadline >= start) {
            return sendResponse(res, errorResponse("Registration deadline must be before tournament start date", 400));
        }
        if (registrationStart && regDeadline <= new Date(registrationStart)) {
            return sendResponse(res, errorResponse("Registration deadline must be after registration start", 400));
        }
    }

    // Validate maxTeams
    const maxTeamsNum = parseInt(maxTeams);
    if (isNaN(maxTeamsNum) || maxTeamsNum < 1) {
        return sendResponse(res, errorResponse("Max teams must be a positive number", 400));
    }

    // Validate prizePool
    const prizePoolNum = parseFloat(prizePool) || 0;
    if (prizePoolNum < 0) {
        return sendResponse(res, errorResponse("Prize pool cannot be negative", 400));
    }

    // Validate entryFee
    const entryFeeNum = parseFloat(entryFee) || 0;
    if (entryFeeNum < 0) {
        return sendResponse(res, errorResponse("Entry fee cannot be negative", 400));
    }

    const tournament = await Tournament.create({
        name: name.trim(),
        game: game.trim(),
        type: type.trim(),
        format: format || "single_elimination",
        startDate: start,
        endDate: end,
        maxTeams: maxTeamsNum,
        prizePool: prizePoolNum,
        entryFee: entryFeeNum,
        description: description ? description.trim() : "",
        rules: rules ? rules.trim() : "",
        registrationStart: registrationStart ? new Date(registrationStart) : start,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : start,
        banner: banner || "",
        status: "draft"
    });
    
    sendResponse(res, successResponse("Tournament created successfully", tournament, 201));
});

// Get All Tournaments
exports.getAllTournaments = asyncHandler(async (req, res) => {
    const { status, game, limit } = req.query;
    const filter = { isDeleted: false };
    
    if (status) filter.status = status;
    if (game) filter.game = game;

    const query = Tournament.find(filter).sort({ startDate: 1 }).populate('teams', 'teamName game');
    if (limit) query.limit(parseInt(limit));
    
    const tournaments = await query;
    
    sendResponse(res, successResponse(`Found ${tournaments.length} tournaments`, tournaments));
});

// Get Tournament By ID
exports.getTournamentById = asyncHandler(async (req, res) => {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid tournament ID format", 400));
    }
    
    const tournament = await Tournament.findOne({ _id: req.params.id, isDeleted: false })
        .populate('teams', 'teamName game status captain')
        .populate({
            path: 'teams',
            populate: { path: 'captain', select: 'username email' }
        });
    
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
    
    // Validate status if provided
    if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
        return sendResponse(res, errorResponse("Invalid status. Must be one of: " + VALID_STATUSES.join(", "), 400));
    }
    
    // Validate type if provided
    if (req.body.type && !VALID_TYPES.includes(req.body.type)) {
        return sendResponse(res, errorResponse("Invalid tournament type. Must be one of: " + VALID_TYPES.join(", "), 400));
    }
    
    // Validate format if provided
    if (req.body.format && !VALID_FORMATS.includes(req.body.format)) {
        return sendResponse(res, errorResponse("Invalid tournament format. Must be one of: " + VALID_FORMATS.join(", "), 400));
    }

    // Validate dates if provided
    if (req.body.startDate || req.body.endDate || req.body.registrationStart || req.body.registrationDeadline) {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return sendResponse(res, errorResponse("Tournament not found", 404));
        }
        
        const start = req.body.startDate ? new Date(req.body.startDate) : tournament.startDate;
        const end = req.body.endDate ? new Date(req.body.endDate) : tournament.endDate;
        const regStart = req.body.registrationStart ? new Date(req.body.registrationStart) : tournament.registrationStart;
        const regDeadline = req.body.registrationDeadline ? new Date(req.body.registrationDeadline) : tournament.registrationDeadline;
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return sendResponse(res, errorResponse("Invalid date format", 400));
        }
        
        if (start >= end) {
            return sendResponse(res, errorResponse("Start date must be before end date", 400));
        }
        
        if (regStart && regStart >= start) {
            return sendResponse(res, errorResponse("Registration start must be before tournament start date", 400));
        }
        
        if (regDeadline && regDeadline >= start) {
            return sendResponse(res, errorResponse("Registration deadline must be before tournament start date", 400));
        }
        
        if (regStart && regDeadline && regDeadline <= regStart) {
            return sendResponse(res, errorResponse("Registration deadline must be after registration start", 400));
        }
    }
    
    const allowedFields = [
        "name", "game", "type", "format", "description", "rules", "maxTeams",
        "prizePool", "entryFee", "duration", "startDate", "endDate",
        "registrationStart", "registrationDeadline", "status", "banner"
    ];
    const updates = Object.fromEntries(
        allowedFields
            .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
            .map((field) => [field, req.body[field]])
    );

    const updatedTournament = await Tournament.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        updates,
        { new: true, runValidators: true }
    ).populate('teams', 'teamName game');
    
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
        ).populate('teams', 'teamName game');
        
        sendResponse(res, successResponse("Tournament deleted successfully", updatedTournament));

    } catch (error) {
        throw error;
    }
});

// Get tournaments open for registration
exports.getOpenRegistrations = asyncHandler(async (req, res) => {
    const now = new Date();
    const tournaments = await Tournament.find({
        isDeleted: false,
        status: "registration_open",
        registrationStart: { $lte: now },
        registrationDeadline: { $gte: now }
    }).sort({ registrationDeadline: 1 }).populate('teams', 'teamName game');
    
    sendResponse(res, successResponse(`Found ${tournaments.length} tournaments open for registration`, tournaments));
});
