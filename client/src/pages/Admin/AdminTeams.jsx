import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getTeams, createTeam, deleteTeam, getTournaments } from "../../api/apiRoutes";
import ConfirmModal from "../../components/ConfirmModal";
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
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <Link to="/admin" className="btn btn-outline btn-sm" style={{ marginBottom: "0.75rem", display: "inline-flex" }}>
            ← Back to Admin Console
          </Link>
          <h1 className="admin-title">👥 Team & Roster Management</h1>
          <p className="admin-subtitle">Inspect registered squads, rosters, and team captain entries</p>
        </div>

        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`btn ${showCreateForm ? "btn-outline" : "btn-primary"}`}
        >
          {showCreateForm ? "✕ Close Form" : "+ Register New Team"}
        </button>
      </div>

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

      {/* Create Team Form */}
      {showCreateForm && (
        <div className="admin-form-card">
          <div className="admin-form-header">
            <h2 className="admin-section-heading" style={{ margin: 0 }}>
              ⚡ Register Team Profile
            </h2>
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
                  placeholder="e.g. Sentinels Esports"
                  className="form-input"
                />
                {formErrors.name && <span className="form-error-msg">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Game Title *</label>
                <select
                  name="game"
                  value={formData.game}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="BGMI">BGMI</option>
                  <option value="PUBG">PUBG</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Free Fire">Free Fire</option>
                  <option value="COD">Call of Duty Mobile</option>
                  <option value="Apex Legends">Apex Legends</option>
                  <option value="Other">Other Esports Title</option>
                </select>
                {formErrors.game && <span className="form-error-msg">{formErrors.game}</span>}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Associate with Active Tournament (Optional)</label>
              <select
                name="tournamentId"
                value={formData.tournamentId}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">-- No Tournament (Independent Roster) --</option>
                {tournaments.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.game})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Team Bio / Description</label>
              <textarea
                name="description"
                rows="3"
                placeholder="Team background, competitive record, social handles..."
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
                {actionLoading ? "Registering..." : "⚡ Save Team"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams Data Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="empty-table-state">
            <div className="admin-spinner" style={{ margin: "0 auto 1rem" }}></div>
            <p>Loading registered teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="empty-table-state">
            <div className="empty-table-icon">👥</div>
            <h3>No Teams Registered Yet</h3>
            <p>Teams created by users or admins will appear here.</p>
          </div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Game</th>
                <th>Captain / Creator</th>
                <th>Roster Count</th>
                <th>Tournament Entry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t._id}>
                  <td>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Created: {new Date(t.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className="table-badge open">{t.game}</span>
                  </td>
                  <td>
                    <div className="team-captain-pill">
                      <span className="captain-crown">👑</span>
                      <span>{t.captain?.username || t.creator?.username || "Captain"}</span>
                    </div>
                  </td>
                  <td>
                    <span className="team-members-tag">
                      {t.members?.length || t.players?.length || 1} Members
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", color: t.tournamentId ? "var(--neon-cyan)" : "var(--text-muted)" }}>
                      {t.tournamentId?.name || (typeof t.tournamentId === "string" ? "Linked" : "Independent")}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/teams/${t._id}`} className="btn btn-outline btn-sm">
                        View
                      </Link>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: t._id, name: t.name })}
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: "rgba(255, 59, 59, 0.4)", color: "var(--danger)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Team"
        message={`Are you sure you want to permanently disband and delete "${deleteModal.name}"?`}
        confirmText={actionLoading ? "Deleting..." : "Disband Team"}
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
      />
    </div>
  );
};

export default AdminTeams;
