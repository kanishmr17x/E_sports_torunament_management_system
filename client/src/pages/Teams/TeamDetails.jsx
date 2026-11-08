import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTeamById, getPlayersByTeam } from "../../api/apiRoutes";
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
        setError(err.message || "Failed to fetch team");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [id]);

  if (loading) {
    return (
      <div className="teams-page">
        <div className="teams-container">
          <div className="loading-state">
            <div className="loading-spinner" />
            <p className="loading-text">Loading team dossier...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="teams-page">
        <div className="teams-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Team Not Found</h2>
            <p className="error-text">{error || "The requested team profile could not be located."}</p>
            <Link to="/teams" className="retry-btn" style={{ textDecoration: "none", display: "inline-block" }}>
              ← Return to Teams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initial = team.teamName ? team.teamName.charAt(0).toUpperCase() : "T";
  const memberCount = team.totalMembers || players.length || 0;

  return (
    <div className="team-details-page">
      <section className="teams-banner">
        <div className="teams-banner-overlay" />
        <div className="teams-banner-content">
          <h1 className="teams-banner-title">{team.teamName}</h1>
          <p className="teams-banner-subtitle">Official {team.game || "Esports"} Squad Profile</p>
        </div>
      </section>

      <div className="team-details-container">
        {/* Team Hero Card */}
        <div className="team-hero-card">
          <div className="team-hero-header">
            <div className="team-avatar-large">
              {team.logo ? (
                <img src={team.logo} alt={`${team.teamName} logo`} />
              ) : (
                initial
              )}
            </div>

            <div className="team-hero-info">
              <span className="team-game-tag">🎮 {team.game || "Multi-Title"}</span>
              <h2 className="team-hero-title">{team.teamName}</h2>
              <div className="team-meta-pills">
                <span className={`team-status-badge ${team.status ? team.status.toLowerCase() : "active"}`}>
                  {team.status || "Active Squad"}
                </span>
                <span className="compact-lbl">
                  Created {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : "Recently"}
                </span>
              </div>
            </div>
          </div>

          <div className="team-stats-strip">
            <div className="team-stat-item">
              <div className="team-stat-num">{memberCount}</div>
              <div className="team-stat-lbl">Roster Members</div>
            </div>
            <div className="team-stat-item">
              <div className="team-stat-num">{team.wins || 0}</div>
              <div className="team-stat-lbl">Victories</div>
            </div>
            <div className="team-stat-item">
              <div className="team-stat-num">{team.losses || 0}</div>
              <div className="team-stat-lbl">Defeats</div>
            </div>
            <div className="team-stat-item">
              <div className="team-stat-num">
                {team.wins || team.losses ? `${Math.round(((team.wins || 0) / ((team.wins || 0) + (team.losses || 0) || 1)) * 100)}%` : "N/A"}
              </div>
              <div className="team-stat-lbl">Win Ratio</div>
            </div>
          </div>
        </div>

        {/* Players / Roster Section */}
        <div className="team-roster-section">
          <div className="section-head">
            <h2>👥 Active Roster ({players.length})</h2>
            <Link to="/register" className="create-team-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
              ➕ Add Member
            </Link>
          </div>

          {players.length === 0 ? (
            <div className="empty-state" style={{ padding: "3rem 1rem" }}>
              <div className="empty-state-icon">🎮</div>
              <h3 className="empty-state-title">No Players Registered</h3>
              <p className="empty-state-text">This squad does not have any active players registered yet.</p>
            </div>
          ) : (
            <div className="roster-grid">
              {players.map((player) => {
                const playerInitial = player.playerName ? player.playerName.charAt(0).toUpperCase() : "P";
                return (
                  <div key={player._id} className="roster-card">
                    <div className="roster-player-header">
                      <div className="player-avatar-mini">{playerInitial}</div>
                      <div className="roster-player-meta">
                        <h3>{player.playerName}</h3>
                        <span className="player-role-chip">{player.role || "Player"}</span>
                      </div>
                    </div>

                    <div className="roster-player-body">
                      <div><strong>Age:</strong> {player.age || "N/A"}</div>
                      <div><strong>Contact:</strong> {player.contact || "Protected"}</div>
                    </div>

                    <Link to={`/players/${player._id}`} className="roster-player-link">
                      View Dossier →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="team-action-bar">
          <Link to={`/register?teamId=${team._id}`} className="tournament-action-btn-primary" style={{ padding: "0.85rem 1.75rem" }}>
            ⚡ Register for Tournament
          </Link>
          <Link to="/tournaments" className="tournament-action-btn-secondary" style={{ padding: "0.85rem 1.75rem" }}>
            🏆 Browse Tournaments
          </Link>
          <Link to="/teams" className="tournament-action-btn-secondary" style={{ padding: "0.85rem 1.75rem" }}>
            ← All Teams
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
