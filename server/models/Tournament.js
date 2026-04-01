const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    game: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["solo", "team", "duo"],
        default: "team"
    },
    description: {
        type: String
    },
    maxTeams: {
        type: Number,
        required: true
    },
    registeredTeams: {
        type: Number,
        default: 0
    },
    prizePool: {
        type: String,
        default: "$0"
    },
    duration: {
        type: String,
        default: "0d"
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["upcoming", "live", "completed"],
        default: "upcoming"
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Tournament", tournamentSchema);
