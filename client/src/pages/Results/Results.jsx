import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCompletedMatches, getLeaderboard } from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/theme.css";
import "../../styles/results.css";

const Results = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [leaderboard, setLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterTournament, setFilterTournament] = useState("");
    const [viewMode, setViewMode] = useState("matches");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        try {
            setLoading(true);
            const [matchesRes] = await Promise.allSettled([
                getCompletedMatches({ limit: 200 })
            ]);
            setMatches(matchesRes.status === "fulfilled" ? matchesRes.value : []);
        } catch (err) {
            setError(err.message || "Failed to load results");
        } finally {
            setLoading(false);
        }
    };

    const loadLeaderboard = async (tournamentId) => {
        try {
            const res = await getLeaderboard(tournamentId);
            setLeaderboard(res);
        } catch (err) {
            console.error("Failed to load leaderboard:", err);
        }
    };

    useEffect(() => {
        if (filterTournament && viewMode === "leaderboard") {
            loadLeaderboard(filterTournament);
        } else {
            setLeaderboard(null);
        }
    }, [filterTournament, viewMode]);

    const filteredMatches = filterTournament
        ? matches.filter(m => m.tournamentId?._id === filterTournament || m.tournamentId === filterTournament)
        : matches;

    const tournaments = [...new Set(
        matches.map(m => m.tournamentId).filter(Boolean)
    )].map(t => typeof t === "object" ? t : { _id: t, name: "Unknown" }).filter((t, i, arr) => 
        arr.findIndex(x => x._id === t._id) === i
    );

    if (loading) {
        return (
            <div className="results-page loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Loading results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="results-page">
            <header className="results-header">
                <div className="header-content">
                    <div>
                        <h1>🏁 Match Results</h1>
                        <p className="subtitle">View completed matches and tournament standings</p>
                    </div>
                    <div className="header-controls">
                        <select
                            value={filterTournament}
                            onChange={(e) => setFilterTournament(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Tournaments</option>
                            {tournaments.map(t => (
                                <option key={t._id} value={t._id}>
                                    {t.name || "Unknown Tournament"}
                                </option>
                            ))}
                        </select>
                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === "matches" ? "active" : ""}`}
                                onClick={() => setViewMode("matches")}
                            >
                                Matches
                            </button>
                            <button
                                className={`view-btn ${viewMode === "leaderboard" ? "active" : ""}`}
                                onClick={() => setViewMode("leaderboard")}
                            >
                                Leaderboard
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="results-main">
                {error && <div className="alert alert-error">{error}</div>}

                {viewMode === "matches" ? (
                    <div className="results-matches">
                        {filteredMatches.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🏁</div>
                                <h2>No Completed Matches</h2>
                                <p>{filterTournament ? "No completed matches for this tournament." : "No matches have been completed yet."}</p>
                            </div>
                        ) : (
                            <div className="matches-list">
                                {filteredMatches.map(match => (
                                    <div key={match._id} className="result-card">
                                        <div className="result-header">
                                            <div className="result-tournament">
                                                <span className="tournament-name">{match.tournamentId?.name || "Tournament"}</span>
                                                <span className="tournament-game">{match.tournamentId?.game}</span>
                                            </div>
                                            <span className="result-date">{match.scheduledAt ? new Date(match.scheduledAt).toLocaleDateString() : "TBD"}</span>
                                        </div>
                                        <div className="result-teams">
                                            <div className="team">
                                                <span className="team-name">{match.team1?.teamName || "TBD"}</span>
                                                <span className="team-score">{match.team1Score}</span>
                                            </div>
                                            <div className="vs">vs</div>
                                            <div className="team">
                                                <span className="team-name">{match.team2?.teamName || "TBD"}</span>
                                                <span className="team-score">{match.team2Score}</span>
                                            </div>
                                        </div>
                                        <div className="result-meta">
                                            <span className={`winner-badge ${match.winner?._id === match.team1?._id ? "team1" : match.winner?._id === match.team2?._id ? "team2" : "draw"}`}>
                                                🏆 {match.winner?.teamName || "Draw"}
                                            </span>
                                            <span>Round {match.round}, Match {match.matchNumber}</span>
                                            {match.notes && <span className="notes">📝 {match.notes}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="results-leaderboard">
                        {filterTournament ? (
                            leaderboard ? (
                                <div className="leaderboard-container">
                                    <div className="leaderboard-header">
                                        <h2>{leaderboard.tournamentName}</h2>
                                        <span className="leaderboard-game">{leaderboard.tournamentId ? "" : ""}</span>
                                    </div>
                                    <div className="leaderboard-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Rank</th>
                                                    <th>Team</th>
                                                    <th>Matches</th>
                                                    <th>Wins</th>
                                                    <th>Losses</th>
                                                    <th>Draws</th>
                                                    <th>Points</th>
                                                    <th>Score Diff</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaderboard.leaderboard.map((team, index) => (
                                                    <tr key={team.teamId} className={index < 3 ? "top-three" : ""}>
                                                        <td className="rank">
                                                            {index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${team.rank}`}
                                                        </td>
                                                        <td className="team-name">{team.teamName}</td>
                                                        <td>{team.matches}</td>
                                                        <td className="wins">{team.wins}</td>
                                                        <td className="losses">{team.losses}</td>
                                                        <td>{team.draws}</td>
                                                        <td className="points">{team.points}</td>
                                                        <td className="score-diff">
                                                            {team.scoreDifference > 0 ? "+" : ""}{team.scoreDifference}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="leaderboard-loading">
                                    <div className="spinner"></div>
                                    <p>Loading leaderboard...</p>
                                </div>
                            )
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🏆</div>
                                <h2>Select a Tournament</h2>
                                <p>Choose a tournament from the dropdown to view its leaderboard.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Results;