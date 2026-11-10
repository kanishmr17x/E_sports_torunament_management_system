import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import { formatINR, formatDateIST } from "../../utils/formatters";
import { getTournaments, getTeams, createTeam, addPlayer } from "../../api/apiRoutes";
import "../../styles/theme.css";
import "../../styles/tournament.css";

const Register = () => {
  const [activeTab, setActiveTab] = useState("tournament");
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [teamForm, setTeamForm] = useState({
    name: "",
    tournamentId: "",
    players: []
  });
  
  const [playerForm, setPlayerForm] = useState({
    name: "",
    email: "",
    gameId: "",
    teamId: "",
    age: "",
    role: "Other"
  });
  
  const [registeredPlayer, setRegisteredPlayer] = useState(null);

  // Fetch tournaments on component mount
  useEffect(() => {
    fetchTournaments();
    fetchTeams();
  }, []);

  const fetchTournaments = async () => {
    try {
      const data = await getTournaments();
      setTournaments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load tournaments");
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      // Error handled silently
    }
  };

  const handleTournamentSelect = (tournamentId) => {
    setSelectedTournament(tournamentId);
    setTeamForm(prev => ({ ...prev, tournamentId }));
    setError("");
    setSuccess("");
  };

  const handleTeamRegister = async (e) => {
    e.preventDefault();
    
    if (!selectedTournament) {
      setError("Please select a tournament first");
      return;
    }

    if (!teamForm.name.trim()) {
      setError("Team name is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create a new team (not register existing team)
      const tournamentGame = tournaments.find(t => t._id === selectedTournament)?.game || "Other";
      
      // Map tournament game to valid team game enum
      const gameMapping = {
        "csgo": "COD",
        "cs:go": "COD", 
        "counter-strike": "COD",
        "valorant": "Valorant",
        "pubg": "PUBG",
        "bgmi": "BGMI",
        "free fire": "Free Fire"
      };
      
      const normalizedGame = gameMapping[tournamentGame.toLowerCase()] || tournamentGame || "Other";
      
      await createTeam({
        teamName: teamForm.name,
        game: normalizedGame,
        status: "current",
        tournamentId: selectedTournament
      });
      
      setSuccess("Team created and registered successfully!");
      setTeamForm({ name: "", tournamentId: selectedTournament, players: [] });
      
      // Refresh teams list
      fetchTeams();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerRegister = async (e) => {
    e.preventDefault();
    
    if (!selectedTeam) {
      setError("Please select a team first");
      return;
    }

    if (!playerForm.name.trim() || !playerForm.email.trim()) {
      setError("Player name and email are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await addPlayer({
        playerName: playerForm.name.trim(),
        playerEmail: playerForm.email.trim(),
        gameId: teams.find(t => t._id === selectedTeam)?.game || playerForm.gameId || "Other",
        age: parseInt(playerForm.age) || 18,
        contact: playerForm.email.trim(),
        role: playerForm.role || "Other",
        teamId: selectedTeam
      });
      
      setRegisteredPlayer({
        playerName: playerForm.name.trim(),
        playerEmail: playerForm.email.trim(),
        gameId: teams.find(t => t._id === selectedTeam)?.game || playerForm.gameId || "Other",
        age: parseInt(playerForm.age) || 18,
        contact: playerForm.email.trim(),
        role: playerForm.role || "Other",
        teamId: selectedTeam,
        teamName: teams.find(t => t._id === selectedTeam)?.teamName || "Unknown Team"
      });
      
      setSuccess("Player registered successfully!");
      setPlayerForm({ name: "", email: "", gameId: "", teamId: "", age: "", role: "Other" });
      setSelectedTeam("");
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register player");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tournament-page">
      <section className="tournament-banner">
        <div className="tournament-banner-overlay" />
        <div className="tournament-banner-content">
          <h1 className="tournament-banner-title">🎮 Register</h1>
          <p className="tournament-banner-subtitle">Join tournaments and competitions</p>
        </div>
      </section>

      <div className="tournament-container">
        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}
        
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "tournament" ? "active" : ""}`}
            onClick={() => setActiveTab("tournament")}
          >
            🏆 Tournament Registration
          </button>
          <button
            className={`tab-btn ${activeTab === "team" ? "active" : ""}`}
            onClick={() => setActiveTab("team")}
          >
            👥 Team Registration
          </button>
          <button
            className={`tab-btn ${activeTab === "player" ? "active" : ""}`}
            onClick={() => setActiveTab("player")}
          >
            👤 Player Registration
          </button>
        </div>

        {/* Tournament Selection Tab */}
        {activeTab === "tournament" && (
          <div className="form-section">
            <h3 className="form-section-title">Select Tournament</h3>
            
            {tournaments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏆</div>
                <h2 className="empty-state-title">No Tournaments Available</h2>
                <p className="empty-state-text">
                  Check back later for new tournaments to join!
                </p>
              </div>
            ) : (
              <div className="tournament-grid">
                {tournaments.map((tournament) => (
                  <div
                    key={tournament._id}
                    className={`tournament-card ${selectedTournament === tournament._id ? 'selected' : ''}`}
                    onClick={() => handleTournamentSelect(tournament._id)}
                  >
                    <div className="tournament-card-header">
                      <h3 className="tournament-name">{tournament.name}</h3>
                      <p className="tournament-game">{tournament.game}</p>
                    </div>

                    <div className="tournament-type">
                      {tournament.type || 'Team'}
                    </div>
                    
                    <div className="tournament-info">
                      <div className="tournament-info-item">
                        <span className="tournament-info-label">Max Teams</span>
                        <span className="tournament-info-value">{tournament.maxTeams}</span>
                      </div>
                      <div className="tournament-info-item">
                        <span className="tournament-info-label">Start Date</span>
                        <span className="tournament-info-value">
                          {formatDateIST(tournament.startDate)}
                        </span>
                      </div>
                      <div className="tournament-info-item">
                        <span className="tournament-info-label">Prize Pool</span>
                        <span className="tournament-info-value">{formatINR(tournament.prizePool || 0)}</span>
                      </div>
                    </div>

                    <div className="tournament-status">
                      {tournament.status || 'upcoming'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTournament && (
              <div className="selected-tournament-info">
                <h4>Selected Tournament</h4>
                <p>You can now register a team for this tournament.</p>
                <button 
                  className="submit-btn"
                  onClick={() => setActiveTab("team")}
                >
                  Continue to Team Registration →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Team Registration Tab */}
        {activeTab === "team" && (
          <div className="form-section">
            <h3 className="form-section-title">Register Team</h3>
            
            {!selectedTournament && (
              <div className="warning-message">
                ⚠️ Please select a tournament first from the Tournament Registration tab.
              </div>
            )}

            <form onSubmit={handleTeamRegister} className="tournament-form">
              <div className="form-group">
                <label htmlFor="teamName">Team Name *</label>
                <input
                  type="text"
                  id="teamName"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter team name"
                  required
                  disabled={!selectedTournament}
                />
              </div>

              <div className="form-group">
                <label>Selected Tournament</label>
                <div className="selected-tournament-display">
                  {tournaments.find(t => t._id === selectedTournament)?.name || "No tournament selected"}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading || !selectedTournament}
                >
                  {loading ? "Registering Team..." : "👥 Register Team"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Player Registration Tab */}
        {activeTab === "player" && (
          <div className="form-section">
            <h3 className="form-section-title">Register Player</h3>
            
            <div className="info-message">
              ℹ️ Player registration is done within teams. Please select a team first.
            </div>

            <form onSubmit={handlePlayerRegister} className="tournament-form">
              <div className="form-group">
                <label htmlFor="teamSelect">Select Team *</label>
                <select
                  id="teamSelect"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  required
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.teamName} ({team.game})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="playerName">Player Name *</label>
                <input
                  type="text"
                  id="playerName"
                  value={playerForm.name}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter player name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="playerEmail">Email *</label>
                <input
                  type="email"
                  id="playerEmail"
                  value={playerForm.email}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter player email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="playerAge">Age *</label>
                <input
                  type="number"
                  id="playerAge"
                  value={playerForm.age}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter player age"
                  min="13"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="playerRole">Role</label>
                <select
                  id="playerRole"
                  value={playerForm.role}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="Other">Other</option>
                  <option value="IGL">IGL (In-Game Leader)</option>
                  <option value="Assaulter">Assaulter</option>
                  <option value="Support">Support</option>
                  <option value="Sniper">Sniper</option>
                  <option value="Entry Fragger">Entry Fragger</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Registering Player..." : "👤 Register Player"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Registered Player Details */}
        {registeredPlayer && (
          <div className="form-section">
            <h3 className="form-section-title">🎉 Player Registration Successful!</h3>
            <div className="player-details-card" style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-xl)",
              padding: "clamp(1.25rem, 3vw, 2rem)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              marginTop: "20px"
            }}>
              <div style={{ display: "grid", gap: "15px" }}>
                <div style={{ textAlign: "center", marginBottom: "10px" }}>
                  <h4 style={{ color: "#00ffa3", margin: "0 0 10px 0" }}>Player Details</h4>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                  <div>
                    <strong style={{ color: "var(--text-muted)" }}>Name:</strong>
                    <p style={{ margin: "5px 0", color: "var(--text-primary)" }}>{registeredPlayer.playerName}</p>
                  </div>
                  
                  <div>
                    <strong style={{ color: "var(--text-muted)" }}>Email:</strong>
                    <p style={{ margin: "5px 0", color: "var(--text-primary)" }}>{registeredPlayer.playerEmail}</p>
                  </div>
                  
                  <div>
                    <strong style={{ color: "var(--text-muted)" }}>Age:</strong>
                    <p style={{ margin: "5px 0", color: "var(--text-primary)" }}>{registeredPlayer.age} years</p>
                  </div>
                  
                  <div>
                    <strong style={{ color: "var(--text-muted)" }}>Role:</strong>
                    <p style={{ margin: "5px 0", color: "var(--text-primary)" }}>{registeredPlayer.role}</p>
                  </div>
                  
                  <div>
                    <strong style={{ color: "var(--text-muted)" }}>Game:</strong>
                    <p style={{ margin: "5px 0", color: "var(--text-primary)" }}>{registeredPlayer.gameId}</p>
                  </div>
                  
                  <div>
                    <strong style={{ color: "var(--text-muted)" }}>Team:</strong>
                    <p style={{ margin: "5px 0", color: "var(--text-primary)" }}>{registeredPlayer.teamName}</p>
                  </div>
                </div>
                
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <button 
                    onClick={() => setRegisteredPlayer(null)}
                    className="btn btn-outline"
                    style={{ marginRight: "10px" }}
                  >
                    Register Another Player
                  </button>
                  <Link to="/players" className="btn btn-primary">
                    View All Players
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
