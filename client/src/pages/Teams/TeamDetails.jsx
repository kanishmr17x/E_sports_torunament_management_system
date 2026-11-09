import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTeamById, getPlayersByTeam } from "../../api/apiRoutes";
import Breadcrumbs from "../../components/Breadcrumbs";
import PlayerCard from "../../components/PlayerCard";
import { formatDateIST } from "../../utils/formatters";
import "../../styles/theme.css";
import "../../styles/teams.css";

const TeamDetails = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const response = await getTeamById(id);
        const teamData = response.success ? response.data : response;
        setTeam(teamData);

        if (teamData && teamData._id) {
          const playersData = await getPlayersByTeam(teamData._id);
          const playersList = playersData.success ? playersData.data : playersData;
          setPlayers(Array.isArray(playersList) ? playersList : []);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch squad dossier");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [id]);

  if (loading) {
    return (
      <div className="teams-page">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div className="admin-spinner" style={{ margin: "0 auto 1.5rem" }} />
          <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Loading Squad Dossier...</h3>
          <p style={{ color: "var(--text-secondary)" }}>Accessing athlete roster and battle telemetry.</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="teams-page">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>Squad Profile Not Located</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            {error || `The squad referenced by ID [${id}] was not found in the database.`}
          </p>
          <Link to="/teams" className="btn btn-primary">
            ← Return to Squad Directory
          </Link>
        </div>
      </div>
    );
  }

  const initial = team.teamName ? team.teamName.charAt(0).toUpperCase() : "T";
  const wins = team.wins || 0;
  const losses = team.losses || 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const memberCount = team.totalMembers || players.length || 0;

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Teams", path: "/teams" },
    { label: team.teamName || "Squad Dossier" },
  ];

  return (
    <div className="teams-page">
      <div className="container">
        <Breadcrumbs items={breadcrumbs} />

        {/* Team Hero Dossier Card */}
        <section className="team-hero-dossier">
          <div className="team-dossier-glow" />

          <div className="team-dossier-top">
            <div className="team-dossier-avatar-box">
              {team.logo ? (
                <img src={team.logo} alt={team.teamName} className="team-dossier-avatar-img" />
              ) : (
                <span className="team-dossier-avatar-char">{initial}</span>
              )}
            </div>

            <div className="team-dossier-identity">
              <div className="team-dossier-badges">
                <span className="team-game-tag">🎮 {team.game || "Multi-Title"}</span>
                <span className={`team-status-chip ${team.status ? team.status.toLowerCase() : "active"}`}>
                  {team.status || "Active Squad"}
                </span>
                <span className="team-created-date">
                  Enlisted {team.createdAt ? formatDateIST(team.createdAt) : "Active Season"}
                </span>
              </div>

              <h1 className="team-dossier-name">{team.teamName}</h1>
              {team.description && (
                <p className="team-dossier-desc">{team.description}</p>
              )}
            </div>

            <div className="team-dossier-cta-group">
              <Link to={`/tournaments?teamId=${team._id}`} className="btn btn-primary btn-lg">
                ⚡ Deploy to Tournament
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                ➕ Enlist Athlete
              </Link>
            </div>
          </div>

          {/* Telemetry Bar */}
          <div className="team-dossier-telemetry">
            <div className="dossier-stat-tile">
              <span className="dossier-stat-label">Roster Capacity</span>
              <span className="dossier-stat-number">{memberCount} Athletes</span>
            </div>
            <div className="dossier-stat-tile">
              <span className="dossier-stat-label">Circuit Victories</span>
              <span className="dossier-stat-number highlight-win">{wins} Wins</span>
            </div>
            <div className="dossier-stat-tile">
              <span className="dossier-stat-label">Recorded Defeats</span>
              <span className="dossier-stat-number">{losses} Losses</span>
            </div>
            <div className="dossier-stat-tile">
              <span className="dossier-stat-label">Win Rate Ratio</span>
              <span className="dossier-stat-number highlight-cyan">{winRate}%</span>
              <div className="dossier-bar-track">
                <div className="dossier-bar-fill" style={{ width: `${Math.max(winRate, 5)}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* Squad Athletes Roster Grid */}
        <section className="team-roster-section">
          <div className="team-roster-header">
            <div>
              <h2 className="team-roster-title">👥 Active Athlete Roster ({players.length})</h2>
              <p className="team-roster-subtitle">Athletes currently fielding competitive spots on this roster.</p>
            </div>
            <Link to="/register" className="btn btn-outline btn-sm">
              ➕ Add Athlete to Roster
            </Link>
          </div>

          {players.length === 0 ? (
            <div className="teams-empty-state">
              <div className="teams-empty-icon">🎮</div>
              <h3>No Athletes Assigned to Roster</h3>
              <p>This squad currently has no registered players. Enlist members to participate in tournament fixtures.</p>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                Enlist First Athlete
              </Link>
            </div>
          ) : (
            <div className="team-players-grid">
              {players.map((player) => (
                <PlayerCard key={player._id} player={player} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeamDetails;
