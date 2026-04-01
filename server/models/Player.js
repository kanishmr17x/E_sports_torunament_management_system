const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    playerName: {
        type: String,
        required: true,
        trim: true,
    },
    gameId: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ["IGL", "Assaulter", "Support", "Sniper", "Entry Fragger", "Other"],
        default: "Other"
    },
    age: {
        type: Number,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Player", playerSchema);
