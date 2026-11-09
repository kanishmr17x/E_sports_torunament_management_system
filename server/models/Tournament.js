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
    format: {
        type: String,
        enum: ["single_elimination", "double_elimination", "round_robin", "swiss", "group_knockout"],
        default: "single_elimination"
    },
    description: {
        type: String
    },
    rules: {
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
        type: Number,
        default: 0
    },
    entryFee: {
        type: Number,
        default: 0
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
    registrationStart: {
        type: Date
    },
    registrationDeadline: {
        type: Date
    },
    status: {
        type: String,
        enum: ["draft", "registration_open", "registration_closed", "live", "completed", "cancelled"],
        default: "draft"
    },
    banner: {
        type: String,
        default: ""
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

tournamentSchema.index({ status: 1, startDate: 1 });
tournamentSchema.index({ game: 1, status: 1 });

module.exports = mongoose.model("Tournament", tournamentSchema);
