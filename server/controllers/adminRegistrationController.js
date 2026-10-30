const Registration = require("../models/Registration");
const Payment = require("../models/Payment");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const User = require("../models/User");
const { asyncHandler, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

exports.getAllRegistrations = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, tournamentId, teamId, paymentStatus } = req.query;
    const filter = {};

    if (tournamentId) {
        if (!validateObjectId(tournamentId)) {
            return sendResponse(res, errorResponse("Invalid tournament ID format", 400));
        }
        filter.tournamentId = tournamentId;
    }
    if (teamId) {
        if (!validateObjectId(teamId)) {
            return sendResponse(res, errorResponse("Invalid team ID format", 400));
        }
        filter.teamId = teamId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await Registration.find(filter)
        .populate('teamId', 'teamName game captain')
        .populate('tournamentId', 'name game status startDate endDate')
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Registration.countDocuments(filter);

    const registrationsWithPayment = await Promise.all(registrations.map(async (reg) => {
        const payment = await Payment.findOne({ registrationId: reg._id });
        return {
            ...reg.toObject(),
            paymentStatus: payment?.status || "unpaid",
            paymentId: payment?._id,
            amount: payment?.amount || 0
        };
    }));

    if (paymentStatus) {
        const filtered = registrationsWithPayment.filter(r => r.paymentStatus === paymentStatus);
        sendResponse(res, successResponse("Registrations retrieved", {
            registrations: filtered,
            pagination: { page: parseInt(page), limit: parseInt(limit), total: filtered.length, pages: 1 }
        }));
    } else {
        sendResponse(res, successResponse("Registrations retrieved", {
            registrations: registrationsWithPayment,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        }));
    }
});

exports.getRegistrationById = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid registration ID format", 400));
    }

    const registration = await Registration.findById(req.params.id)
        .populate('teamId', 'teamName game captain logo')
        .populate('tournamentId', 'name game status startDate endDate maxTeams prizePool')
        .populate({
            path: 'teamId',
            populate: { path: 'captain', select: 'username email' }
        });

    if (!registration) {
        return sendResponse(res, errorResponse("Registration not found", 404));
    }

    const payment = await Payment.findOne({ registrationId: registration._id });

    sendResponse(res, successResponse("Registration details retrieved", {
        registration,
        payment: payment || null
    }));
});

exports.approveRegistration = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid registration ID format", 400));
    }

    const registration = await Registration.findById(req.params.id)
        .populate('tournamentId')
        .populate('teamId');

    if (!registration) {
        return sendResponse(res, errorResponse("Registration not found", 404));
    }

    const payment = await Payment.findOne({ registrationId: registration._id });
    if (!payment || payment.status !== "paid") {
        return sendResponse(res, errorResponse("Cannot approve registration without completed payment", 400));
    }

    const tournament = registration.tournamentId;
    if (tournament.registeredTeams >= tournament.maxTeams) {
        return sendResponse(res, errorResponse("Tournament is full", 409));
    }

    tournament.registeredTeams = (tournament.registeredTeams || 0) + 1;
    if (!tournament.teams.includes(registration.teamId._id)) {
        tournament.teams.push(registration.teamId._id);
    }
    await tournament.save();

    sendResponse(res, successResponse("Registration approved", registration));
});

exports.rejectRegistration = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid registration ID format", 400));
    }

    const { reason } = req.body;

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
        return sendResponse(res, errorResponse("Registration not found", 404));
    }

    await Registration.findByIdAndDelete(req.params.id);

    const payment = await Payment.findOne({ registrationId: registration._id });
    if (payment && payment.status === "paid") {
        payment.status = "refunded";
        payment.refundedAt = new Date();
        payment.refundReason = reason || "Registration rejected by admin";
        await payment.save();

        const tournament = await Tournament.findById(registration.tournamentId);
        if (tournament) {
            tournament.registeredTeams = Math.max(0, (tournament.registeredTeams || 1) - 1);
            tournament.teams = tournament.teams.filter(t => t.toString() !== registration.teamId.toString());
            await tournament.save();
        }
    }

    sendResponse(res, successResponse("Registration rejected"));
});

exports.getRegistrationStats = asyncHandler(async (req, res) => {
    const { tournamentId } = req.query;
    const filter = tournamentId ? { tournamentId } : {};

    const total = await Registration.countDocuments(filter);
    const byTournament = await Registration.aggregate([
        { $match: filter },
        { $group: { _id: "$tournamentId", count: { $sum: 1 } } },
        { $lookup: { from: "tournaments", localField: "_id", foreignField: "_id", as: "tournament" } },
        { $unwind: "$tournament" },
        { $project: { tournamentName: "$tournament.name", count: 1 } }
    ]);

    sendResponse(res, successResponse("Registration statistics retrieved", {
        total,
        byTournament
    }));
});