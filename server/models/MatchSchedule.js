const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    },
    matchName: {
        type: String,
        required: true
    },
    matchTime: {
        type: Date,
        required: true
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    }]
}, { timestamps: true });

module.exports = mongoose.model("MatchSchedule", scheduleSchema);
