import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatDateTimeIST } from "../utils/formatters";

/**
 * MatchCard — Esports Versus Match Component
 * Displays:
 *  - Team 1 vs Team 2
 *  - Scheduled start time or Live Pulse
 *  - Tournament attribution
 *  - Scores (when available)
 *  - Action link to Match / Bracket
 */
const MatchCard = ({
  match,
  variant = "standard", // "standard" | "compact" | "ticker"
  className = ""
}) => {
  if (!match) return null;

  const {
    _id,
    tournamentId,
    team1,
    team2,
    status = "scheduled",
    scheduledAt,
    round,
    matchNumber,
    result,
    winner
  } = match;

  const tournamentName = typeof tournamentId === "object" ? tournamentId?.name : "Tournament";
  const tournamentGame = typeof tournamentId === "object" ? tournamentId?.game : "";

  const team1Name = typeof team1 === "object" ? (team1?.teamName || "TBD") : (team1 || "TBD");
  const team2Name = typeof team2 === "object" ? (team2?.teamName || "TBD") : (team2 || "TBD");

  const score1 = result?.scoreTeam1 ?? "-";
  const score2 = result?.scoreTeam2 ?? "-";

  const isLive = status === "live";
  const isCompleted = status === "completed";

  const formattedTime = scheduledAt
    ? formatDateTimeIST(scheduledAt)
    : "Schedule TBD";

  const isTeam1Winner = winner && (
    (typeof winner === "object" && winner?._id === team1?._id) ||
    winner === team1?._id ||
    winner === team1Name
  );

  const isTeam2Winner = winner && (
    (typeof winner === "object" && winner?._id === team2?._id) ||
    winner === team2?._id ||
    winner === team2Name
  );

  // Ticker variant for landing page strip
  if (variant === "ticker") {
    return (
      <div className={`match-card-ticker ${isLive ? "live" : ""} ${className}`}>
        <div className="ticker-top">
          <span className="ticker-game">{tournamentGame || "ARENA"}</span>
          <span className={`ticker-status ${status}`}>
            {isLive && <span className="live-dot-pulse" />}
            {isLive ? "LIVE" : isCompleted ? "FINAL" : "UPCOMING"}
          </span>
        </div>
        <div className="ticker-matchup">
          <div className={`ticker-team ${isTeam1Winner ? "winner" : ""}`}>
            <span className="ticker-team-name">{team1Name}</span>
            {isCompleted && <span className="ticker-score">{score1}</span>}
          </div>
          <span className="ticker-vs">VS</span>
          <div className={`ticker-team ${isTeam2Winner ? "winner" : ""}`}>
            <span className="ticker-team-name">{team2Name}</span>
            {isCompleted && <span className="ticker-score">{score2}</span>}
          </div>
        </div>
      </div>
    );
  }

  // Standard match card
  return (
    <article className={`match-card-pro ${isLive ? "live" : isCompleted ? "completed" : "scheduled"} ${className}`}>
      <div className="match-card-top-bar">
        <div className="match-tourney-info">
          <span className="match-tourney-name">{tournamentName}</span>
          {tournamentGame && <span className="match-game-tag">{tournamentGame}</span>}
        </div>
        <span className={`match-status-badge ${status}`}>
          {isLive && <span className="live-dot-pulse" />}
          {isLive ? "LIVE" : isCompleted ? "FINISHED" : "SCHEDULED"}
        </span>
      </div>

      <div className="match-versus-arena">
        {/* Team 1 */}
        <div className={`match-team-block left ${isTeam1Winner ? "winner" : ""}`}>
          <div className="team-avatar-square">
            {team1Name.charAt(0).toUpperCase()}
          </div>
          <div className="team-meta-col">
            <span className="team-display-name">{team1Name}</span>
            {isTeam1Winner && <span className="winner-crown">👑 WINNER</span>}
          </div>
          {isCompleted && <div className="match-score-pill">{score1}</div>}
        </div>

        {/* Center Divider / Scores */}
        <div className="match-center-split">
          {isCompleted ? (
            <div className="final-score-display">
              <span className="score-num">{score1}</span>
              <span className="score-colon">:</span>
              <span className="score-num">{score2}</span>
            </div>
          ) : (
            <div className="vs-badge">VS</div>
          )}
          <span className="match-round-lbl">
            Round {round || 1} • M#{matchNumber || 1}
          </span>
        </div>

        {/* Team 2 */}
        <div className={`match-team-block right ${isTeam2Winner ? "winner" : ""}`}>
          {isCompleted && <div className="match-score-pill">{score2}</div>}
          <div className="team-meta-col">
            <span className="team-display-name">{team2Name}</span>
            {isTeam2Winner && <span className="winner-crown">👑 WINNER</span>}
          </div>
          <div className="team-avatar-square">
            {team2Name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="match-card-footer">
        <div className="match-time-info">
          <span>🕒 {formattedTime}</span>
        </div>
        <div className="match-footer-actions">
          {tournamentId && (
            <Link
              to={`/bracket?tournament=${typeof tournamentId === "object" ? tournamentId._id : tournamentId}`}
              className="btn btn-outline btn-sm"
            >
              Bracket
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

MatchCard.propTypes = {
  match: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(["standard", "compact", "ticker"]),
  className: PropTypes.string
};

export default MatchCard;
