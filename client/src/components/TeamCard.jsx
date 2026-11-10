import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const TeamCard = ({
  team,
  isAdmin = false,
  onDelete = null,
  variant = "default",
}) => {
  if (!team) return null;

  const initial = team.teamName ? team.teamName.charAt(0).toUpperCase() : "T";
  const wins = team.wins || 0;
  const losses = team.losses || 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const members = team.totalMembers || (Array.isArray(team.members) ? team.members.length : 0);

  if (variant === "horizontal") {
    return (
      <div className="team-card-horizontal">
        <div className="team-h-avatar">
          {team.logo ? (
            <img src={team.logo} alt={team.teamName} />
          ) : (
            <span className="team-initial">{initial}</span>
          )}
        </div>

        <div className="team-h-info">
          <div className="team-h-name-row">
            <h4 className="team-h-name">{team.teamName}</h4>
            <span className="team-game-tag">🎮 {team.game || "Multi-Title"}</span>
          </div>
          <div className="team-h-stats">
            <span><strong>{members}</strong> Athletes</span>
            <span>•</span>
            <span className="team-stat-wr">{winRate}% WR</span>
            <span>•</span>
            <span className="team-stat-wl">{wins}W - {losses}L</span>
          </div>
        </div>

        <div className="team-h-actions">
          <Link to={`/teams/${team._id}`} className="btn btn-outline btn-xs">
            Dossier →
          </Link>
          <Link to={`/tournaments?team=${team._id}`} className="btn btn-primary btn-xs">
            Deploy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="team-card-cyber">
      {/* Visual Header / Avatar Banner */}
      <div className="team-card-banner">
        <div className="team-avatar-container">
          {team.logo ? (
            <img src={team.logo} alt={team.teamName} className="team-avatar-img" />
          ) : (
            <span className="team-avatar-initial">{initial}</span>
          )}
        </div>
        <div className="team-badge-stack">
          <span className="team-game-chip">🎮 {team.game || "BGMI"}</span>
          <span className={`team-status-chip ${team.status ? team.status.toLowerCase() : "active"}`}>
            {team.status || "Active"}
          </span>
        </div>
      </div>

      {/* Body Information */}
      <div className="team-card-body">
        <h3 className="team-card-title">
          <Link to={`/teams/${team._id}`} className="team-card-title-link">
            {team.teamName}
          </Link>
        </h3>
        
        {team.description ? (
          <p className="team-card-desc">{team.description}</p>
        ) : (
          <p className="team-card-desc-muted">Elite competitive squad vying for championship ranking.</p>
        )}

        {/* Telemetry Strip */}
        <div className="team-telemetry-grid">
          <div className="team-telemetry-item">
            <span className="team-telemetry-label">Roster</span>
            <span className="team-telemetry-value">{members}</span>
          </div>
          <div className="team-telemetry-item">
            <span className="team-telemetry-label">Win/Loss</span>
            <span className="team-telemetry-value">{wins} / {losses}</span>
          </div>
          <div className="team-telemetry-item">
            <span className="team-telemetry-label">Win Ratio</span>
            <span className="team-telemetry-value highlight">{winRate}%</span>
          </div>
        </div>

        {/* Win Ratio Progress Bar */}
        <div className="team-winrate-bar-track">
          <div
            className="team-winrate-bar-fill"
            style={{ width: `${Math.max(winRate, 5)}%` }}
            title={`Win rate: ${winRate}%`}
          />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="team-card-footer">
        <div className="team-footer-ctas">
          <Link to={`/teams/${team._id}`} className="btn btn-outline btn-sm">
            👁️ Dossier
          </Link>
          <Link to={`/tournaments?teamId=${team._id}`} className="btn btn-primary btn-sm">
            ⚡ Register
          </Link>
        </div>

        {isAdmin && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(team._id, team.teamName)}
            className="btn btn-danger-subtle btn-sm team-del-btn"
            title="Delete Squad"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </article>
  );
};

TeamCard.propTypes = {
  team: PropTypes.shape({
    _id: PropTypes.string,
    teamName: PropTypes.string,
    game: PropTypes.string,
    totalMembers: PropTypes.number,
    members: PropTypes.array,
    wins: PropTypes.number,
    losses: PropTypes.number,
    status: PropTypes.string,
    logo: PropTypes.string,
    description: PropTypes.string,
  }),
  isAdmin: PropTypes.bool,
  onDelete: PropTypes.func,
  variant: PropTypes.oneOf(["default", "compact", "horizontal"]),
};

export default TeamCard;
