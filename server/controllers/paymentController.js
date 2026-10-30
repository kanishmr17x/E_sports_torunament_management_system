const Payment = require("../models/Payment");
const Registration = require("../models/Registration");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const { asyncHandler, validateRequired, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const generateTransactionId = () => `TXN_${Date.now()}_${uuidv4().slice(0, 8).toUpperCase()}`;

exports.initiatePayment = asyncHandler(async (req, res) => {
    const { teamId, tournamentId, paymentMethod } = req.body;
    const userId = req.user._id;

    const validation = validateRequired(['teamId', 'tournamentId'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse(validation.message, 400));
    }

    if (!validateObjectId(teamId) || !validateObjectId(tournamentId)) {
        return sendResponse(res, errorResponse("Invalid team ID or tournament ID format", 400));
    }

    const team = await Team.findById(teamId);
    if (!team) {
        return sendResponse(res, errorResponse("Team not found", 404));
    }

    if (team.captain.toString() !== userId.toString() && req.user.role !== "admin") {
        return sendResponse(res, errorResponse("Not authorized to initiate payment for this team", 403));
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        return sendResponse(res, errorResponse("Tournament not found", 404));
    }

    if (team.tournament.toString() !== tournamentId.toString()) {
        return sendResponse(res, errorResponse("Team does not belong to this tournament", 400));
    }

    if (tournament.registeredTeams >= tournament.maxTeams) {
        return sendResponse(res, errorResponse("Tournament is full", 409));
    }

    const existingRegistration = await Registration.findOne({ teamId, tournamentId });
    if (existingRegistration) {
        const existingPayment = await Payment.findOne({ registrationId: existingRegistration._id, status: { $in: ["paid", "processing"] } });
        if (existingPayment) {
            return sendResponse(res, errorResponse("Team already registered and paid for this tournament", 409));
        }
    }

    const paymentAmount = tournament.entryFee;
    if (typeof paymentAmount !== "number" || !Number.isFinite(paymentAmount) || paymentAmount < 0) {
        return sendResponse(res, errorResponse("Tournament entry fee is invalid", 500));
    }

    const selectedPaymentMethod = paymentMethod || "test";
    if (process.env.NODE_ENV === "production" && selectedPaymentMethod === "test") {
        return sendResponse(res, errorResponse("Test payments are disabled in production", 400));
    }
    const transactionId = generateTransactionId();

    const payment = await Payment.create({
        userId,
        teamId,
        tournamentId,
        amount: paymentAmount,
        currency: "USD",
        status: "pending",
        paymentMethod: selectedPaymentMethod,
        transactionId,
        description: `Registration fee for ${tournament.name}`
    });

    sendResponse(res, successResponse("Payment initiated", {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentUrl: `/payment/${payment._id}`
    }, 201));
});

exports.processPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const { gatewayResponse } = req.body;

    if (!validateObjectId(paymentId)) {
        return sendResponse(res, errorResponse("Invalid payment ID format", 400));
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
        return sendResponse(res, errorResponse("Payment not found", 404));
    }

    if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return sendResponse(res, errorResponse("Not authorized to process this payment", 403));
    }

    if (payment.status === "paid") {
        return sendResponse(res, errorResponse("Payment already completed", 400));
    }

    if (payment.status === "cancelled") {
        return sendResponse(res, errorResponse("Payment was cancelled", 400));
    }

    const isTestMode = process.env.NODE_ENV !== "production" && payment.paymentMethod === "test";

    if (isTestMode) {
        payment.status = "paid";
        payment.paidAt = new Date();
        payment.gatewayResponse = gatewayResponse || { test: true, message: "Test payment successful" };
        await payment.save();

        let registration = await Registration.findOne({ teamId: payment.teamId, tournamentId: payment.tournamentId });
        const createdRegistration = !registration;
        if (!registration) {
            registration = await Registration.create({
                teamId: payment.teamId,
                tournamentId: payment.tournamentId
            });
        }

        payment.registrationId = registration._id;
        await payment.save();

        const tournament = await Tournament.findById(payment.tournamentId);
        if (tournament) {
            if (createdRegistration) {
                tournament.registeredTeams = (tournament.registeredTeams || 0) + 1;
            }
            if (!tournament.teams.some(teamId => teamId.toString() === payment.teamId.toString())) {
                tournament.teams.push(payment.teamId);
            }
            await tournament.save();
        }

        return sendResponse(res, successResponse("Test payment processed successfully", {
            paymentId: payment._id,
            transactionId: payment.transactionId,
            status: payment.status,
            registrationId: registration._id
        }));
    }

    payment.status = "processing";
    payment.gatewayResponse = gatewayResponse || {};
    await payment.save();

    sendResponse(res, successResponse("Payment processing initiated", {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        status: payment.status
    }));
});

