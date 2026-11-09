import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlayerById } from "../../api/apiRoutes";
import Breadcrumbs from "../../components/Breadcrumbs";
import { formatDateIST } from "../../utils/formatters";
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
        setError(err.message || "Failed to fetch athlete dossier");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="teams-page">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div className="admin-spinner" style={{ margin: "0 auto 1.5rem" }} />
          <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Loading Athlete Dossier...</h3>
          <p style={{ color: "var(--text-secondary)" }}>Accessing verified competitor career stats.</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="teams-page">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>Athlete Not Found</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            {error || `Athlete with ID [${id}] was not located in the verified database.`}
          </p>
          <Link to="/players" className="btn btn-primary">
            ← Return to Players Directory
          </Link>
        </div>
      </div>
    );
  }

  const initial = player.playerName ? player.playerName.charAt(0).toUpperCase() : "P";
  const teamObj = player.teamId && typeof player.teamId === "object" ? player.teamId : null;
  const teamName = teamObj ? teamObj.teamName : (typeof player.teamId === "string" ? "Assigned Squad" : null);

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Athletes", path: "/players" },
    { label: player.playerName || "Athlete Dossier" },
  ];

  return (
    <div className="teams-page">
      <div className="container">
        <Breadcrumbs items={breadcrumbs} />

        {/* Athlete Dossier Hero */}
        <section className="team-hero-dossier">
          <div className="team-dossier-glow" />

          <div className="team-dossier-top">
            <div className="team-dossier-avatar-box">
              <span className="team-dossier-avatar-char">{initial}</span>
            </div>

            <div className="team-dossier-identity">
              <div className="team-dossier-badges">
                <span className="player-role-badge">🎯 {player.role || "Competitor"}</span>
                <span className="team-game-tag">🎮 {player.gameId || "BGMI"}</span>
                <span className="team-status-chip active">Verified Competitor</span>
                <span className="team-created-date">
                  Joined {player.createdAt ? formatDateIST(player.createdAt) : "Active Season"}
                </span>
              </div>

              <h1 className="team-dossier-name">{player.playerName}</h1>
              <p className="team-dossier-desc">
                Official athlete profile. Competes in organized circuit matches and tournament fixtures.
              </p>
            </div>

            <div className="team-dossier-cta-group">
              <Link to={`/tournaments?playerId=${player._id}`} className="btn btn-primary btn-lg">
                ⚡ Deploy to Tournament
              </Link>
              <Link to="/players" className="btn btn-outline btn-lg">
                ← All Athletes
              </Link>
            </div>
          </div>

          {/* Telemetry Bar */}
          <div className="team-dossier-telemetry">
            <div className="dossier-stat-tile">
              <span className="dossier-stat-label">Athlete Age</span>
              <span className="dossier-stat-number">{player.age ? `${player.age} Yrs` : "N/A"}</span>
            </div>
            <div className="dossier-stat-tile">
              <span className="dossier-stat-label">Communication</span>
              <span className="dossier-stat-number highlight-win">{player.contact ? "Active Link" : "Private"}</span>
            </div>
            <div className="dossier-stat-tile">
              <span className="dossier-stat-label">Roster Status</span>
              <span className="dossier-stat-number highlight-cyan">
                {teamName ? "Contracted" : "Free Agent"}
              </span>
            </div>
            <div className="dossier-stat-tile">
              <span className="dossier-stat-label">Primary Game Title</span>
              <span className="dossier-stat-number">{player.gameId || "BGMI"}</span>
            </div>
          </div>
        </section>

        {/* Assigned Squad Section */}
        <section className="player-squad-section">
          <div className="td-card-cyber">
            <h3 className="td-card-heading">🛡️ Contracted Squad Organization</h3>
            
            {teamObj ? (
              <div className="player-contract-card">
                <div className="player-contract-avatar">
                  {teamObj.teamName?.charAt(0).toUpperCase() || "T"}
                </div>
                <div className="player-contract-info">
                  <h4>{teamObj.teamName}</h4>
                  <p>Competing in {teamObj.game || player.gameId || "Championship Tournaments"}</p>
                </div>
                <Link to={`/teams/${teamObj._id}`} className="btn btn-primary btn-sm">
                  View Squad Dossier →
                </Link>
              </div>
            ) : (
              <div className="player-free-agent-box">
                <span style={{ fontSize: "2rem" }}>⚡</span>
                <div>
                  <h4 style={{ margin: "0 0 0.25rem", color: "var(--text-primary)" }}>Free Agent Athlete</h4>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    This competitor is currently unaffiliated and eligible for recruitment by teams and organizers.
                  </p>
                </div>
                <Link to="/teams" className="btn btn-outline btn-sm">
                  Browse Squads
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlayerDetails;
