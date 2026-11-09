const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        trim: true
    },
    game: {
        type: String,
        required: true,
        enum: ["PUBG", "BGMI", "Free Fire", "COD", "Valorant", "Other"]
    },
    status: {
        type: String,
        enum: ["current", "past", "upcoming"],
        default: "current"
    },
    totalMembers: {
        type: Number,
        default: 0
    },
    logo: {
        type: String, // uploaded to AWS S3
        default: null
    },
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

teamSchema.index({ tournament: 1, teamName: 1 }, { unique: true });

module.exports = mongoose.model("Team", teamSchema);
