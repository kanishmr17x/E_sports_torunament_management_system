import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTournamentById, getMatchesByTournament } from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/theme.css";
import "../../styles/bracket.css";

const Bracket = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        try {
            setLoading(true);
            const [tourneyRes, matchesRes] = await Promise.all([
                getTournamentById(id),
                getMatchesByTournament(id)
            ]);
            setTournament(tourneyRes);
            setMatches(matchesRes);
        } catch (err) {
            setError(err.message || "Failed to load bracket");
        } finally {
            setLoading(false);
        }
    };

    // Group matches by round
    const rounds = {};
    matches.forEach(match => {
        if (!rounds[match.round]) {
            rounds[match.round] = [];
        }
        rounds[match.round].push(match);
    });

    // Sort rounds
    const sortedRounds = Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b));

    // Sort matches within each round
    sortedRounds.forEach(round => {
        rounds[round].sort((a, b) => a.matchNumber - b.matchNumber);
    });

    if (loading) {
        return (
            <div className="bracket-page loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Loading bracket...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bracket-page error">
                <div className="error-card">
                    <h2>⚠️ Failed to Load Bracket</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate("/tournaments")} className="btn btn-primary">Back to Tournaments</button>
                </div>
            </div>
        );
    }

    const formatType = tournament?.format || "single_elimination";

    return (
        <div className="bracket-page">
            <header className="bracket-header">
                <div className="header-content">
                    <div className="tournament-info">
                        <span className="tournament-game">{tournament?.game}</span>
                        <h1>{tournament?.name}</h1>
                        <div className="tournament-meta">
                            <span className={`status-badge ${tournament?.status}`}>
                                {tournament?.status?.replace("_", " ")}
                            </span>
                            <span>Format: {formatType.replace("_", " ")}</span>
                            <span>Teams: {tournament?.teams?.length || 0}/{tournament?.maxTeams}</span>
                        </div>
                    </div>
                    <button onClick={() => navigate(`/tournaments/${id}`)} className="btn btn-outline">
                        ← Tournament Details
                    </button>
                </div>
            </header>

            <main className="bracket-main">
                {error && <div className="alert alert-error">{error}</div>}

                {sortedRounds.length === 0 ? (
                    <div className="empty-bracket">
                        <div className="empty-icon">🏆</div>
                        <h2>Bracket Not Generated</h2>
                        <p>Matches haven't been scheduled yet. The bracket will appear once matches are created.</p>
                    </div>
                ) : (
                    <div className="bracket-container">
                        <div className="bracket-header-row">
                            {sortedRounds.map((round, index) => (
                                <div key={round} className="bracket-round-header">
                                    <span className="round-label">
                                        {getRoundName(round, sortedRounds.length, index)}
                                    </span>
                                    <span className="round-match-count">
                                        {rounds[round].length} match{rounds[round].length !== 1 ? "es" : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="bracket-rounds">
                            {sortedRounds.map((round, _roundIndex) => (
                                <div key={round} className="bracket-round">
                                    {rounds[round].map((match, matchIndex) => (
                                        <div
                                            key={match._id}
                                            className={`bracket-match ${match.status}`}
                                            style={{ 
                                                '--match-index': matchIndex,
                                                '--total-matches': rounds[round].length
                                            }}
                                        >
                                            <div className="match-info">
                                                <div className="match-number">Match {match.matchNumber}</div>
                                                <div className="match-status">{match.status}</div>
                                            </div>
                                            <div className="match-teams">
                                                <div className="team-slot team1">
                                                    <span className="team-name">{match.team1?.teamName || "TBD"}</span>
                                                    <span className="team-score">{match.team1Score !== undefined ? match.team1Score : ""}</span>
                                                </div>
                                                <div className="vs">vs</div>
                                                <div className="team-slot team2">
                                                    <span className="team-name">{match.team2?.teamName || "TBD"}</span>
                                                    <span className="team-score">{match.team2Score !== undefined ? match.team2Score : ""}</span>
                                                </div>
                                            </div>
                                            <div className="match-details">
                                                {match.scheduledAt && (
                                                    <span className="match-time">
                                                        📅 {new Date(match.scheduledAt).toLocaleString()}
                                                    </span>
                                                )}
                                                {match.winner && (
                                                    <span className="winner-badge">
                                                        🏆 {match.winner.teamName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bracket-legend">
                    <h3>Legend</h3>
                    <div className="legend-items">
                        <div className="legend-item">
                            <span className="legend-color scheduled"></span>
                            <span>Scheduled</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color live"></span>
                            <span>Live</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color completed"></span>
                            <span>Completed</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color cancelled"></span>
                            <span>Cancelled</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

function getRoundName(round, totalRounds, _index) {
    const roundNum = parseInt(round);
    if (totalRounds === 1) return "Final";
    if (roundNum === totalRounds) return "Final";
    if (roundNum === totalRounds - 1) return "Semi-Finals";
    if (roundNum === totalRounds - 2) return "Quarter-Finals";
    if (roundNum === 1) return "Round 1";
    return `Round ${roundNum}`;
}

export default Bracket;