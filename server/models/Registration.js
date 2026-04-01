const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Registration", registrationSchema);
