import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllLeaderboards, getLeaderboard } from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import Breadcrumbs from "../../components/Breadcrumbs";
import "../../styles/theme.css";
import "../../styles/components.css";
import "../../styles/leaderboard.css";

const Leaderboard = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [allLeaderboards, setAllLeaderboards] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [selectedLeaderboard, setSelectedLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }
        loadAllLeaderboards();
    }, [user, authLoading]);

    const loadAllLeaderboards = async () => {
        try {
            setLoading(true);
            const res = await getAllLeaderboards();
            const list = Array.isArray(res) ? res : [];
            setAllLeaderboards(list);
            if (list.length > 0 && !selectedTournament) {
                setSelectedTournament(list[0].tournamentId);
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
            <div className="leaderboard-page-pro loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Calculating circuit standings &amp; telemetry...</p>
                </div>
            </div>
        );
    }

    const leaderboardItems = selectedLeaderboard?.leaderboard || [];
    const topThree = leaderboardItems.slice(0, 3);

    return (
        <div className="leaderboard-page-pro">
            <header className="leaderboard-header-pro">
                <div className="container">
                    <Breadcrumbs items={[{ label: "Circuit Standings & Leaderboards" }]} />
                    <div className="leaderboard-header-row">
                        <div>
                            <span className="leaderboard-kicker">COMPETITIVE INTEGRITY RANKINGS</span>
                            <h1 className="leaderboard-title-pro">🏆 Global Circuit Leaderboard</h1>
                            <p className="leaderboard-subtitle-pro">
                                Verified tournament rankings, win/loss telemetry, head-to-head records, and points distribution
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="leaderboard-main-pro container">
                {error && <div className="alert alert-error">{error}</div>}

                {!user ? (
                    <div className="standings-placeholder-card" style={{ padding: "64px 24px", textAlign: "center", maxWidth: "600px", margin: "40px auto" }}>
                        <span className="empty-ico-lg">🔒</span>
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "var(--text-primary)" }}>Sign In to View Circuit Standings</h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "24px", lineHeight: "1.6" }}>
                            Live esports circuit telemetry, team rankings, points distribution, and official win/loss records require an authenticated player or organizer account.
                        </p>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => navigate("/login")}
                            style={{ margin: "0 auto", padding: "12px 32px" }}
                        >
                            Sign In to Arena
                        </button>
                    </div>
                ) : (
                    <div className="leaderboard-grid-layout">
                        {/* LEFT COLUMN: TOURNAMENTS SELECTOR SIDEBAR */}
                        <aside className="leaderboard-sidebar-pro">
                            <div className="sidebar-header-pro">
                                <span className="sidebar-lbl">SELECT ARENA</span>
                                <h3>Tournaments ({allLeaderboards.length})</h3>
                            </div>

                            <div className="tournaments-selector-list">
                                {allLeaderboards.length === 0 ? (
                                    <p className="side-empty-p">No active tournament records</p>
                                ) : (
                                    allLeaderboards.map(t => (
                                        <button
                                            key={t.tournamentId}
                                            type="button"
                                            className={`tourney-select-btn ${selectedTournament === t.tournamentId ? "active" : ""}`}
                                            onClick={() => setSelectedTournament(t.tournamentId)}
                                        >
                                            <div className="tourney-btn-left">
                                                <span className="tourney-btn-title">{t.tournamentName}</span>
                                                <div className="tourney-btn-meta">
                                                    <span className="tourney-btn-game">{t.game || "Esports"}</span>
                                                    <span className={`status-badge-mini ${t.status}`}>{t.status}</span>
                                                </div>
                                            </div>
                                            <span className="tourney-btn-count">
                                                {t.leaderboard?.length || 0} Squads
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </aside>

                        {/* RIGHT COLUMN: MAIN STANDINGS PANEL */}
                        <div className="leaderboard-content-pro">
                            {selectedLeaderboard ? (
                                <div className="standings-card-pro">
                                    <div className="standings-card-header">
                                        <div>
                                            <span className="standings-eyebrow">STANDINGS LOG</span>
                                            <h2 className="standings-tourney-name">{selectedLeaderboard.tournamentName}</h2>
                                        </div>
                                        <span className="standings-count-badge">
                                            📊 {leaderboardItems.length} Teams Ranked
                                        </span>
                                    </div>

                                    {/* TOP 3 PODIUM SECTION (When teams >= 3) */}
                                    {topThree.length >= 3 && (
                                        <div className="podium-showcase-pro">
                                            {/* 2nd Place: Silver */}
                                            <div className="podium-pillar rank-2">
                                                <div className="podium-avatar silver">
                                                    🥈
                                                </div>
                                                <span className="podium-rank-tag">2ND PLACE</span>
                                                <h4 className="podium-team-name">{topThree[1].teamName}</h4>
                                                <span className="podium-pts">{topThree[1].points} PTS</span>
                                                <span className="podium-record">{topThree[1].wins}W - {topThree[1].losses}L</span>
                                            </div>

                                            {/* 1st Place: Champion Gold */}
                                            <div className="podium-pillar rank-1">
                                                <div className="podium-crown">👑</div>
                                                <div className="podium-avatar gold">
                                                    🥇
                                                </div>
                                                <span className="podium-rank-tag gold">CHAMPION</span>
                                                <h4 className="podium-team-name gold">{topThree[0].teamName}</h4>
                                                <span className="podium-pts gold">{topThree[0].points} PTS</span>
                                                <span className="podium-record">{topThree[0].wins}W - {topThree[0].losses}L</span>
                                            </div>

                                            {/* 3rd Place: Bronze */}
                                            <div className="podium-pillar rank-3">
                                                <div className="podium-avatar bronze">
                                                    🥉
                                                </div>
                                                <span className="podium-rank-tag">3RD PLACE</span>
                                                <h4 className="podium-team-name">{topThree[2].teamName}</h4>
                                                <span className="podium-pts">{topThree[2].points} PTS</span>
                                                <span className="podium-record">{topThree[2].wins}W - {topThree[2].losses}L</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* FULL STANDINGS DATA TABLE */}
                                    <div className="standings-table-wrapper">
                                        <table className="standings-table-pro">
                                            <thead>
                                                <tr>
                                                    <th className="th-rank">Rank</th>
                                                    <th className="th-team">Squad / Team</th>
                                                    <th className="th-stat">Matches</th>
                                                    <th className="th-stat">Wins</th>
                                                    <th className="th-stat">Losses</th>
                                                    <th className="th-stat">Draws</th>
                                                    <th className="th-stat th-pts">Points</th>
                                                    <th className="th-stat">Diff</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaderboardItems.map((team, index) => {
                                                    const isTop1 = index === 0;
                                                    const isTop3 = index < 3;
                                                    return (
                                                        <tr key={team.teamId || index} className={`standings-row ${isTop1 ? "row-champion" : isTop3 ? "row-podium" : ""}`}>
                                                            <td className="td-rank">
                                                                {index === 0 && <span className="rank-medal gold">🥇 1</span>}
                                                                {index === 1 && <span className="rank-medal silver">🥈 2</span>}
                                                                {index === 2 && <span className="rank-medal bronze">🥉 3</span>}
                                                                {index >= 3 && <span className="rank-num">#{team.rank || index + 1}</span>}
                                                            </td>
                                                            <td className="td-team">
                                                                <div className="team-cell-wrap">
                                                                    <div className="team-cell-initial">
                                                                        {team.teamName ? team.teamName.charAt(0).toUpperCase() : "T"}
                                                                    </div>
                                                                    <span className="team-cell-name">{team.teamName}</span>
                                                                </div>
                                                            </td>
                                                            <td className="td-stat">{team.matches}</td>
                                                            <td className="td-stat win-num">{team.wins}</td>
                                                            <td className="td-stat loss-num">{team.losses}</td>
                                                            <td className="td-stat">{team.draws}</td>
                                                            <td className="td-stat td-pts-val">{team.points}</td>
                                                            <td className="td-stat td-diff">
                                                                <span className={team.scoreDifference > 0 ? "diff-pos" : team.scoreDifference < 0 ? "diff-neg" : ""}>
                                                                    {team.scoreDifference > 0 ? `+${team.scoreDifference}` : team.scoreDifference}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {leaderboardItems.length === 0 && (
                                        <div className="empty-standings-box">
                                            <span className="empty-ico">📊</span>
                                            <h3>No Match Standings Recorded</h3>
                                            <p>Match results have not yet been logged for this tournament.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="standings-placeholder-card">
                                    <span className="empty-ico-lg">🏆</span>
                                    <h3>Select a Tournament</h3>
                                    <p>Choose an arena from the left sidebar to view its full circuit standings.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Leaderboard;
