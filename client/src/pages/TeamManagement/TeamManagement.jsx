import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getMyTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTournaments,
  addPlayer,
  getPlayersByTeam,
  deletePlayer
} from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import Breadcrumbs from "../../components/Breadcrumbs";
import TeamCard from "../../components/TeamCard";
import StatCard from "../../components/StatCard";
import "../../styles/theme.css";
import "../../styles/teamManagement.css";

const TeamManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState(id ? "edit" : "list");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, teamId: null, teamName: "" });

  const [formData, setFormData] = useState({
    teamName: "",
    game: "",
    tournamentId: "",
    status: "current"
  });

  const [playerForm, setPlayerForm] = useState({
    playerName: "",
    gameId: "",
    role: "Other",
    age: "",
    contact: ""
  });

  const games = ["BGMI", "PUBG", "Valorant", "Free Fire", "COD", "CS2", "Other"];
  const playerRoles = ["IGL", "Assaulter", "Support", "Sniper", "Entry Fragger", "Other"];

  useEffect(() => {
    loadTournaments();
    if (!id) {
      loadMyTeams();
    } else {
      loadTeam(id);
    }
  }, [id]);

  const loadTournaments = async () => {
    try {
      const res = await getTournaments({ status: "registration_open" });
      setTournaments(Array.isArray(res) ? res.filter(t => t.status === "registration_open" || t.status === "upcoming") : []);
    } catch (err) {
      console.error("Failed to load tournaments:", err);
    }
  };

  const loadMyTeams = async () => {
    try {
      setLoading(true);
      const res = await getMyTeams();
      setTeams(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Failed to load squad rosters");
    } finally {
      setLoading(false);
    }
  };

  const loadTeam = async (teamId) => {
    try {
      setLoading(true);
      const [teamRes, playersRes] = await Promise.all([
        getTeamById(teamId),
        getPlayersByTeam(teamId)
      ]);
      const tData = teamRes?.success && teamRes.data !== undefined ? teamRes.data : teamRes;
      setCurrentTeam(tData);
      setPlayers(Array.isArray(playersRes) ? playersRes : (playersRes?.data || []));
      
      if (tData) {
        setFormData({
          teamName: tData.teamName || tData.name || "",
          game: tData.game || "",
          tournamentId: tData.tournament?._id || tData.tournament || "",
          status: tData.status || "current"
        });
      }
    } catch (err) {
      setError(err.message || "Failed to load team dossier");
      navigate("/dashboard/teams");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlayerInputChange = (e) => {
    const { name, value } = e.target;
    setPlayerForm(prev => ({ ...prev, [name]: value }));
  };

  const validateTeamForm = () => {
    const errors = [];
    if (!formData.teamName.trim()) errors.push("Team name is required");
    if (!formData.game) errors.push("Game is required");
    if (!formData.tournamentId) errors.push("Tournament is required");
    if (formData.teamName.trim().length < 3) errors.push("Team name must be at least 3 characters");
    return errors;
  };

  const handleSubmitTeam = async (e) => {
    e.preventDefault();
    const errors = validateTeamForm();
    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (mode === "create") {
        const res = await createTeam(formData);
        setSuccess("Squad created successfully!");
        setTimeout(() => {
          navigate(`/dashboard/teams/${res._id}/manage`);
        }, 1000);
      } else {
        const res = await updateTeam(id, formData);
        setCurrentTeam(res);
        setSuccess("Squad profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to save squad");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    const errors = [];
    if (!playerForm.playerName.trim()) errors.push("Player name is required");
    if (!playerForm.gameId.trim()) errors.push("Game ID is required");
    if (!playerForm.age) errors.push("Age is required");
    if (!playerForm.contact.trim()) errors.push("Contact is required");
    if (playerForm.age < 13 || playerForm.age > 100) errors.push("Age must be between 13 and 100");

    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    try {
      setLoading(true);
      setError("");
      await addPlayer({
        playerName: playerForm.playerName.trim(),
        gameId: playerForm.gameId.trim(),
        role: playerForm.role,
        age: parseInt(playerForm.age, 10),
        contact: playerForm.contact.trim(),
        teamId: id
      });
      setPlayerForm({ playerName: "", gameId: "", role: "Other", age: "", contact: "" });
      setSuccess("Athlete enrolled to roster successfully!");
      setShowAddPlayer(false);
      loadTeam(id);
    } catch (err) {
      setError(err.message || "Failed to add athlete");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm("Are you sure you want to remove this athlete from the roster?")) return;
    try {
      await deletePlayer(playerId);
      setPlayers(prev => prev.filter(p => p._id !== playerId));
      setSuccess("Athlete removed from roster.");
    } catch {
      setError("Failed to remove athlete.");
    }
  };

  const openDeleteModal = (teamId, teamName) => {
    setDeleteModal({ isOpen: true, teamId, teamName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, teamId: null, teamName: "" });
  };

  const handleDeleteTeam = async () => {
    if (!deleteModal.teamId) return;
    try {
      setLoading(true);
      await deleteTeam(deleteModal.teamId);
      closeDeleteModal();
      setSuccess("Squad disbanded successfully.");
      setTimeout(() => navigate("/dashboard/teams"), 1000);
    } catch (err) {
      setError(err.message || "Failed to disband squad");
    } finally {
      setLoading(false);
    }
  };

  const handleNewTeam = () => {
    setMode("create");
    setFormData({ teamName: "", game: "", tournamentId: "", status: "current" });
    setError("");
    setSuccess("");
  };

  const handleBackToList = () => {
    navigate("/dashboard/teams");
  };

  const isCaptain = currentTeam?.captain?._id === user?._id || currentTeam?.captain === user?._id || !currentTeam?.captain;

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard" },
    { label: mode === "create" ? "Create Squad" : mode === "edit" ? "Manage Squad" : "My Squads" },
  ];

  if (loading && mode !== "list") {
    return (
      <div className="team-mgmt-page-cyber">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div className="admin-spinner" style={{ margin: "0 auto 1.5rem" }} />
          <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Loading Squad Command Deck...</h3>
          <p style={{ color: "var(--text-secondary)" }}>Verifying athlete eligibility and captain credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-mgmt-page-cyber">
      <div className="container">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header Banner */}
        <header className="team-mgmt-banner-cyber">
          <div className="team-mgmt-header-content">
            <div className="team-mgmt-badge-row">
              <span className="team-mgmt-circuit-tag">🛡️ SQUAD OPERATIONS DECK</span>
              <span className="team-mgmt-status-tag">CAPTAIN CONTROL</span>
            </div>
            <h1 className="team-mgmt-title">
              {mode === "create" ? "Enlist New Squad Roster" : mode === "edit" ? `Manage ${currentTeam?.teamName || "Squad"}` : "Captain's Squad Operations"}
            </h1>
            <p className="team-mgmt-subtitle">
              {mode === "list"
                ? "View, inspect, and configure competitive rosters under your captaincy."
                : "Manage active athletes, assign tactical roles, and coordinate tournament deployments."}
            </p>
          </div>

          <div className="team-mgmt-banner-actions">
            {mode !== "list" && (
              <button onClick={handleBackToList} className="btn btn-outline btn-sm">
                ← Return to Squads
              </button>
            )}
            {mode === "list" && (
              <button onClick={handleNewTeam} className="btn btn-primary btn-sm">
                + Enlist New Squad
              </button>
            )}
          </div>
        </header>

        {error && <div className="alert alert-danger" style={{ marginBottom: "1.5rem" }}>⚠️ {error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>✅ {success}</div>}

        {/* VIEW 1: Squad List Mode */}
        {mode === "list" && (
          <section className="team-mgmt-list-section">
            {loading ? (
              <div className="loading-state" style={{ padding: "3rem", textAlign: "center" }}>
                <div className="admin-spinner" style={{ margin: "0 auto 1rem" }} />
                <p style={{ color: "var(--text-secondary)" }}>Loading your squads...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="teams-empty-state">
                <div className="teams-empty-icon">👥</div>
                <h3>No Squads Registered Yet</h3>
                <p>Enlist your first esports squad to deploy into verified tournament brackets.</p>
                <button onClick={handleNewTeam} className="btn btn-primary" style={{ marginTop: "1rem" }}>
                  + Enlist First Squad
                </button>
              </div>
            ) : (
              <div className="teams-cyber-grid">
                {teams.map(team => (
                  <TeamCard
                    key={team._id}
                    team={team}
                    isAdmin={true}
                    onDelete={() => openDeleteModal(team._id, team.teamName)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* VIEW 2: Edit or Create Squad Mode */}
        {(mode === "create" || mode === "edit") && (
          <div className="team-mgmt-edit-grid">
            {/* Left Column: Squad Settings */}
            <section className="team-mgmt-settings-card">
              <div className="mgmt-card-header">
                <span className="mgmt-card-icon">⚙️</span>
                <div>
                  <h3 className="mgmt-card-heading">Squad Profile Configuration</h3>
                  <p className="mgmt-card-sub">Core metadata, discipline title, and tournament association.</p>
                </div>
              </div>

              <form onSubmit={handleSubmitTeam} className="mgmt-form">
                <div className="form-group">
                  <label htmlFor="teamName" className="form-label">Squad Name *</label>
                  <input
                    type="text"
                    id="teamName"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    placeholder="e.g. Apex Predators"
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="game" className="form-label">Competitive Game Discipline *</label>
                  <select
                    id="game"
                    name="game"
                    value={formData.game}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Title</option>
                    {games.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="tournamentId" className="form-label">Associated Championship Tournament *</label>
                  <select
                    id="tournamentId"
                    name="tournamentId"
                    value={formData.tournamentId}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Tournament Bracket</option>
                    {tournaments.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.game})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status" className="form-label">Squad Roster State</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={loading}
                  >
                    <option value="current">Active Circuit Roster</option>
                    <option value="upcoming">Preparing for Season</option>
                    <option value="past">Archived Season Roster</option>
                  </select>
                </div>

                <div className="mgmt-form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : mode === "create" ? "⚡ Enlist Squad" : "⚡ Update Squad"}
                  </button>
                  {mode === "edit" && (
                    <button type="button" onClick={handleBackToList} className="btn btn-outline">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Right Column: Athlete Roster Management */}
            {mode === "edit" && isCaptain && (
              <section className="team-mgmt-roster-card">
                <div className="mgmt-card-header">
                  <span className="mgmt-card-icon">👥</span>
                  <div>
                    <h3 className="mgmt-card-heading">Active Roster ({players.length} Athletes)</h3>
                    <p className="mgmt-card-sub">Manage enlisted competitors and tactical role specializations.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddPlayer(true)}
                    className="btn btn-primary btn-xs"
                    style={{ marginLeft: "auto" }}
                  >
                    + Add Athlete
                  </button>
                </div>

                {players.length === 0 ? (
                  <div className="reg-no-squads-box" style={{ margin: "1rem 0" }}>
                    <p style={{ color: "var(--text-secondary)" }}>No athletes enrolled yet. Click &ldquo;Add Athlete&rdquo; to build your squad.</p>
                  </div>
                ) : (
                  <div className="mgmt-roster-list">
                    {players.map(player => (
                      <div key={player._id} className="mgmt-roster-item">
                        <div className="mgmt-roster-avatar">
                          {player.playerName?.charAt(0).toUpperCase() || "P"}
                        </div>
                        <div className="mgmt-roster-meta">
                          <h4>{player.playerName}</h4>
                          <div className="mgmt-roster-tags">
                            <span className="player-role-badge" style={{ fontSize: "0.68rem" }}>{player.role || "Competitor"}</span>
                            <span>ID: {player.gameId}</span>
                            <span>Age: {player.age}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeletePlayer(player._id)}
                          className="btn btn-danger-subtle btn-xs"
                          title="Remove Athlete"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Player Drawer Modal */}
                {showAddPlayer && (
                  <div className="modal-overlay" onClick={() => setShowAddPlayer(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                      <div className="modal-header">
                        <h3>Enlist Athlete to Squad Roster</h3>
                        <button className="modal-close" onClick={() => setShowAddPlayer(false)}>×</button>
                      </div>
                      <form onSubmit={handleAddPlayer} className="mgmt-modal-form">
                        <div className="form-group">
                          <label htmlFor="playerName" className="form-label">Athlete Full Name / Handle *</label>
                          <input
                            type="text"
                            id="playerName"
                            name="playerName"
                            value={playerForm.playerName}
                            onChange={handlePlayerInputChange}
                            placeholder="e.g. Marcus Fragger"
                            className="form-input"
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="gameId" className="form-label">In-Game ID / UID *</label>
                          <input
                            type="text"
                            id="gameId"
                            name="gameId"
                            value={playerForm.gameId}
                            onChange={handlePlayerInputChange}
                            placeholder="e.g. 514892019"
                            className="form-input"
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="form-grid-2">
                          <div className="form-group">
                            <label htmlFor="role" className="form-label">Tactical Role</label>
                            <select
                              id="role"
                              name="role"
                              value={playerForm.role}
                              onChange={handlePlayerInputChange}
                              className="form-input"
                              disabled={loading}
                            >
                              {playerRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>

                          <div className="form-group">
                            <label htmlFor="age" className="form-label">Athlete Age *</label>
                            <input
                              type="number"
                              id="age"
                              name="age"
                              value={playerForm.age}
                              onChange={handlePlayerInputChange}
                              placeholder="Age"
                              min="13"
                              max="100"
                              className="form-input"
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="contact" className="form-label">Emergency / Discord Contact *</label>
                          <input
                            type="text"
                            id="contact"
                            name="contact"
                            value={playerForm.contact}
                            onChange={handlePlayerInputChange}
                            placeholder="Discord tag or phone"
                            className="form-input"
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="form-actions-bar" style={{ marginTop: "1.25rem" }}>
                          <button type="button" onClick={() => setShowAddPlayer(false)} className="btn btn-outline">
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Enrolling..." : "⚡ Enroll Athlete"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteTeam}
          title="Disband Squad"
          message={`Are you sure you want to permanently disband "${deleteModal.teamName}"? All roster assignments will be cleared.`}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default TeamManagement;
