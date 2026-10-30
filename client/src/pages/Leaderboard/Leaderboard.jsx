import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllLeaderboards, getLeaderboard } from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/theme.css";
import "../../styles/leaderboard.css";

const Leaderboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [allLeaderboards, setAllLeaderboards] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [selectedLeaderboard, setSelectedLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAllLeaderboards();
    }, []);

    const loadAllLeaderboards = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        try {
            setLoading(true);
            const res = await getAllLeaderboards();
            setAllLeaderboards(res);
            if (res.length > 0 && !selectedTournament) {
                setSelectedTournament(res[0].tournamentId);
            }
        } catch (err) {
            setError(err.message || "Failed to load leaderboards");
        } finally {
            setLoading(false);
        }
    };

    const loadTournamentLeaderboard = async (tournamentId) => {
        try {
            const res = await getLeaderboard(tournamentId);
            setSelectedLeaderboard(res);
        } catch (err) {
            console.error("Failed to load leaderboard:", err);
        }
    };

    useEffect(() => {
        if (selectedTournament) {
            loadTournamentLeaderboard(selectedTournament);
        }
    }, [selectedTournament]);

    if (loading) {
        return (
            <div className="leaderboard-page loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Loading leaderboards...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard-page">
            <header className="leaderboard-header">
                <div className="header-content">
                    <div>
                        <h1>🏆 Leaderboards</h1>
                        <p className="subtitle">Tournament standings and team rankings</p>
                    </div>
                </div>
            </header>

            <main className="leaderboard-main">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="leaderboard-layout">
                    <aside className="tournaments-sidebar">
                        <div className="sidebar-header">
                            <h2>Tournaments</h2>
                        </div>
                        <div className="tournaments-list">
                            {allLeaderboards.length === 0 ? (
                                <p className="empty-state">No tournament data available</p>
                            ) : (
                                allLeaderboards.map(tournament => (
                                    <button
                                        key={tournament.tournamentId}
                                        className={`tournament-item ${selectedTournament === tournament.tournamentId ? "active" : ""}`}
                                        onClick={() => setSelectedTournament(tournament.tournamentId)}
                                    >
                                        <div className="tournament-info">
                                            <span className="tournament-name">{tournament.tournamentName}</span>
                                            <span className="tournament-game">{tournament.game}</span>
                                            <span className={`status-badge ${tournament.status}`}>{tournament.status}</span>
                                        </div>
                                        <span className="team-count">{tournament.leaderboard.length} teams</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </aside>

                    <div className="leaderboard-content">
                        {selectedLeaderboard ? (
                            <div className="leaderboard-container">
                                <div className="leaderboard-header">
                                    <h2>{selectedLeaderboard.tournamentName}</h2>
                                    <div className="leaderboard-meta">
                                        <span className="leaderboard-game">{selectedLeaderboard.tournamentId ? "" : ""}</span>
                                        <span>📊 {selectedLeaderboard.leaderboard.length} teams ranked</span>
                                    </div>
                                </div>
                                <div className="leaderboard-table-wrapper">
                                    <table className="leaderboard-table">
                                        <thead>
                                            <tr>
                                                <th>Rank</th>
                                                <th>Team</th>
                                                <th>M</th>
                                                <th>W</th>
                                                <th>L</th>
                                                <th>D</th>
                                                <th>Pts</th>
                                                <th>+/-</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedLeaderboard.leaderboard.map((team, index) => (
                                                <tr key={team.teamId} className={index < 3 ? "top-three" : ""}>
                                                    <td className="rank">
                                                        {index === 0 && "🥇"}
                                                        {index === 1 && "🥈"}
                                                        {index === 2 && "🥉"}
                                                        {index >= 3 && `#${team.rank}`}
                                                    </td>
                                                    <td className="team-cell">
                                                        <div className="team-name">{team.teamName}</div></td>
                                                    <td className="matches">{team.matches}</td>
                                                    <td className="wins">{team.wins}</td>
                                                    <td className="losses">{team.losses}</td>
                                                    <td className="draws">{team.draws}</td>
                                                    <td className="points">{team.points}</td>
                                                    <td className="score-diff">
                                                        {team.scoreDifference > 0 ? "+" : ""}{team.scoreDifference}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {selectedLeaderboard.leaderboard.length === 0 && (
                                    <div className="empty-leaderboard">
                                        <p>No match data available for this tournament yet.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="leaderboard-placeholder">
                                <div className="empty-icon">🏆</div>
                                <h2>Select a Tournament</h2>
                                <p>Choose a tournament from the sidebar to view its leaderboard.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Leaderboard;