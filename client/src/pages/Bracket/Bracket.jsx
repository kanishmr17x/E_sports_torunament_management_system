import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { getTournamentById, getMatchesByTournament, getTournaments } from "../../api/apiRoutes";
import Breadcrumbs from "../../components/Breadcrumbs";
import "../../styles/theme.css";
import "../../styles/components.css";
import "../../styles/bracket.css";

const Bracket = () => {
    const { id: paramId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryId = searchParams.get("tournament");
    const activeTournamentId = paramId || queryId;

    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [allTournaments, setAllTournaments] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, [activeTournamentId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            // Also load tournament list for quick switcher
            const tourneyList = await getTournaments().catch(() => []);
            const validList = Array.isArray(tourneyList) ? tourneyList : [];
            setAllTournaments(validList);

            let targetId = activeTournamentId;
            if (!targetId && validList.length > 0) {
                targetId = validList[0]._id;
                setSearchParams({ tournament: targetId });
            }

            if (!targetId) {
                setLoading(false);
                return;
            }

            const [tourneyRes, matchesRes] = await Promise.all([
                getTournamentById(targetId),
                getMatchesByTournament(targetId)
            ]);
            setTournament(tourneyRes);
            setMatches(Array.isArray(matchesRes) ? matchesRes : []);
        } catch (err) {
            setError(err.message || "Failed to load tournament bracket");
        } finally {
            setLoading(false);
        }
    };

    // Group matches by round
    const rounds = {};
    matches.forEach(match => {
        const r = match.round || 1;
        if (!rounds[r]) {
            rounds[r] = [];
        }
        rounds[r].push(match);
    });

    const sortedRounds = Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b));

    sortedRounds.forEach(round => {
        rounds[round].sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
    });

    const handleTournamentSwitch = (newId) => {
        if (paramId) {
            navigate(`/tournaments/${newId}/bracket`);
        } else {
            setSearchParams({ tournament: newId });
        }
    };

    if (loading) {
        return (
            <div className="bracket-page loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Building elimination progression tree...</p>
                </div>
            </div>
        );
    }

    if (error && !tournament) {
        return (
            <div className="bracket-page error">
                <div className="error-card">
                    <h2>⚠️ Failed to Load Bracket</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate("/tournaments")} className="btn btn-primary">
                        Browse Tournaments
                    </button>
                </div>
            </div>
        );
    }

    const formatType = tournament?.format || tournament?.type || "Single Elimination";

    return (
        <div className="bracket-page-pro">
            <header className="bracket-header-pro">
                <div className="container">
                    <Breadcrumbs
                        items={[
                            { label: "Tournaments", to: "/tournaments" },
                            { label: tournament?.name || "Tournament", to: tournament?._id ? `/tournaments/${tournament._id}` : undefined },
                            { label: "Bracket Progression" }
                        ]}
                    />

                    <div className="bracket-header-main-row">
                        <div className="bracket-header-left">
                            <div className="bracket-badge-row">
                                <span className="bracket-game-chip">{tournament?.game || "Esports"}</span>
                                <span className={`bracket-status-chip ${tournament?.status}`}>
                                    {tournament?.status === "live" && <span className="live-dot-pulse" />}
                                    {(tournament?.status || "UPCOMING").toUpperCase().replace("_", " ")}
                                </span>
                                <span className="bracket-format-chip">
                                    {formatType.replace("_", " ").toUpperCase()}
                                </span>
                            </div>
                            <h1 className="bracket-title-pro">{tournament?.name || "Tournament Bracket"}</h1>
                            <p className="bracket-subtitle-pro">
                                Real-time tournament progression tree • Seed matchups, live scores, and path to grand final
                            </p>
                        </div>

                        <div className="bracket-header-right">
                            {allTournaments.length > 1 && (
                                <div className="bracket-switcher-wrap">
                                    <label htmlFor="b-switcher" className="switcher-lbl">SWITCH ARENA</label>
                                    <select
                                        id="b-switcher"
                                        value={tournament?._id || ""}
                                        onChange={(e) => handleTournamentSwitch(e.target.value)}
                                        className="bracket-switcher-select"
                                    >
                                        {allTournaments.map(t => (
                                            <option key={t._id} value={t._id}>
                                                {t.name} ({t.game})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {tournament?._id && (
                                <Link to={`/tournaments/${tournament._id}`} className="btn btn-outline btn-sm">
                                    Arena Details →
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="bracket-main-pro container">
                {sortedRounds.length === 0 ? (
                    <div className="empty-bracket-card">
                        <span className="empty-ico-lg">🏆</span>
                        <h2>Bracket In Preparation</h2>
                        <p>
                            Matches are being organized for this tournament. Once team registration closes,
                            the elimination tree will populate here automatically.
                        </p>
                        {tournament?._id && (
                            <Link to={`/tournament-registration/${tournament._id}`} className="btn btn-primary">
                                Register Your Team
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="bracket-tree-wrapper">
                        <div className="bracket-panning-container">
                            <div className="bracket-rounds-flex">
                                {sortedRounds.map((round, rIndex) => (
                                    <div key={round} className="bracket-round-column">
                                        <div className="bracket-round-header-pro">
                                            <span className="round-title-pro">
                                                {getRoundName(round, sortedRounds.length, rIndex)}
                                            </span>
                                            <span className="round-count-pro">
                                                {rounds[round].length} Match{rounds[round].length !== 1 ? "es" : ""}
                                            </span>
                                        </div>

                                        <div className="bracket-matches-stack">
                                            {rounds[round].map((match) => {
                                                const isLive = match.status === "live";
                                                const isDone = match.status === "completed";
                                                const team1Name = match.team1?.teamName || "TBD";
                                                const team2Name = match.team2?.teamName || "TBD";
                                                const score1 = match.team1Score ?? match.result?.scoreTeam1 ?? "-";
                                                const score2 = match.team2Score ?? match.result?.scoreTeam2 ?? "-";

                                                const isTeam1Winner = match.winner && (
                                                    (typeof match.winner === "object" && match.winner?._id === match.team1?._id) ||
                                                    match.winner === match.team1?._id ||
                                                    match.winner === team1Name
                                                );

                                                const isTeam2Winner = match.winner && (
                                                    (typeof match.winner === "object" && match.winner?._id === match.team2?._id) ||
                                                    match.winner === match.team2?._id ||
                                                    match.winner === team2Name
                                                );

                                                return (
                                                    <div
                                                        key={match._id}
                                                        className={`bracket-node-pro ${isLive ? "node-live" : isDone ? "node-done" : "node-scheduled"}`}
                                                    >
                                                        <div className="node-top-bar">
                                                            <span className="node-num">M#{match.matchNumber || 1}</span>
                                                            <span className={`node-status ${match.status}`}>
                                                                {isLive && <span className="live-dot-pulse" />}
                                                                {isLive ? "LIVE" : isDone ? "FINAL" : "READY"}
                                                            </span>
                                                        </div>

                                                        <div className="node-teams-slots">
                                                            {/* Team 1 Slot */}
                                                            <div className={`node-team-slot ${isTeam1Winner ? "winner-slot" : isDone ? "loser-slot" : ""}`}>
                                                                <div className="node-team-left">
                                                                    <div className="node-team-initial">
                                                                        {team1Name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="node-team-name" title={team1Name}>
                                                                        {team1Name}
                                                                    </span>
                                                                </div>
                                                                <span className="node-score-box">
                                                                    {score1}
                                                                </span>
                                                            </div>

                                                            {/* Team 2 Slot */}
                                                            <div className={`node-team-slot ${isTeam2Winner ? "winner-slot" : isDone ? "loser-slot" : ""}`}>
                                                                <div className="node-team-left">
                                                                    <div className="node-team-initial">
                                                                        {team2Name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="node-team-name" title={team2Name}>
                                                                        {team2Name}
                                                                    </span>
                                                                </div>
                                                                <span className="node-score-box">
                                                                    {score2}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {match.scheduledAt && (
                                                            <div className="node-footer">
                                                                <span>🕒 {new Date(match.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                                {match.winner && <span className="node-champ-crown">👑 Winner</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bracket Legend Strip */}
                <div className="bracket-legend-pro">
                    <span className="legend-label">CIRCUIT GUIDE:</span>
                    <div className="legend-chips-row">
                        <div className="legend-chip">
                            <span className="legend-indicator live" />
                            <span>Live Match</span>
                        </div>
                        <div className="legend-chip">
                            <span className="legend-indicator winner" />
                            <span>Winner Advanced</span>
                        </div>
                        <div className="legend-chip">
                            <span className="legend-indicator scheduled" />
                            <span>Scheduled Match</span>
                        </div>
                        <div className="legend-chip">
                            <span className="legend-indicator completed" />
                            <span>Match Concluded</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

function getRoundName(round, totalRounds) {
    const roundNum = parseInt(round);
    if (totalRounds === 1) return "Grand Finals";
    if (roundNum === totalRounds) return "Grand Championship";
    if (roundNum === totalRounds - 1) return "Semifinals";
    if (roundNum === totalRounds - 2) return "Quarterfinals";
    if (roundNum === 1) return "Round of 16";
    return `Elimination Round ${roundNum}`;
}

export default Bracket;
