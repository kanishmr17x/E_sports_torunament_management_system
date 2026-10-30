import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUpcomingMatches, getCompletedMatches, getMatchesByTournament } from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/theme.css";
import "../../styles/matches.css";

const Matches = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("upcoming");
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [completedMatches, setCompletedMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterTournament, setFilterTournament] = useState("");

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        try {
            setLoading(true);
            const [upcomingRes, completedRes] = await Promise.all([
                getUpcomingMatches(),
                getCompletedMatches({ limit: 100 })
            ]);
            setUpcomingMatches(upcomingRes);
            setCompletedMatches(completedRes);
        } catch (err) {
            setError(err.message || "Failed to load matches");
        } finally {
            setLoading(false);
        }
    };

    const filteredUpcoming = filterTournament
        ? upcomingMatches.filter(m => m.tournamentId?._id === filterTournament || m.tournamentId === filterTournament)
        : upcomingMatches;

    const filteredCompleted = filterTournament
        ? completedMatches.filter(m => m.tournamentId?._id === filterTournament || m.tournamentId === filterTournament)
        : completedMatches;

    const tournaments = [...new Set([
        ...upcomingMatches.map(m => m.tournamentId).filter(Boolean),
        ...completedMatches.map(m => m.tournamentId).filter(Boolean)
    ])].map(t => typeof t === "object" ? t : { _id: t }).filter((t, i, arr) => 
        arr.findIndex(x => x._id === t._id) === i
    );

    if (loading) {
        return (
            <div className="matches-page loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Loading matches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="matches-page">
            <header className="matches-header">
                <div className="header-content">
                    <div>
                        <h1>📅 Match Schedule</h1>
                        <p className="subtitle">View upcoming and completed matches</p>
                    </div>
                    <div className="header-filters">
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
                    </div>
                </div>
            </header>

            <div className="matches-tabs">
                <button
                    className={`tab ${activeTab === "upcoming" ? "active" : ""}`}
                    onClick={() => setActiveTab("upcoming")}
                >
                    Upcoming Matches ({filteredUpcoming.length})
                </button>
                <button
                    className={`tab ${activeTab === "completed" ? "active" : ""}`}
                    onClick={() => setActiveTab("completed")}
                >
                    Completed Matches ({filteredCompleted.length})
                </button>
            </div>

            <main className="matches-main">
                {error && <div className="alert alert-error">{error}</div>}

                {activeTab === "upcoming" ? (
                    <div className="matches-list">
                        {filteredUpcoming.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📅</div>
                                <h2>No Upcoming Matches</h2>
                                <p>No matches scheduled at the moment.</p>
                            </div>
                        ) : (
                            filteredUpcoming.map(match => (
                                <div key={match._id} className="match-card upcoming">
                                    <div className="match-card-header">
                                        <div className="match-tournament">
                                            <span className="tournament-name">{match.tournamentId?.name || "Tournament"}</span>
                                            <span className="tournament-game">{match.tournamentId?.game}</span>
                                        </div>
                                        <span className={`status-badge ${match.status}`}>{match.status}</span>
                                    </div>
                                    <div className="match-teams">
                                        <div className="team">
                                            <span className="team-name">{match.team1?.teamName || "TBD"}</span>
                                            <span className="team-game">{match.team1?.game}</span>
                                        </div>
                                        <div className="vs">vs</div>
                                        <div className="team">
                                            <span className="team-name">{match.team2?.teamName || "TBD"}</span>
                                            <span className="team-game">{match.team2?.game}</span>
                                        </div>
                                    </div>
                                    <div className="match-meta">
                                        <span>📅 {match.scheduledAt ? new Date(match.scheduledAt).toLocaleString() : "TBD"}</span>
                                        <span>🏆 Round {match.round}, Match {match.matchNumber}</span>
                                        {match.venue && <span>📍 {match.venue}</span>}
                                        {match.serverInfo && <span>🖥️ {match.serverInfo}</span>}
                                    </div>
                                    <div className="match-actions">
                                        {match.status === "live" && (
                                            <button className="btn btn-primary btn-sm">Watch Live</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="matches-list">
                        {filteredCompleted.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🏁</div>
                                <h2>No Completed Matches</h2>
                                <p>No matches have been completed yet.</p>
                            </div>
                        ) : (
                            filteredCompleted.map(match => (
                                <div key={match._id} className="match-card completed">
                                    <div className="match-card-header">
                                        <div className="match-tournament">
                                            <span className="tournament-name">{match.tournamentId?.name || "Tournament"}</span>
                                            <span className="tournament-game">{match.tournamentId?.game}</span>
                                        </div>
                                        <span className="status-badge completed">Completed</span>
                                    </div>
                                    <div className="match-result">
                                        <div className="team">
                                            <span className="team-name">{match.team1?.teamName || "TBD"}</span>
                                        </div>
                                        <div className="score">
                                            <span className="team1-score">{match.team1Score}</span>
                                            <span className="separator">-</span>
                                            <span className="team2-score">{match.team2Score}</span>
                                        </div>
                                        <div className="team">
                                            <span className="team-name">{match.team2?.teamName || "TBD"}</span>
                                        </div>
                                    </div>
                                    <div className="match-meta">
                                        <span>🏆 Winner: {match.winner?.teamName || "Draw"}</span>
                                        <span>📅 {match.scheduledAt ? new Date(match.scheduledAt).toLocaleDateString() : "TBD"}</span>
                                        <span>🏆 Round {match.round}, Match {match.matchNumber}</span>
                                    </div>
                                    {match.notes && (
                                        <div className="match-notes">
                                            <strong>Notes:</strong> {match.notes}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Matches;