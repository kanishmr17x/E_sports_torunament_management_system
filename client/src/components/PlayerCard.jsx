import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const PlayerCard = ({
  player,
  isAdmin = false,
  onDelete = null,
}) => {
  if (!player) return null;

  const initial = player.playerName ? player.playerName.charAt(0).toUpperCase() : "P";
  const teamName = player.teamId 
    ? (typeof player.teamId === "object" ? player.teamId.teamName : "Assigned Squad")
    : null;

  return (
    <article className="player-card-cyber">
      {/* Header with Avatar and Role Chip */}
      <div className="player-card-header">
        <div className="player-avatar-wrapper">
          <div className="player-avatar-ring">
            <span className="player-avatar-glyph">{initial}</span>
          </div>
          <span className="player-active-dot" title="Active Competitor" />
        </div>

        <div className="player-header-meta">
          <span className="player-role-badge">
            {player.role || "Competitor"}
          </span>
          <span className="player-game-chip">
            🎮 {player.gameId || "BGMI"}
          </span>
        </div>
      </div>

      {/* Athlete Information */}
      <div className="player-card-body">
        <h3 className="player-ign">
          <Link to={`/players/${player._id}`} className="player-ign-link">
            {player.playerName}
          </Link>
        </h3>

        <div className="player-squad-callout">
          {teamName ? (
            <span className="player-squad-tag">
              🛡️ {teamName}
            </span>
          ) : (
            <span className="player-free-agent-tag">
              ⚡ Free Agent
            </span>
          )}
        </div>

        <div className="player-details-grid">
          <div className="player-detail-item">
            <span className="player-detail-lbl">Age</span>
            <span className="player-detail-val">{player.age || "—"}</span>
          </div>
          <div className="player-detail-item">
            <span className="player-detail-lbl">Status</span>
            <span className="player-detail-val highlight">Verified</span>
          </div>
          <div className="player-detail-item">
            <span className="player-detail-lbl">Contact</span>
            <span className="player-detail-val">{player.contact ? "Provided" : "Private"}</span>
          </div>
        </div>
      </div>

      {/* Footer CTAs */}
      <div className="player-card-footer">
        <Link to={`/players/${player._id}`} className="btn btn-outline btn-sm player-profile-btn">
          👁️ Athlete Dossier
        </Link>
        
        {isAdmin && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(player._id, player.playerName)}
            className="btn btn-danger-subtle btn-sm player-del-btn"
            title="Delete Athlete"
          >
            🗑️
          </button>
        )}
      </div>
    </article>
  );
};

PlayerCard.propTypes = {
  player: PropTypes.shape({
    _id: PropTypes.string,
    playerName: PropTypes.string,
    gameId: PropTypes.string,
    role: PropTypes.string,
    age: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    contact: PropTypes.string,
    teamId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
  isAdmin: PropTypes.bool,
  onDelete: PropTypes.func,
};

export default PlayerCard;
