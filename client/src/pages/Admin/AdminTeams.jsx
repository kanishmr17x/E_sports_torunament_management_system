import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getTeams, createTeam, deleteTeam, getTournaments } from "../../api/apiRoutes";
import ConfirmModal from "../../components/ConfirmModal";
import AdminNav from "../../components/AdminNav";
import { formatDateIST } from "../../utils/formatters";
import "../../styles/theme.css";
import "../../styles/adminTournaments.css";
import "../../styles/adminTeams.css";

const AdminTeams = () => {
  const { isAdmin, isOrganizer, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });

  const [formData, setFormData] = useState({
    name: "",
    game: "BGMI",
    tournamentId: "",
    description: ""
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!authLoading && !isAdmin && !isOrganizer) {
      navigate("/unauthorized");
    }
  }, [isAdmin, isOrganizer, authLoading, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [teamsData, tournamentsData] = await Promise.allSettled([
        getTeams(),
        getTournaments()
      ]);

      setTeams(teamsData.status === "fulfilled" && Array.isArray(teamsData.value) ? teamsData.value : []);
      setTournaments(tournamentsData.status === "fulfilled" && Array.isArray(tournamentsData.value) ? tournamentsData.value : []);
    } catch (err) {
      setError(err.message || "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Team name is required";
    if (!formData.game.trim()) errs.game = "Game is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),
        game: formData.game.trim(),
        tournamentId: formData.tournamentId || undefined,
        description: formData.description.trim()
      };

      await createTeam(payload);
      setSuccess("Team registered successfully!");
      setShowCreateForm(false);
      setFormData({
        name: "",
        game: "BGMI",
        tournamentId: "",
        description: ""
      });
      loadData();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create team");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setActionLoading(true);
      await deleteTeam(deleteModal.id);
      setTeams(prev => prev.filter(t => t._id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null, name: "" });
      setSuccess("Team removed successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete team");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-teams-page">
      <div className="container">
        {/* Universal Admin Navigation */}
        <AdminNav
          title="Team & Roster Control"
          subtitle="Inspect registered squads, verify rosters, and oversee team captain permissions."
          actions={
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`btn ${showCreateForm ? "btn-outline" : "btn-primary"} btn-sm`}
            >
              {showCreateForm ? "✕ Close Form" : "+ Enlist Squad"}
            </button>
          }
        />

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
            ✅ {success}
          </div>
        )}

        {/* Create Team Form Drawer */}
        {showCreateForm && (
          <div className="admin-form-card">
            <div className="admin-form-header">
              <div>
                <h2 className="admin-section-heading" style={{ margin: 0 }}>
                  ⚡ Enlist New Team Profile
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                  Register a squad roster and link to an active championship tournament.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Team Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Apex Predators"
                    className="form-input"
                  />
                  {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Game Title *</label>
                  <select
                    name="game"
                    value={formData.game}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="BGMI">BGMI</option>
                    <option value="PUBG">PUBG</option>
                    <option value="Valorant">Valorant</option>
                    <option value="Free Fire">Free Fire</option>
                    <option value="COD">Call of Duty Mobile</option>
                    <option value="Apex Legends">Apex Legends</option>
                    <option value="CS2">Counter-Strike 2</option>
                    <option value="Other">Other Esports Title</option>
                  </select>
                  {formErrors.game && <span className="field-error">{formErrors.game}</span>}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="form-label">Associate with Active Tournament (Optional)</label>
                <select
                  name="tournamentId"
                  value={formData.tournamentId}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">-- Independent Roster (No Tournament) --</option>
                  {tournaments.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.game})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="form-label">Squad Dossier / Bio</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Competitive background, team achievements, social tags..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                />
              </div>

              <div className="form-actions-bar">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-outline"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Registering..." : "⚡ Save Squad Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Teams Data Table */}
        <div className="admin-table-container">
          <div className="admin-table-header-row">
            <div>
              <h3 className="admin-table-title">Enlisted Squads ({teams.length})</h3>
              <p className="admin-table-sub">Verified competitive esports teams and organizations.</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-table-state">
              <div className="admin-spinner" style={{ margin: "0 auto 1rem" }}></div>
              <p>Loading registered squads...</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="empty-table-state">
              <div className="empty-table-icon">👥</div>
              <h3>No Teams Registered Yet</h3>
              <p>Teams created by users or administrators will appear here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Squad Name</th>
                    <th>Game</th>
                    <th>Captain</th>
                    <th>Roster Size</th>
                    <th>Linked Tournament</th>
                    <th>Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(t => {
                    const squadName = t.teamName || t.name || "Squad";
                    return (
                      <tr key={t._id}>
                        <td>
                          <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{squadName}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            Enlisted: {formatDateIST(t.createdAt || Date.now())}
                          </div>
                        </td>
                        <td>
                          <span className="td-game-badge" style={{ fontSize: "0.72rem" }}>{t.game || "BGMI"}</span>
                        </td>
                        <td>
                          <div className="team-captain-pill">
                            <span className="captain-crown">👑</span>
                            <span>{t.captain?.username || t.creator?.username || "Captain"}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                            {t.members?.length || t.players?.length || t.totalMembers || 1} Members
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.82rem", color: t.tournamentId ? "var(--accent-secondary)" : "var(--text-muted)" }}>
                            {t.tournamentId?.name || (typeof t.tournamentId === "string" ? "Linked" : "Independent")}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <Link to={`/teams/${t._id}`} className="btn btn-outline btn-xs">
                              Dossier
                            </Link>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, id: t._id, name: squadName })}
                              className="btn btn-outline btn-xs"
                              style={{ borderColor: "rgba(255, 59, 59, 0.4)", color: "#FF6B6B" }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Disband Team"
        message={`Are you sure you want to permanently disband and delete "${deleteModal.name}"?`}
        confirmText={actionLoading ? "Disbanding..." : "Disband Team"}
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
      />
    </div>
  );
};

export default AdminTeams;
