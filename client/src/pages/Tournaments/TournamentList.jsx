import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createTournament, getTournaments } from "../../api/apiRoutes";
import api from "../../api/axiosConfig";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import "../../styles/theme.css";
import "../../styles/tournament.css";

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, tournamentId: null, tournamentName: "" });
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useAuth();

  // Tournament creation form state
  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    game: "",
    type: "team",
    startDate: "",
    endDate: "",
    maxTeams: "",
    prizePool: "",
    description: ""
  });

  const games = [
    { id: "PUBG", name: "PUBG", icon: "🎯" },
    { id: "BGMI", name: "BGMI", icon: "🔫" },
    { id: "Free Fire", name: "Free Fire", icon: "🔥" },
    { id: "COD", name: "COD", icon: "⚔️" },
    { id: "Valorant", name: "Valorant", icon: "🛡️" },
    { id: "Other", name: "Other", icon: "🎮" }
  ];

  const tournamentTypes = [
    { value: "team", label: "Team" },
    { value: "solo", label: "Solo" },
    { value: "duo", label: "Duo" }
  ];

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    
    // Comprehensive form validation
    const errors = [];
    
    if (!tournamentForm.name.trim()) {
      errors.push("Tournament name is required");
    }
    
    if (!tournamentForm.game || tournamentForm.game.trim() === '') {
      errors.push("Please select a game");
    }
    
    if (!tournamentForm.type) {
      errors.push("Tournament type is required");
    }
    
    if (!tournamentForm.startDate || tournamentForm.startDate.trim() === '') {
      errors.push("Start date is required");
    }
    
    if (!tournamentForm.endDate || tournamentForm.endDate.trim() === '') {
      errors.push("End date is required");
    }
    
    if (!tournamentForm.maxTeams || tournamentForm.maxTeams < 2) {
      errors.push("Maximum teams must be at least 2");
    }
    
    if (tournamentForm.startDate && tournamentForm.endDate) {
      const start = new Date(tournamentForm.startDate);
      const end = new Date(tournamentForm.endDate);
      
      if (start >= end) {
        errors.push("End date must be after start date");
      }
    }
    
    // If there are validation errors, show them and don't proceed
    if (errors.length > 0) {
      setCreateError(errors.join(", "));
      return;
    }
    
    setCreateLoading(true);
    setCreateError("");
    setCreateSuccess(false);

    try {
      const tournamentData = {
        ...tournamentForm,
        maxTeams: parseInt(tournamentForm.maxTeams),
        prizePool: parseFloat(tournamentForm.prizePool) || 0
      };
      
      const response = await createTournament(tournamentData);
      
      setCreateSuccess(true);
      setTournamentForm({
        name: "",
        game: "",
        type: "team",
        startDate: "",
        endDate: "",
        maxTeams: "",
        prizePool: "",
        description: ""
      });
      setShowCreateForm(false);
      
      // Refresh tournaments list
      loadTournaments();
      
      // Clear success message after 3 seconds
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err) {
      // Handle different error types
      let errorMessage = "Failed to create tournament";
      
      if (err.response) {
        // Axios error with response
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data) {
          errorMessage = JSON.stringify(err.response.data);
        } else {
          errorMessage = `Server error (${err.response.status})`;
        }
      } else if (err.request) {
        // Network error (no response)
        errorMessage = "Network error. Please check your connection.";
      } else {
        // Other errors
        errorMessage = err.message || "An unexpected error occurred";
      }
      
      setCreateError(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTournamentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGameSelect = (gameId) => {
    setTournamentForm(prev => ({
      ...prev,
      game: gameId
    }));
  };

  const handleDeleteTournament = async (tournamentId, tournamentName) => {
    try {
      setDeleting(true);
      
      await api.delete(`/tournaments/${tournamentId}`);
      
      // Remove tournament from local state
      setTournaments(prevTournaments => prevTournaments.filter(tournament => tournament._id !== tournamentId));
      setDeleteModal({ isOpen: false, tournamentId: null, tournamentName: "" });
    } catch (err) {
      setError('Failed to delete tournament. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (tournamentId, tournamentName) => {
    setDeleteModal({ isOpen: true, tournamentId, tournamentName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, tournamentId: null, tournamentName: "" });
  };

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const tournamentsData = await getTournaments();
      setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  if (loading) {
    return (
      <div className="tournament-page">
        <section className="tournament-banner">
          <div className="tournament-banner-overlay" />
          <div className="tournament-banner-content">
            <h1 className="tournament-banner-title">🏆 Tournaments</h1>
            <p className="tournament-banner-subtitle">Discover upcoming brackets, rules, and prize pools.</p>
          </div>
        </section>

        <div className="tournament-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading tournaments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tournament-page">
        <section className="tournament-banner">
          <div className="tournament-banner-overlay" />
          <div className="tournament-banner-content">
            <h1 className="tournament-banner-title">🏆 Tournaments</h1>
            <p className="tournament-banner-subtitle">Discover upcoming brackets, rules, and prize pools.</p>
          </div>
        </section>

        <div className="tournament-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Error Loading Tournaments</h2>
            <p className="error-text">{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-page">
      <section className="tournament-banner">
        <div className="tournament-banner-overlay" />
        <div className="tournament-banner-content">
          <h1 className="tournament-banner-title">🏆 Tournaments</h1>
          <p className="tournament-banner-subtitle">Discover upcoming brackets, rules, and prize pools.</p>
        </div>
      </section>

      <div className="tournament-container">
        <div className="tournament-header">
          <div className="tournament-header-title">
            <span className="tournament-header-icon">🏆</span>
            Tournaments
          </div>
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="create-tournament-btn"
          >
            ➕ Create Tournament
          </button>
        </div>
        
        {tournaments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎮</div>
            <h2 className="empty-state-title">No Tournaments Found</h2>
            <p className="empty-state-text">
              Create your first tournament and start the competition!
            </p>
            <button 
              onClick={() => setShowCreateForm(true)} 
              className="create-tournament-btn"
            >
              ➕ Create First Tournament
            </button>
          </div>
        ) : (
          <div className="tournament-grid">
            {tournaments.map((tournament) => (
              <div key={tournament._id} className="tournament-card">
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
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="tournament-info-item">
                    <span className="tournament-info-label">End Date</span>
                    <span className="tournament-info-value">
                      {new Date(tournament.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="tournament-stats">
                  <div className="tournament-stat">
                    <div className="tournament-stat-value">{tournament.registeredTeams || 0}</div>
                    <div className="tournament-stat-label">Teams</div>
                  </div>
                  <div className="tournament-stat">
                    <div className="tournament-stat-value">{tournament.prizePool || '$0'}</div>
                    <div className="tournament-stat-label">Prize Pool</div>
                  </div>
                  <div className="tournament-stat">
                    <div className="tournament-stat-value">{tournament.duration || '0d'}</div>
                    <div className="tournament-stat-label">Duration</div>
                  </div>
                </div>

                <div className="tournament-status">
                  {tournament.status || 'upcoming'}
                </div>

                <div className="tournament-actions">
                  <Link to={`/tournaments/${tournament._id}`} className="tournament-action-btn">
                    👁️ View Details
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => openDeleteModal(tournament._id, tournament.name)}
                      className="tournament-action-btn delete-btn"
                      style={{
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        marginLeft: '8px'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Tournament Creation Modal */}
        {showCreateForm && (
          <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🏆 Create Tournament</h2>
                <button 
                  className="modal-close" 
                  onClick={() => setShowCreateForm(false)}
                >
                  ✕
                </button>
              </div>
              
              {createSuccess && (
                <div className="success-message">
                  ✅ Tournament created successfully!
                </div>
              )}
              
              {createError && (
                <div className="error-message">
                  ❌ {createError}
                </div>
              )}

              <form onSubmit={handleCreateTournament} className="tournament-form">
                <div className="form-section">
                  <h3 className="form-section-title">Tournament Details</h3>
                  
                  <div className="form-group">
                    <label htmlFor="name">Tournament Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={tournamentForm.name}
                      onChange={handleInputChange}
                      placeholder="Enter tournament name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Select Game *</label>
                    <div className="game-selection-grid">
                      {games.map((game) => (
                        <div
                          key={game.id}
                          className={`game-card ${tournamentForm.game === game.id ? 'selected' : ''}`}
                          onClick={() => handleGameSelect(game.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleGameSelect(game.id);
                            }
                          }}
                          aria-pressed={tournamentForm.game === game.id}
                          aria-label={`Select ${game.name} for tournament`}
                        >
                          <div className="game-icon">{game.icon}</div>
                          <div className="game-name">{game.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="type">Tournament Type *</label>
                    <select
                      id="type"
                      name="type"
                      value={tournamentForm.type}
                      onChange={handleInputChange}
                      required
                    >
                      {tournamentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={tournamentForm.description}
                      onChange={handleInputChange}
                      placeholder="Tournament description and rules"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Schedule & Settings</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="startDate">Start Date *</label>
                      <input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        value={tournamentForm.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="endDate">End Date *</label>
                      <input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        value={tournamentForm.endDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="maxTeams">Max Teams *</label>
                      <input
                        type="number"
                        id="maxTeams"
                        name="maxTeams"
                        value={tournamentForm.maxTeams}
                        onChange={handleInputChange}
                        placeholder="Maximum number of teams"
                        min="2"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="prizePool">Prize Pool ($)</label>
                      <input
                        type="number"
                        id="prizePool"
                        name="prizePool"
                        value={tournamentForm.prizePool}
                        onChange={handleInputChange}
                        placeholder="Prize pool amount"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={createLoading}
                  >
                    {createLoading ? "Creating Tournament..." : "🏆 Create Tournament"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={() => handleDeleteTournament(deleteModal.tournamentId, deleteModal.tournamentName)}
          title="Delete Tournament"
          message={`Are you sure you want to delete "${deleteModal.tournamentName}"? This action can be undone.`}
          isLoading={deleting}
        />
      </div>
    </div>
  );
};

export default TournamentList;
