import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getTournaments, createTournament, deleteTournament } from "../../api/apiRoutes";
import ConfirmModal from "../../components/ConfirmModal";
import AdminNav from "../../components/AdminNav";
import { formatINR, formatDateIST } from "../../utils/formatters";
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
      setSuccess("Tournament deployed successfully!");
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
      <div className="container">
        {/* Universal Admin Navigation */}
        <AdminNav
          title="Tournament Operations"
          subtitle="Deploy, configure, seed, and manage competitive esports tournament brackets."
          actions={
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`btn ${showCreateForm ? "btn-outline" : "btn-primary"} btn-sm`}
            >
              {showCreateForm ? "✕ Close Form" : "+ Create Tournament"}
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

        {/* Create Tournament Form Drawer */}
        {showCreateForm && (
          <div className="admin-form-card">
            <div className="admin-form-header">
              <div>
                <h2 className="admin-section-heading" style={{ margin: 0 }}>
                  ⚡ Configure New Tournament Battleground
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                  Specify format, titles, prize pool, and bracket capacity.
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--accent-secondary)" }}>
                * Mandatory fields
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
                    placeholder="e.g. Apex Predators Championship 2026"
                    className={`form-input ${formErrors.name ? "input-error" : ""}`}
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
                    <option value="BGMI">BGMI (Battlegrounds Mobile India)</option>
                    <option value="Valorant">Valorant</option>
                    <option value="Free Fire">Free Fire MAX</option>
                    <option value="CS2">Counter-Strike 2</option>
                    <option value="Call of Duty: Mobile">Call of Duty: Mobile</option>
                    <option value="League of Legends">League of Legends</option>
                    <option value="Dota 2">Dota 2</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tournament Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="team">Team (Squad)</option>
                    <option value="solo">Solo (1v1)</option>
                    <option value="duo">Duo (2v2)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Bracket Format</label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="single_elimination">Single Elimination</option>
                    <option value="double_elimination">Double Elimination</option>
                    <option value="round_robin">Round Robin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.startDate ? "input-error" : ""}`}
                  />
                  {formErrors.startDate && <span className="field-error">{formErrors.startDate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.endDate ? "input-error" : ""}`}
                  />
                  {formErrors.endDate && <span className="field-error">{formErrors.endDate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Max Squad Capacity *</label>
                  <input
                    type="number"
                    name="maxTeams"
                    min="2"
                    max="128"
                    value={formData.maxTeams}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.maxTeams ? "input-error" : ""}`}
                  />
                  {formErrors.maxTeams && <span className="field-error">{formErrors.maxTeams}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Prize Bounty</label>
                  <input
                    type="text"
                    name="prizePool"
                    placeholder="e.g. 500000 for ₹5,00,000 or Trophy"
                    value={formData.prizePool}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Entry Fee (₹ INR)</label>
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
                <label className="form-label">Description & Circuit Protocol</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Format guidelines, stream links, check-in requirements..."
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
                  {actionLoading ? "Deploying..." : "⚡ Deploy Tournament"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tournaments Data Table */}
        <div className="admin-table-container">
          <div className="admin-table-header-row">
            <div>
              <h3 className="admin-table-title">Deployed Tournaments ({tournaments.length})</h3>
              <p className="admin-table-sub">Live competitive fixtures and registered brackets.</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-table-state">
              <div className="admin-spinner" style={{ margin: "0 auto 1rem" }}></div>
              <p>Loading tournaments directory...</p>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="empty-table-state">
              <div className="empty-table-icon">🏆</div>
              <h3>No Tournaments Found</h3>
              <p>Get started by deploying your first tournament battleground above.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Tournament</th>
                    <th>Game & Mode</th>
                    <th>Bracket Format</th>
                    <th>Schedule</th>
                    <th>Squad Slots</th>
                    <th>Status</th>
                    <th>Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map(t => (
                    <tr key={t._id}>
                      <td>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{t.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--accent-secondary)" }}>
                          Bounty: {formatINR(t.prizePool, { fallback: "Free / Glory" })}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{t.game}</span>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
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
                          {formatDateIST(t.startDate)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          to {formatDateIST(t.endDate)}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>
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
                          <Link to={`/tournaments/${t._id}`} className="btn btn-outline btn-xs" title="View Dossier">
                            Dossier
                          </Link>
                          <Link to={`/bracket?tournament=${t._id}`} className="btn btn-outline btn-xs" title="Bracket">
                            Bracket
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, id: t._id, name: t.name })}
                            className="btn btn-outline btn-xs"
                            style={{ borderColor: "rgba(255, 59, 59, 0.4)", color: "#FF6B6B" }}
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
            </div>
          )}
        </div>
      </div>

      {/* Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Tournament"
        message={`Are you sure you want to permanently delete "${deleteModal.name}"? This will cancel existing registrations.`}
        confirmText={actionLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
      />
    </div>
  );
};

export default AdminTournaments;
