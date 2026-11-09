import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import { registerTeam, getTournaments, getTeams } from "../../api/apiRoutes";
import "../../styles/theme.css";
import "../../styles/register.css";

const TeamRegister = () => {
  const [teamId, setTeamId] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setFetchLoading(true);
      try {
        const [teamsData, tournamentsData] = await Promise.all([
          getTeams(),
          getTournaments()
        ]);
        setTeams(Array.isArray(teamsData) ? teamsData : []);
        setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
      } catch {
        setError("Failed to load teams and tournaments.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!teamId.trim()) { setError("Please select a team"); return; }
    if (!tournamentId.trim()) { setError("Please select a tournament"); return; }

    setLoading(true);
    try {
      await registerTeam({ teamId: teamId.trim(), tournamentId: tournamentId.trim() });
      setSuccess("Team registered successfully! Good luck in the tournament.");
      setTeamId("");
      setTournamentId("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to register team");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="page-root">
        <div className="page-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading teams &amp; tournaments…</p>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Teams", path: "/teams" },
    { label: "Register to Tournament" }
  ];

  return (
    <div className="registration-hub">
      <div className="registration-content">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(1.5rem, 4vw, 2.5rem)" }}>
          <p style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(0.7rem, 1.8vw, 0.825rem)",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--neon-cyan)",
            marginBottom: "0.5rem",
          }}>
            Tournament Registration
          </p>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 900,
            color: "var(--text-primary)",
            lineHeight: 1.1,
          }}>
            Register Team to Tournament
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem", fontSize: "clamp(0.875rem, 2vw, 1rem)" }}>
            Select your team and tournament from the dropdowns below.
          </p>
        </div>

        {/* Status messages */}
        {error && <p className="error-message">❌ {error}</p>}
        {success && <p className="success-message">✅ {success}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tr-team">Your Team *</label>
            <select
              id="tr-team"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              disabled={loading}
            >
              <option value="">— Select Team —</option>
              {teams.length === 0 && (
                <option disabled>No teams available</option>
              )}
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.teamName} · {team.game}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tr-tournament">Tournament *</label>
            <select
              id="tr-tournament"
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              disabled={loading}
            >
              <option value="">— Select Tournament —</option>
              {tournaments.length === 0 && (
                <option disabled>No tournaments available</option>
              )}
              {tournaments.map((tournament) => (
                <option key={tournament._id} value={tournament._id}>
                  {tournament.name} · {tournament.game}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !teamId.trim() || !tournamentId.trim()}
          >
            {loading ? "Registering…" : "⚡ Register Team"}
          </button>

          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "1.25rem" }}>
            Need to browse first?{" "}
            <Link to="/tournaments" style={{ color: "var(--neon-cyan)", textDecoration: "none" }}>View Tournaments</Link>
            {" · "}
            <Link to="/teams" style={{ color: "var(--neon-cyan)", textDecoration: "none" }}>View Teams</Link>
          </p>
        </form>

      </div>
    </div>
  );
};

export default TeamRegister;
