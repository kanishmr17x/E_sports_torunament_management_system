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

    const games = ["PUBG", "BGMI", "Free Fire", "COD", "Valorant", "Other"];
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
            setTournaments(res.filter(t => t.status === "registration_open" || t.status === "upcoming"));
        } catch (err) {
            console.error("Failed to load tournaments:", err);
        }
    };

    const loadMyTeams = async () => {
        try {
            setLoading(true);
            const res = await getMyTeams();
            setTeams(res);
        } catch (err) {
            setError(err.message || "Failed to load teams");
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
            setCurrentTeam(teamRes);
            setPlayers(Array.isArray(playersRes) ? playersRes : (playersRes?.data || []));
            
            // Prefill form for editing
            if (teamRes) {
                setFormData({
                    teamName: teamRes.teamName,
                    game: teamRes.game,
                    tournamentId: teamRes.tournament?._id || teamRes.tournament || "",
                    status: teamRes.status
                });
            }
        } catch (err) {
            setError(err.message || "Failed to load team");
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
                setSuccess("Team created successfully!");
                setTimeout(() => {
                    navigate(`/dashboard/teams/${res._id}/manage`);
                }, 1000);
            } else {
                const res = await updateTeam(id, formData);
                setCurrentTeam(res);
                setSuccess("Team updated successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (err) {
            setError(err.message || "Failed to save team");
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
                age: parseInt(playerForm.age),
                contact: playerForm.contact.trim(),
                teamId: id
            });
            setPlayerForm({ playerName: "", gameId: "", role: "Other", age: "", contact: "" });
            setSuccess("Player added successfully!");
            loadTeam(id);
        } catch (err) {
            setError(err.message || "Failed to add player");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlayer = async (playerId) => {
        if (!window.confirm("Are you sure you want to remove this player?")) return;
        try {
            await deletePlayer(playerId);
            setPlayers(prev => prev.filter(p => p._id !== playerId));
            setSuccess("Player removed successfully!");
        } catch (err) {
            setError("Failed to remove player");
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
            setSuccess("Team deleted successfully!");
            setTimeout(() => navigate("/dashboard/teams"), 1000);
        } catch (err) {
            setError(err.message || "Failed to delete team");
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

    const isCaptain = currentTeam?.captain?._id === user?._id || currentTeam?.captain === user?._id;

    if (loading && mode !== "list") {
        return (
            <div className="team-mgmt-page loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Loading team...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="team-mgmt-page">
            <header className="team-mgmt-header">
                <div className="header-content">
                    <div>
                        <h1>{mode === "create" ? "Create New Team" : mode === "edit" ? "Manage Team" : "My Teams"}</h1>
                        <p className="subtitle">
                            {mode === "list" ? "View and manage your teams" : "Build your roster and dominate the competition"}
                        </p>
                    </div>
                    {mode !== "list" && (
                        <Link to="/dashboard/teams" className="btn btn-outline">
                            ← Back to Teams
                        </Link>
                    )}
                    {mode === "list" && (
                        <button onClick={handleNewTeam} className="btn btn-primary">
                            + Create New Team
                        </button>
                    )}
                </div>
            </header>

            <main className="team-mgmt-main">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {mode === "list" && (
                    <div className="teams-list-view">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading your teams...</p>
                            </div>
                        ) : teams.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">👥</div>
                                <h2>No Teams Yet</h2>
                                <p>Create your first team and start competing in tournaments!</p>
                                <button onClick={handleNewTeam} className="btn btn-primary">
                                    + Create Your First Team
                                </button>
                            </div>
                        ) : (
                            <div className="teams-grid">
                                {teams.map(team => (
                                    <div key={team._id} className="team-card">
                                        <div className="team-card-header">
                                            <h3>{team.teamName}</h3>
                                            <span className="team-game">{team.game}</span>
                                        </div>
                                        <div className="team-card-body">
                                            <div className="team-info">
                                                <span><strong>Tournament:</strong> {team.tournament?.name || "N/A"}</span>
                                                <span><strong>Status:</strong> <span className={`status-badge ${team.status}`}>{team.status}</span></span>
                                                <span><strong>Members:</strong> {team.totalMembers || 0}</span>
                                            </div>
                                        </div>
                                        <div className="team-card-actions">
                                            <Link to={`/dashboard/teams/${team._id}/manage`} className="btn btn-primary">Manage</Link>
                                            <Link to={`/teams/${team._id}`} className="btn btn-outline">View Public</Link>
                                            <button
                                                onClick={() => openDeleteModal(team._id, team.teamName)}
                                                className="btn btn-danger"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {(mode === "create" || mode === "edit") && currentTeam && (
                    <div className="team-edit-view">
                        <form onSubmit={handleSubmitTeam} className="team-form">
                            <div className="form-section">
                                <h2>Team Information</h2>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="teamName">Team Name *</label>
                                        <input
                                            type="text"
                                            id="teamName"
                                            name="teamName"
                                            value={formData.teamName}
                                            onChange={handleInputChange}
                                            placeholder="Enter team name"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="game">Game *</label>
                                        <select
                                            id="game"
                                            name="game"
                                            value={formData.game}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Select Game</option>
                                            {games.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="tournamentId">Tournament *</label>
                                        <select
                                            id="tournamentId"
                                            name="tournamentId"
                                            value={formData.tournamentId}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Select Tournament</option>
                                            {tournaments.map(t => (
                                                <option key={t._id} value={t._id}>
                                                    {t.name} ({t.game})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">Status</label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        >
                                            <option value="current">Current</option>
                                            <option value="upcoming">Upcoming</option>
                                            <option value="past">Past</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? "Saving..." : mode === "create" ? "Create Team" : "Update Team"}
                                </button>
                                {mode === "edit" && (
                                    <button type="button" onClick={handleBackToList} className="btn btn-outline">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>

                        {isCaptain && (
                            <div className="players-section">
                                <div className="section-header">
                                    <h2>👥 Team Roster ({players.length} players)</h2>
                                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddPlayer(true)}>
                                        + Add Player
                                    </button>
                                </div>

                                <div className="players-grid">
                                    {players.length === 0 ? (
                                        <p className="empty-state">No players added yet. Click "Add Player" to build your roster.</p>
                                    ) : (
                                        players.map(player => (
                                            <div key={player._id} className="player-card">
                                                <div className="player-info">
                                                    <h4>{player.playerName}</h4>
                                                    <div className="player-meta">
                                                        <span>Role: {player.role}</span>
                                                        <span>Age: {player.age}</span>
                                                        <span>Contact: {player.contact}</span>
                                                        <span>Game ID: {player.gameId}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePlayer(player._id)}
                                                    className="btn btn-danger btn-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add Player Modal */}
                                {showAddPlayer && (
                                    <div className="modal-overlay" onClick={() => setShowAddPlayer(false)}>
                                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                                            <div className="modal-header">
                                                <h3>Add New Player</h3>
                                                <button className="modal-close" onClick={() => setShowAddPlayer(false)}>×</button>
                                            </div>
                                            <form onSubmit={handleAddPlayer} className="player-form">
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label htmlFor="playerName">Player Name *</label>
                                                        <input
                                                            type="text"
                                                            id="playerName"
                                                            name="playerName"
                                                            value={playerForm.playerName}
                                                            onChange={handlePlayerInputChange}
                                                            placeholder="Player name"
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="gameId">Game ID *</label>
                                                        <input
                                                            type="text"
                                                            id="gameId"
                                                            name="gameId"
                                                            value={playerForm.gameId}
                                                            onChange={handlePlayerInputChange}
                                                            placeholder="In-game username/ID"
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label htmlFor="role">Role</label>
                                                        <select
                                                            id="role"
                                                            name="role"
                                                            value={playerForm.role}
                                                            onChange={handlePlayerInputChange}
                                                            disabled={loading}
                                                        >
                                                            {playerRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="age">Age *</label>
                                                        <input
                                                            type="number"
                                                            id="age"
                                                            name="age"
                                                            value={playerForm.age}
                                                            onChange={handlePlayerInputChange}
                                                            placeholder="Age"
                                                            min="13"
                                                            max="100"
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="contact">Contact *</label>
                                                    <input
                                                        type="text"
                                                        id="contact"
                                                        name="contact"
                                                        value={playerForm.contact}
                                                        onChange={handlePlayerInputChange}
                                                        placeholder="Email or phone"
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                                <div className="form-actions">
                                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                                        {loading ? "Adding..." : "Add Player"}
                                                    </button>
                                                    <button type="button" onClick={() => setShowAddPlayer(false)} className="btn btn-outline">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <ConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleDeleteTeam}
                    title="Delete Team"
                    message={`Are you sure you want to delete "${deleteModal.teamName}"? This action cannot be undone.`}
                    isLoading={loading}
                />
            </main>
        </div>
    );
};

export default TeamManagement;