exports.handlePaymentCallback = asyncHandler(async (req, res) => {
    const { transactionId, status, gatewayResponse } = req.body;
    const configuredSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    const providedSecret = req.get("x-payment-webhook-secret");

    const providedBuffer = providedSecret ? Buffer.from(providedSecret) : null;
    const configuredBuffer = configuredSecret ? Buffer.from(configuredSecret) : null;
    if (!providedBuffer || !configuredBuffer ||
        providedBuffer.length !== configuredBuffer.length ||
        !crypto.timingSafeEqual(providedBuffer, configuredBuffer)) {
        return sendResponse(res, errorResponse("Invalid payment callback signature", 401));
    }

    if (!transactionId || typeof status !== "string") {
        return sendResponse(res, errorResponse("Transaction ID and status are required", 400));
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
        return sendResponse(res, errorResponse("Payment not found", 404));
    }

    if (payment.status === "paid") {
        return sendResponse(res, successResponse("Payment callback already processed", {
            paymentId: payment._id,
            transactionId: payment.transactionId,
            status: payment.status
        }));
    }

    const isSuccess = status === "success" || status === "paid" || status === "completed";

    payment.status = isSuccess ? "paid" : "failed";
    if (isSuccess) payment.paidAt = new Date();
    payment.gatewayResponse = gatewayResponse || payment.gatewayResponse;
    await payment.save();

    if (isSuccess) {
        let registration = await Registration.findOne({ teamId: payment.teamId, tournamentId: payment.tournamentId });
        const createdRegistration = !registration;
        if (!registration) {
            registration = await Registration.create({
                teamId: payment.teamId,
                tournamentId: payment.tournamentId
            });
        }

        payment.registrationId = registration._id;
        await payment.save();

        const tournament = await Tournament.findById(payment.tournamentId);
        if (tournament) {
            if (createdRegistration) {
                tournament.registeredTeams = (tournament.registeredTeams || 0) + 1;
            }
            if (!tournament.teams.some(teamId => teamId.toString() === payment.teamId.toString())) {
                tournament.teams.push(payment.teamId);
            }
            await tournament.save();
        }
    }

    sendResponse(res, successResponse("Payment callback processed", {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        status: payment.status
    }));
});

exports.getPaymentById = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid payment ID format", 400));
    }

    const payment = await Payment.findById(req.params.id)
        .populate('userId', 'username email')
        .populate('teamId', 'teamName game')
        .populate('tournamentId', 'name game')
        .populate('registrationId');

    if (!payment) {
        return sendResponse(res, errorResponse("Payment not found", 404));
    }

    if (payment.userId._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return sendResponse(res, errorResponse("Not authorized to view this payment", 403));
    }

    sendResponse(res, successResponse("Payment found", payment));
});

exports.getUserPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({ userId: req.user._id })
        .populate('teamId', 'teamName game')
        .populate('tournamentId', 'name game startDate endDate')
        .sort({ createdAt: -1 });

    sendResponse(res, successResponse(`Found ${payments.length} payments`, payments));
});

exports.getAllPayments = asyncHandler(async (req, res) => {
    const { status, tournamentId, teamId } = req.query;
    const filter = {};

    if (status) filter.status = status;
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

    const payments = await Payment.find(filter)
        .populate('userId', 'username email')
        .populate('teamId', 'teamName game')
        .populate('tournamentId', 'name game')
        .sort({ createdAt: -1 });

    sendResponse(res, successResponse(`Found ${payments.length} payments`, payments));
});

exports.getPaymentStats = asyncHandler(async (req, res) => {
    const { tournamentId } = req.query;
    const matchFilter = tournamentId ? { tournamentId } : {};

    const stats = await Payment.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalAmount: { $sum: "$amount" }
            }
        }
    ]);

    const totalRevenue = await Payment.aggregate([
        { $match: { ...matchFilter, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    sendResponse(res, successResponse("Payment statistics retrieved", {
        byStatus: stats,
        totalRevenue: totalRevenue[0]?.total || 0
    }));
});

exports.refundPayment = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid payment ID format", 400));
    }

    const { reason } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
        return sendResponse(res, errorResponse("Payment not found", 404));
    }

    if (payment.status !== "paid") {
        return sendResponse(res, errorResponse("Only paid payments can be refunded", 400));
    }

    payment.status = "refunded";
    payment.refundedAt = new Date();
    payment.refundReason = reason || "Admin refund";
    await payment.save();

    const tournament = await Tournament.findById(payment.tournamentId);
    if (tournament) {
        tournament.registeredTeams = Math.max(0, (tournament.registeredTeams || 1) - 1);
        tournament.teams = tournament.teams.filter(t => t.toString() !== payment.teamId.toString());
        await tournament.save();
    }

    const registration = await Registration.findOne({ teamId: payment.teamId, tournamentId: payment.tournamentId });
    if (registration) {
        await Registration.findByIdAndDelete(registration._id);
    }

    payment.registrationId = null;
    await payment.save();

    sendResponse(res, successResponse("Payment refunded successfully", payment));
});