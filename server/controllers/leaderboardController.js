const Match = require("../models/Match");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const { asyncHandler, validateObjectId, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

exports.getLeaderboard = asyncHandler(async (req, res) => {
    const { tournamentId } = req.query;

    if (!tournamentId) {
        return sendResponse(res, errorResponse("Tournament ID is required", 400));
    }

    if (!validateObjectId(tournamentId)) {
        return sendResponse(res, errorResponse("Invalid tournament ID format", 400));
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        return sendResponse(res, errorResponse("Tournament not found", 404));
    }

    const matches = await Match.find({
        tournamentId,
        status: "completed"
    }).populate('team1', 'teamName').populate('team2', 'teamName').populate('winner', 'teamName');

    const teamStats = {};

    for (const team of tournament.teams || []) {
        const teamId = team.toString();
        teamStats[teamId] = {
            teamId,
            teamName: "",
            matches: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            scoreFor: 0,
            scoreAgainst: 0
        };
    }

    for (const match of matches) {
        // Protect against deleted / null teams in match
        if (!match.team1 || !match.team2) continue;

        const team1Id = (match.team1._id || match.team1).toString();
        const team2Id = (match.team2._id || match.team2).toString();

        if (!teamStats[team1Id]) {
            teamStats[team1Id] = { teamId: team1Id, teamName: match.team1.teamName || "Unknown Team", matches: 0, wins: 0, losses: 0, draws: 0, points: 0, scoreFor: 0, scoreAgainst: 0 };
        }
        if (!teamStats[team2Id]) {
            teamStats[team2Id] = { teamId: team2Id, teamName: match.team2.teamName || "Unknown Team", matches: 0, wins: 0, losses: 0, draws: 0, points: 0, scoreFor: 0, scoreAgainst: 0 };
        }

        teamStats[team1Id].teamName = match.team1.teamName || teamStats[team1Id].teamName;
        teamStats[team2Id].teamName = match.team2.teamName || teamStats[team2Id].teamName;

        teamStats[team1Id].matches++;
        teamStats[team2Id].matches++;

        teamStats[team1Id].scoreFor += (match.team1Score || 0);
        teamStats[team1Id].scoreAgainst += (match.team2Score || 0);
        teamStats[team2Id].scoreFor += (match.team2Score || 0);
        teamStats[team2Id].scoreAgainst += (match.team1Score || 0);

        if (match.result === "team1_win") {
            teamStats[team1Id].wins++;
            teamStats[team1Id].points += 3;
            teamStats[team2Id].losses++;
        } else if (match.result === "team2_win") {
            teamStats[team2Id].wins++;
            teamStats[team2Id].points += 3;
            teamStats[team1Id].losses++;
        } else {
            teamStats[team1Id].draws++;
            teamStats[team2Id].draws++;
            teamStats[team1Id].points += 1;
            teamStats[team2Id].points += 1;
        }
    }

    const tournamentTeamsList = (tournament.teams || []).map(t => t.toString());
    const leaderboard = Object.values(teamStats)
        .filter(t => t.matches > 0 || tournamentTeamsList.includes(t.teamId))
        .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const diffA = a.scoreFor - a.scoreAgainst;
            const diffB = b.scoreFor - b.scoreAgainst;
            if (diffB !== diffA) return diffB - diffA;
            return b.scoreFor - a.scoreFor;
        })
        .map((team, index) => ({
            rank: index + 1,
            ...team,
            scoreDifference: team.scoreFor - team.scoreAgainst
        }));

    sendResponse(res, successResponse("Leaderboard retrieved", {
        tournamentId,
        tournamentName: tournament.name,
        leaderboard
    }));
});

exports.getAllTournamentsLeaderboard = asyncHandler(async (req, res) => {
    // Include both 'live' and 'ongoing' for model enum compatibility
    const tournaments = await Tournament.find({
        isDeleted: false,
        status: { $in: ["live", "ongoing", "completed"] }
    });

    const results = [];

    for (const tournament of tournaments) {
        const matches = await Match.find({
            tournamentId: tournament._id,
            status: "completed"
        }).populate('team1', 'teamName').populate('team2', 'teamName').populate('winner', 'teamName');

        const teamStats = {};

        for (const team of tournament.teams || []) {
            const teamId = team.toString();
            teamStats[teamId] = {
                teamId,
                teamName: "",
                matches: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                points: 0,
                scoreFor: 0,
                scoreAgainst: 0
            };
        }

        for (const match of matches) {
            if (!match.team1 || !match.team2) continue;

            const team1Id = (match.team1._id || match.team1).toString();
            const team2Id = (match.team2._id || match.team2).toString();

            if (!teamStats[team1Id]) {
                teamStats[team1Id] = { teamId: team1Id, teamName: match.team1.teamName || "Unknown Team", matches: 0, wins: 0, losses: 0, draws: 0, points: 0, scoreFor: 0, scoreAgainst: 0 };
            }
            if (!teamStats[team2Id]) {
                teamStats[team2Id] = { teamId: team2Id, teamName: match.team2.teamName || "Unknown Team", matches: 0, wins: 0, losses: 0, draws: 0, points: 0, scoreFor: 0, scoreAgainst: 0 };
            }

            teamStats[team1Id].teamName = match.team1.teamName || teamStats[team1Id].teamName;
            teamStats[team2Id].teamName = match.team2.teamName || teamStats[team2Id].teamName;

            teamStats[team1Id].matches++;
            teamStats[team2Id].matches++;

            teamStats[team1Id].scoreFor += (match.team1Score || 0);
            teamStats[team1Id].scoreAgainst += (match.team2Score || 0);
            teamStats[team2Id].scoreFor += (match.team2Score || 0);
            teamStats[team2Id].scoreAgainst += (match.team1Score || 0);

            if (match.result === "team1_win") {
                teamStats[team1Id].wins++;
                teamStats[team1Id].points += 3;
                teamStats[team2Id].losses++;
            } else if (match.result === "team2_win") {
                teamStats[team2Id].wins++;
                teamStats[team2Id].points += 3;
                teamStats[team1Id].losses++;
            } else {
                teamStats[team1Id].draws++;
                teamStats[team2Id].draws++;
                teamStats[team1Id].points += 1;
                teamStats[team2Id].points += 1;
            }
        }

        const leaderboard = Object.values(teamStats)
            .filter(t => t.matches > 0)
            .sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                const diffA = a.scoreFor - a.scoreAgainst;
                const diffB = b.scoreFor - b.scoreAgainst;
                if (diffB !== diffA) return diffB - diffA;
                return b.scoreFor - a.scoreFor;
            })
            .map((team, index) => ({
                rank: index + 1,
                ...team,
                scoreDifference: team.scoreFor - team.scoreAgainst
            }));

        results.push({
            tournamentId: tournament._id,
            tournamentName: tournament.name,
            game: tournament.game,
            status: tournament.status,
            leaderboard
        });
    }

    sendResponse(res, successResponse("All tournament leaderboards retrieved", results));
});
