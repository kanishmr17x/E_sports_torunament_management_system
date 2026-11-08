import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTournamentById } from "../../api/apiRoutes";
import "../../styles/theme.css";
import "../../styles/tournamentDetails.css";

const TournamentDetails = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const response = await getTournamentById(id);
        const data = response?.success && response.data !== undefined ? response.data : response;
        setTournament(data);
      } catch (err) {
        setError(err.message || "Failed to fetch tournament");
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <div className="tournament-details-page">
        <div className="container" style={{ textAlign: "center", padding: "100px 20px" }}>
          <div className="admin-spinner" style={{ margin: "0 auto 1.5rem" }}></div>
          <p style={{ color: "var(--text-secondary)" }}>Loading tournament battleground...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="tournament-details-page">
        <div className="container" style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>Tournament Not Found</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            {error || `Tournament with ID ${id} was not found.`}
          </p>
          <Link to="/tournaments" className="btn btn-primary">
            ← Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const registeredCount = tournament.teams?.length || tournament.registeredTeams || 0;
  const maxSlots = tournament.maxTeams || 16;
  const slotPercent = Math.min(Math.round((registeredCount / maxSlots) * 100), 100);

  return (
    <div className="tournament-details-page">
      {/* Hero Banner */}
      <section className="td-hero-banner">
        <div className="container">
          <Link to="/tournaments" className="btn btn-outline btn-sm" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
            ← All Tournaments
          </Link>

          <div className="td-hero-content">
            <div className="td-title-section">
              <div className="td-tag-row">
                <span className="td-game-badge">🎮 {tournament.game}</span>
                <span className="td-type-badge">{tournament.type?.toUpperCase() || "TEAM"}</span>
                <span className={`table-badge ${tournament.status || "upcoming"}`}>
                  {tournament.status?.replace(/_/g, " ") || "Upcoming"}
                </span>
              </div>

              <h1 className="td-title">{tournament.name}</h1>
              <p className="td-desc-text">
                {tournament.description || "Official competitive esports tournament. Compete against verified squads for glory and cash prizes."}
              </p>
            </div>

            <div className="td-actions">
              <Link to={`/tournaments/${tournament._id}/register`} className="btn btn-primary">
                ⚡ Register Team
              </Link>
              <Link to={`/tournaments/${tournament._id}/bracket`} className="btn btn-secondary">
                🏆 View Bracket
              </Link>
              <Link to={`/leaderboard?tournamentId=${tournament._id}`} className="btn btn-outline">
                📊 Standings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container">
        {/* KPI Metrics */}
        <section className="td-metrics-grid">
          <div className="td-metric-card">
            <span className="td-metric-label">Prize Pool</span>
            <span className="td-metric-value gold">{tournament.prizePool || "Glory / Trophy"}</span>
          </div>

          <div className="td-metric-card">
            <span className="td-metric-label">Team Slots</span>
            <span className="td-metric-value">
              {registeredCount} / {maxSlots}
            </span>
            <div className="td-progress-bar">
              <div className="td-progress-fill" style={{ width: `${slotPercent}%` }}></div>
            </div>
          </div>

          <div className="td-metric-card">
            <span className="td-metric-label">Format</span>
            <span className="td-metric-value" style={{ fontSize: "1.25rem", textTransform: "capitalize" }}>
              {tournament.format?.replace(/_/g, " ") || "Single Elimination"}
            </span>
          </div>

          <div className="td-metric-card">
            <span className="td-metric-label">Entry Fee</span>
            <span className="td-metric-value" style={{ color: "var(--neon-cyan)" }}>
              {tournament.entryFee ? `$${tournament.entryFee}` : "Free Entry"}
            </span>
          </div>
        </section>

        {/* Content Layout */}
        <div className="td-main-layout">
          {/* Left Column: Registered Teams & Rules */}
          <div>
            <div className="td-card">
              <h2 className="td-section-heading">👥 Registered Squads ({registeredCount})</h2>
              {tournament.teams && tournament.teams.length > 0 ? (
                <div className="td-teams-grid">
                  {tournament.teams.map(team => (
                    <div key={team._id || team} className="td-team-item">
                      <div className="td-team-name">{team.teamName || team.name || "Squad Entry"}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        Game: {team.game || tournament.game}
                      </div>
                      {team._id && (
                        <Link to={`/teams/${team._id}`} className="btn btn-outline btn-sm" style={{ marginTop: "auto" }}>
                          View Roster →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                  <p>No teams have confirmed registration yet. Be the first squad to register!</p>
                  <Link to={`/tournaments/${tournament._id}/register`} className="btn btn-primary btn-sm" style={{ marginTop: "1rem" }}>
                    Register Squad
                  </Link>
                </div>
              )}
            </div>

            {tournament.rules && (
              <div className="td-card">
                <h2 className="td-section-heading">📜 Official Tournament Rules</h2>
                <div className="td-desc-text" style={{ whiteSpace: "pre-line" }}>
                  {tournament.rules}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Schedule & Quick Info */}
          <div>
            <div className="td-card">
              <h3 className="td-section-heading" style={{ fontSize: "1.15rem" }}>📅 Schedule Breakdown</h3>
              <div className="td-info-list">
                <div className="td-info-row">
                  <span className="td-info-label">Tournament Start</span>
                  <span className="td-info-val">
                    {new Date(tournament.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="td-info-row">
                  <span className="td-info-label">Tournament End</span>
                  <span className="td-info-val">
                    {new Date(tournament.endDate).toLocaleDateString()}
                  </span>
                </div>
                {tournament.registrationDeadline && (
                  <div className="td-info-row">
                    <span className="td-info-label">Reg. Deadline</span>
                    <span className="td-info-val">
                      {new Date(tournament.registrationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="td-info-row">
                  <span className="td-info-label">Tournament Mode</span>
                  <span className="td-info-val" style={{ textTransform: "uppercase" }}>
                    {tournament.type || "Online"}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <Link to={`/tournaments/${tournament._id}/bracket`} className="btn btn-outline btn-full">
                  Check Bracket Progression
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;
