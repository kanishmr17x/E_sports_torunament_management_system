import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getTournaments, createTournament, deleteTournament } from "../../api/apiRoutes";
import ConfirmModal from "../../components/ConfirmModal";
import "../../styles/theme.css";
import "../../styles/adminTournaments.css";

const AdminTournaments = () => {
  const { isAdmin, isOrganizer, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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
    type: "team",
    format: "single_elimination",
    startDate: "",
    endDate: "",
    maxTeams: 16,
    prizePool: "",
    entryFee: 0,
    description: "",
    rules: ""
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!authLoading && !isAdmin && !isOrganizer) {
      navigate("/unauthorized");
    }
  }, [isAdmin, isOrganizer, authLoading, navigate]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTournaments();
      setTournaments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Tournament name is required";
    if (!formData.game.trim()) errs.game = "Game title is required";
    if (!formData.startDate) errs.startDate = "Start date & time are required";
    if (!formData.endDate) errs.endDate = "End date & time are required";
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      errs.endDate = "End date must be after start date";
    }
    if (!formData.maxTeams || Number(formData.maxTeams) < 2) {
      errs.maxTeams = "Max teams must be at least 2";
    }
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
        type: formData.type,
        format: formData.format,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        maxTeams: Number(formData.maxTeams),
        prizePool: formData.prizePool ? String(formData.prizePool) : "TBD",
        entryFee: Number(formData.entryFee) || 0,
        description: formData.description.trim(),
        rules: formData.rules.trim()
      };

      await createTournament(payload);
      setSuccess("Tournament created successfully!");
      setShowCreateForm(false);
      setFormData({
        name: "",
        game: "BGMI",
        type: "team",
        format: "single_elimination",
        startDate: "",
        endDate: "",
        maxTeams: 16,
        prizePool: "",
        entryFee: 0,
        description: "",
        rules: ""
      });
      loadTournaments();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create tournament");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setActionLoading(true);
      await deleteTournament(deleteModal.id);
      setTournaments(prev => prev.filter(t => t._id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null, name: "" });
      setSuccess("Tournament removed successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete tournament");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-tournaments-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <Link to="/admin" className="btn btn-outline btn-sm" style={{ marginBottom: "0.75rem", display: "inline-flex" }}>
            ← Back to Admin Console
          </Link>
          <h1 className="admin-title">🏆 Tournament Management</h1>
          <p className="admin-subtitle">Create, configure, and manage platform tournament brackets</p>
        </div>

        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`btn ${showCreateForm ? "btn-outline" : "btn-primary"}`}
        >
          {showCreateForm ? "✕ Close Form" : "+ Create New Tournament"}
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

      {/* Create Tournament Form */}
      {showCreateForm && (
        <div className="admin-form-card">
          <div className="admin-form-header">
            <h2 className="admin-section-heading" style={{ margin: 0 }}>
              ⚡ Configure Tournament Details
            </h2>
            <span style={{ fontSize: "0.8rem", color: "var(--neon-cyan)" }}>
              * Mandatory fields required
            </span>
          </div>

          <form onSubmit={handleCreateSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Tournament Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Winter Clash Championship 2026"
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

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="team">Team (Squad)</option>
                  <option value="duo">Duo (2 Players)</option>
                  <option value="solo">Solo (1 Player)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tournament Format</label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="single_elimination">Single Elimination (Knockout)</option>
                  <option value="double_elimination">Double Elimination</option>
                  <option value="round_robin">Round Robin</option>
                  <option value="swiss">Swiss System</option>
                  <option value="group_knockout">Group Stage + Knockout</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Max Teams / Slots *</label>
                <input
                  type="number"
                  name="maxTeams"
                  min="2"
                  max="256"
                  value={formData.maxTeams}
                  onChange={handleInputChange}
                  className="form-input"
                />
                {formErrors.maxTeams && <span className="form-error-msg">{formErrors.maxTeams}</span>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
                {formErrors.startDate && <span className="form-error-msg">{formErrors.startDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">End Date & Time *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
                {formErrors.endDate && <span className="form-error-msg">{formErrors.endDate}</span>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Prize Pool</label>
                <input
                  type="text"
                  name="prizePool"
                  placeholder="e.g. $5,000 USD or ₹50,000 INR"
                  value={formData.prizePool}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Entry Fee ($ / ₹)</label>
                <input
                  type="number"
                  name="entryFee"
                  min="0"
                  step="0.01"
                  placeholder="0 for Free Entry"
                  value={formData.entryFee}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Description & Overview</label>
              <textarea
                name="description"
                rows="3"
                placeholder="Tournament format details, streaming channels, schedule notes..."
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
                {actionLoading ? "Publishing..." : "⚡ Publish Tournament"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tournaments Data Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="empty-table-state">
            <div className="admin-spinner" style={{ margin: "0 auto 1rem" }}></div>
            <p>Loading tournaments directory...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="empty-table-state">
            <div className="empty-table-icon">🏆</div>
            <h3>No Tournaments Found</h3>
            <p>Get started by creating your first tournament bracket above.</p>
          </div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Tournament</th>
                <th>Game</th>
                <th>Format</th>
                <th>Schedule</th>
                <th>Slots</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map(t => (
                <tr key={t._id}>
                  <td>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--neon-cyan)" }}>
                      Prize: {t.prizePool || "Free / Glory"}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{t.game}</span>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {t.type?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", textTransform: "capitalize" }}>
                      {t.format?.replace(/_/g, " ") || "Single Elim"}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.8rem" }}>
                      {new Date(t.startDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      to {new Date(t.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>
                      {t.teams?.length || 0} / {t.maxTeams || "16"}
                    </span>
                  </td>
                  <td>
                    <span className={`table-badge ${t.status || "upcoming"}`}>
                      {t.status?.replace(/_/g, " ") || "Upcoming"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/tournaments/${t._id}`} className="btn btn-outline btn-sm" title="View Public Page">
                        View
                      </Link>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: t._id, name: t.name })}
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: "rgba(255, 59, 59, 0.4)", color: "var(--danger)" }}
                        title="Delete Tournament"
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
        title="Delete Tournament"
        message={`Are you sure you want to permanently delete "${deleteModal.name}"? This will cancel existing registrations.`}
        confirmText={actionLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
      />
    </div>
  );
};

export default AdminTournaments;
