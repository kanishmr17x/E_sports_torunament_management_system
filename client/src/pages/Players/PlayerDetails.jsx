import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlayerById } from "../../api/apiRoutes";
import "../../styles/theme.css";
import "../../styles/teams.css";

const PlayerDetails = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const response = await getPlayerById(id);
        const playerData = response.success ? response.data : response;
        setPlayer(playerData);
      } catch (err) {
        setError(err.message || "Failed to fetch player dossier");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="teams-page">
        <div className="teams-container">
          <div className="loading-state">
            <div className="loading-spinner" />
            <p className="loading-text">Loading player dossier...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="teams-page">
        <div className="teams-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Player Not Found</h2>
            <p className="error-text">{error || `Player with ID ${id} was not found.`}</p>
            <Link to="/players" className="retry-btn" style={{ textDecoration: "none", display: "inline-block" }}>
              ← Return to Players
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initial = player.playerName ? player.playerName.charAt(0).toUpperCase() : "P";

  return (
    <div className="player-details-page">
      <section className="teams-banner">
        <div className="teams-banner-overlay" />
        <div className="teams-banner-content">
          <h1 className="teams-banner-title">{player.playerName}</h1>
          <p className="teams-banner-subtitle">Esports Athlete Dossier</p>
        </div>
      </section>

      <div className="team-details-container">
        {/* Player Profile Card */}
        <div className="team-hero-card">
          <div className="team-hero-header">
            <div className="team-avatar-large">
              {initial}
            </div>

            <div className="team-hero-info">
              <span className="team-game-tag">🎮 {player.gameId || "Competitive Esports"}</span>
              <h2 className="team-hero-title">{player.playerName}</h2>
              <div className="team-meta-pills">
                <span className="player-role-chip" style={{ fontSize: "0.8rem", padding: "0.25rem 0.75rem" }}>
                  Role: {player.role || "Competitor"}
                </span>
                <span className="compact-lbl">
                  Joined: {player.createdAt ? new Date(player.createdAt).toLocaleDateString() : "Recently"}
                </span>
              </div>
            </div>
          </div>

          <div className="team-stats-strip">
            <div className="team-stat-item">
              <div className="team-stat-num">{player.age || "—"}</div>
              <div className="team-stat-lbl">Player Age</div>
            </div>
            <div className="team-stat-item">
              <div className="team-stat-num">{player.contact ? "Active" : "—"}</div>
              <div className="team-stat-lbl">Communication</div>
            </div>
            <div className="team-stat-item">
              <div className="team-stat-num">
                {player.teamId ? (typeof player.teamId === "object" ? player.teamId.teamName : "Assigned") : "Free Agent"}
              </div>
              <div className="team-stat-lbl">Squad Status</div>
            </div>
          </div>
        </div>

        {/* Assigned Team Card */}
        {player.teamId && typeof player.teamId === "object" && (
          <div className="team-roster-section" style={{ marginBottom: "2rem" }}>
            <div className="section-head">
              <h2>🛡️ Assigned Squad</h2>
              <Link to={`/teams/${player.teamId._id}`} className="roster-player-link">
                View Team Profile →
              </Link>
            </div>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              This athlete competes under <strong>{player.teamId.teamName}</strong> in <strong>{player.teamId.game || player.gameId || "tournaments"}</strong>.
            </p>
          </div>
        )}

        {/* Action Row */}
        <div className="team-action-bar">
          <Link to={`/register?playerId=${player._id}`} className="tournament-action-btn-primary" style={{ padding: "0.85rem 1.75rem" }}>
            ⚡ Register in Tournament
          </Link>
          <Link to="/players" className="tournament-action-btn-secondary" style={{ padding: "0.85rem 1.75rem" }}>
            ← All Players
          </Link>
          <Link to="/teams" className="tournament-action-btn-secondary" style={{ padding: "0.85rem 1.75rem" }}>
            👥 Browse Teams
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetails;
