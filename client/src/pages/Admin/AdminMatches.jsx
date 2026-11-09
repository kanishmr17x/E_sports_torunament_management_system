import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMatches, createMatch, updateMatch, enterMatchResult, deleteMatch, getTournaments } from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import "../../styles/theme.css";
import "../../styles/adminMatches.css";

const AdminMatches = () => {
    const navigate = useNavigate();
    const { isAdmin, isOrganizer, loading: authLoading } = useAuth();
    const [matches, setMatches] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingMatch, setEditingMatch] = useState(null);
    const [filterTournament, setFilterTournament] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, matchId: null });
    const [resultModal, setResultModal] = useState({ isOpen: false, match: null });

    const [formData, setFormData] = useState({
        tournamentId: "",
        round: 1,
        matchNumber: 1,
        team1: "",
        team2: "",
        scheduledAt: "",
        venue: "",
        serverInfo: "",
        status: "scheduled"
    });

    const [resultData, setResultData] = useState({
        team1Score: 0,
        team2Score: 0,
        notes: ""
    });

    useEffect(() => {
        if (!authLoading && !isAdmin && !isOrganizer) {
            navigate("/unauthorized");
        }
    }, [isAdmin, isOrganizer, authLoading, navigate]);

    useEffect(() => {
        loadTournaments();
    }, []);

    useEffect(() => {
        loadMatches();
    }, [filterTournament, filterStatus]);

    const loadTournaments = async () => {
        try {
            const res = await getTournaments();
            setTournaments(res);
        } catch (err) {
            console.error("Failed to load tournaments:", err);
        }
    };

    const loadMatches = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterTournament) params.tournamentId = filterTournament;
            if (filterStatus) params.status = filterStatus;
            
            const res = await getMatches(params);
            setMatches(res);
        } catch (err) {
            setError(err.message || "Failed to load matches");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitMatch = async (e) => {
        e.preventDefault();
        try {
            if (editingMatch) {
                await updateMatch(editingMatch._id, formData);
            } else {
                await createMatch(formData);
            }
            setShowForm(false);
            setEditingMatch(null);
            resetForm();
            loadMatches();
        } catch (err) {
            setError(err.message || "Failed to save match");
        }
    };

    const handleEnterResult = async () => {
        if (!resultModal.match) return;
        try {
            await enterMatchResult(resultModal.match._id, resultData);
            setResultModal({ isOpen: false, match: null });
            resetResultForm();
            loadMatches();
        } catch (err) {
            setError(err.message || "Failed to enter result");
        }
    };

    const openCreateForm = () => {
        setEditingMatch(null);
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (match) => {
        setEditingMatch(match);
        setFormData({
            tournamentId: match.tournamentId?._id || match.tournamentId,
            round: match.round,
            matchNumber: match.matchNumber,
            team1: match.team1?._id || match.team1,
            team2: match.team2?._id || match.team2,
            scheduledAt: match.scheduledAt ? new Date(match.scheduledAt).toISOString().slice(0, 16) : "",
            venue: match.venue || "",
            serverInfo: match.serverInfo || "",
            status: match.status
        });
        setShowForm(true);
    };

    const openResultModal = (match) => {
        if (match.status !== "completed" && match.status !== "live") {
            setResultData({
                team1Score: match.team1Score || 0,
                team2Score: match.team2Score || 0,
                notes: match.notes || ""
            });
            setResultModal({ isOpen: true, match });
        }
    };

    const openDeleteModal = (matchId) => {
        setDeleteModal({ isOpen: true, matchId });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, matchId: null });
    };

    const handleDelete = async () => {
        if (!deleteModal.matchId) return;
        try {
            await deleteMatch(deleteModal.matchId);
            closeDeleteModal();
            loadMatches();
        } catch (err) {
            setError(err.message || "Failed to delete match");
        }
    };

    const resetForm = () => {
        setFormData({
            tournamentId: "",
            round: 1,
            matchNumber: 1,
            team1: "",
            team2: "",
            scheduledAt: "",
            venue: "",
            serverInfo: "",
            status: "scheduled"
        });
    };

    const resetResultForm = () => {
        setResultData({
            team1Score: 0,
            team2Score: 0,
            notes: ""
        });
    };

    if (authLoading) {
        return (
            <div className="admin-page loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin && !isOrganizer) {
        return (
            <div className="admin-page unauthorized">
                <div className="unauthorized-content">
                    <div className="unauthorized-icon">🚫</div>
                    <h2>Access Denied</h2>
                    <p>You don&apos;t have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="header-content">
                    <div>
                        <h1>🎮 Match Management</h1>
                        <p className="subtitle">Create and manage tournament matches</p>
                    </div>
                    <button onClick={openCreateForm} className="btn btn-primary">
                        + Schedule Match
                    </button>
                </div>
            </header>

            <main className="admin-main">
                {error && <div className="alert alert-error">{error}</div>}

                {/* Filters */}
                <section className="filters-section">
                    <div className="filters">
                        <div className="filter-group">
                            <select
                                value={filterTournament}
                                onChange={(e) => setFilterTournament(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Tournaments</option>
                                {tournaments.map(t => (
                                    <option key={t._id} value={t._id}>{t.name} ({t.game})</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Status</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="live">Live</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Match Form Modal */}
                {showForm && (
                    <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingMatch(null); resetForm(); }}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{editingMatch ? "Edit Match" : "Schedule New Match"}</h3>
                                <button className="modal-close" onClick={() => { setShowForm(false); setEditingMatch(null); resetForm(); }}>×</button>
                            </div>
                            <form onSubmit={handleSubmitMatch} className="match-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="tournamentId">Tournament *</label>
                                        <select
                                            id="tournamentId"
                                            name="tournamentId"
                                            value={formData.tournamentId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, tournamentId: e.target.value }))}
                                            required
                                        >
                                            <option value="">Select Tournament</option>
                                            {tournaments.map(t => (
                                                <option key={t._id} value={t._id}>{t.name} ({t.game})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="round">Round *</label>
                                        <input
                                            type="number"
                                            id="round"
                                            name="round"
                                            value={formData.round}
                                            onChange={(e) => setFormData(prev => ({ ...prev, round: parseInt(e.target.value) }))}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="matchNumber">Match Number *</label>
                                        <input
                                            type="number"
                                            id="matchNumber"
                                            name="matchNumber"
                                            value={formData.matchNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, matchNumber: parseInt(e.target.value) }))}
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="team1">Team 1 *</label>
                                        <select
                                            id="team1"
                                            name="team1"
                                            value={formData.team1}
                                            onChange={(e) => setFormData(prev => ({ ...prev, team1: e.target.value }))}
                                            required
                                        >
                                            <option value="">Select Team 1</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="team2">Team 2 *</label>
                                        <select
                                            id="team2"
                                            name="team2"
                                            value={formData.team2}
                                            onChange={(e) => setFormData(prev => ({ ...prev, team2: e.target.value }))}
                                            required
                                        >
                                            <option value="">Select Team 2</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="scheduledAt">Scheduled Date/Time *</label>
                                        <input
                                            type="datetime-local"
                                            id="scheduledAt"
                                            name="scheduledAt"
                                            value={formData.scheduledAt}
                                            onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">Status</label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        >
                                            <option value="scheduled">Scheduled</option>
                                            <option value="live">Live</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="venue">Venue</label>
                                        <input
                                            type="text"
                                            id="venue"
                                            name="venue"
                                            value={formData.venue}
                                            onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                                            placeholder="Venue/Location"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="serverInfo">Server Info</label>
                                        <input
                                            type="text"
                                            id="serverInfo"
                                            name="serverInfo"
                                            value={formData.serverInfo}
                                            onChange={(e) => setFormData(prev => ({ ...prev, serverInfo: e.target.value }))}
                                            placeholder="Server IP/Region"
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">
                                        {editingMatch ? "Update Match" : "Create Match"}
                                    </button>
                                    <button type="button" onClick={() => { setShowForm(false); setEditingMatch(null); resetForm(); }} className="btn btn-outline">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Result Modal */}
                {resultModal.isOpen && (
                    <div className="modal-overlay" onClick={() => { setResultModal({ isOpen: false, match: null }); resetResultForm(); }}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Enter Match Result</h3>
                                <button className="modal-close" onClick={() => { setResultModal({ isOpen: false, match: null }); resetResultForm(); }}>×</button>
                            </div>
                            <form onSubmit={handleEnterResult} className="result-form">
                                <p><strong>{resultModal.match.team1?.teamName || "TBD"}</strong> vs <strong>{resultModal.match.team2?.teamName || "TBD"}</strong></p>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Team 1 Score</label>
                                        <input
                                            type="number"
                                            value={resultData.team1Score}
                                            onChange={(e) => setResultData(prev => ({ ...prev, team1Score: parseInt(e.target.value) || 0 }))}
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Team 2 Score</label>
                                        <input
                                            type="number"
                                            value={resultData.team2Score}
                                            onChange={(e) => setResultData(prev => ({ ...prev, team2Score: parseInt(e.target.value) || 0 }))}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="notes">Notes</label>
                                    <textarea
                                        id="notes"
                                        value={resultData.notes}
                                        onChange={(e) => setResultData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Match notes (optional)"
                                        rows="3"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">Save Result</button>
                                    <button type="button" onClick={() => { setResultModal({ isOpen: false, match: null }); resetResultForm(); }} className="btn btn-outline">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Matches Table */}
                <section className="matches-section">
                    <div className="section-header">
                        <h2 className="section-title">All Matches</h2>
                        <span className="match-count">{matches.length} matches</span>
                    </div>
                    
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading matches...</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🎮</div>
                            <h2>No Matches Found</h2>
                            <p>No matches scheduled yet. Click "Schedule Match" to create one.</p>
                        </div>
                    ) : (
                        <div className="matches-table-container">
                            <table className="matches-table">
                                <thead>
                                    <tr>
                                        <th>Tournament</th>
                                        <th>Round</th>
                                        <th>Match #</th>
                                        <th>Teams</th>
                                        <th>Scheduled</th>
                                        <th>Status</th>
                                        <th>Score</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matches.map(match => (
                                        <tr key={match._id}>
                                            <td>
                                                <div className="tournament-cell">
                                                    <strong>{match.tournamentId?.name || "Unknown"}</strong>
                                                    <span className="tournament-game">{match.tournamentId?.game}</span>
                                                </div>
                                            </td>
                                            <td>Round {match.round}</td>
                                            <td>#{match.matchNumber}</td>
                                            <td>
                                                <div className="match-teams-cell">
                                                    <span>{match.team1?.teamName || "TBD"}</span>
                                                    <span className="vs">vs</span>
                                                    <span>{match.team2?.teamName || "TBD"}</span>
                                                </div>
                                            </td>
                                            <td>{match.scheduledAt ? new Date(match.scheduledAt).toLocaleString() : "TBD"}</td>
                                            <td>
                                                <span className={`match-status ${match.status}`}>
                                                    {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                {match.status === "completed" && (
                                                    <span className="score">
                                                        {match.team1Score} - {match.team2Score}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button onClick={() => openEditForm(match)} className="btn btn-outline btn-sm">Edit</button>
                                                    {(match.status === "scheduled" || match.status === "live") && (
                                                        <button onClick={() => openResultModal(match)} className="btn btn-primary btn-sm">Result</button>
                                                    )}
                                                    <button onClick={() => openDeleteModal(match._id)} className="btn btn-danger btn-sm">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <ConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleDelete}
                    title="Delete Match"
                    message="Are you sure you want to delete this match? This action cannot be undone."
                    isLoading={false}
                />
            </main>
        </div>
    );
};

export default AdminMatches;