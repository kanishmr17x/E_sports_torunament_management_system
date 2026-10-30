const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    },
    round: {
        type: Number,
        required: true
    },
    matchNumber: {
        type: Number,
        required: true
    },
    team1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    team2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    venue: {
        type: String,
        default: ""
    },
    serverInfo: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["scheduled", "live", "completed", "cancelled"],
        default: "scheduled"
    },
    team1Score: {
        type: Number,
        default: 0
    },
    team2Score: {
        type: Number,
        default: 0
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        default: null
    },
    result: {
        type: String,
        enum: ["team1_win", "team2_win", "draw", "pending"],
        default: "pending"
    },
    notes: {
        type: String,
        default: ""
    }
}, { timestamps: true });

matchSchema.index({ tournamentId: 1, round: 1, matchNumber: 1 });
matchSchema.index({ scheduledAt: 1 });
matchSchema.index({ status: 1 });

module.exports = mongoose.model("Match", matchSchema);