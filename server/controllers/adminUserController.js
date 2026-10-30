const User = require("../models/User");
const Team = require("../models/Team");
const Registration = require("../models/Registration");
const Payment = require("../models/Payment");
const { asyncHandler, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

exports.getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const filter = {};

    if (search) {
        filter.$or = [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }
    if (role) filter.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    const usersWithDetails = await Promise.all(users.map(async (user) => {
        const teams = await Team.find({ captain: user._id }).populate('tournament', 'name');
        const registrations = await Registration.find({
            teamId: { $in: teams.map(team => team._id) }
        }).populate('tournamentId', 'name');
        const payments = await Payment.find({ userId: user._id }).populate('tournamentId', 'name');

        return {
            ...user.toObject(),
            teams: teams.length,
            registrations: registrations.length,
            payments: payments.length,
            totalSpent: payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
        };
    }));

    sendResponse(res, successResponse("Users retrieved", {
        users: usersWithDetails,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    }));
});

exports.getUserById = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid user ID format", 400));
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
        return sendResponse(res, errorResponse("User not found", 404));
    }

    const teams = await Team.find({ captain: user._id }).populate('tournament', 'name status');
    const [registrations, payments] = await Promise.all([
        Registration.find({
            teamId: { $in: teams.map(team => team._id) }
        }).populate('tournamentId', 'name status'),
        Payment.find({ userId: user._id }).populate('tournamentId', 'name status')
    ]);

    sendResponse(res, successResponse("User details retrieved", {
        user,
        teams,
        registrations,
        payments,
        totalSpent: payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
    }));
});

exports.updateUserRole = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid user ID format", 400));
    }

    const { role } = req.body;
    const validRoles = ["player", "organizer", "admin"];

    if (!role || !validRoles.includes(role)) {
        return sendResponse(res, errorResponse("Invalid role. Must be one of: " + validRoles.join(", "), 400));
    }

    if (req.params.id === req.user._id.toString()) {
        return sendResponse(res, errorResponse("Cannot change your own role", 400));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
        return sendResponse(res, errorResponse("User not found", 404));
    }

    sendResponse(res, successResponse("User role updated", user));
});

exports.deactivateUser = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid user ID format", 400));
    }

    if (req.params.id === req.user._id.toString()) {
        return sendResponse(res, errorResponse("Cannot deactivate yourself", 400));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    ).select("-password");

    if (!user) {
        return sendResponse(res, errorResponse("User not found", 404));
    }

    sendResponse(res, successResponse("User deactivated", user));
});

exports.activateUser = asyncHandler(async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return sendResponse(res, errorResponse("Invalid user ID format", 400));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { new: true }
    ).select("-password");

    if (!user) {
        return sendResponse(res, errorResponse("User not found", 404));
    }

    sendResponse(res, successResponse("User activated", user));
});

exports.getUserStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const players = await User.countDocuments({ role: "player" });
    const organizers = await User.countDocuments({ role: "organizer" });
    const admins = await User.countDocuments({ role: "admin" });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("username email role createdAt");

    sendResponse(res, successResponse("User statistics retrieved", {
        totalUsers,
        byRole: { players, organizers, admins },
        recentUsers
    }));
});