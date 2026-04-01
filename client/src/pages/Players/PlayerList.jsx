import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPlayers } from "../../api/apiRoutes";
import api from "../../api/axiosConfig";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import "../../styles/theme.css";
import "../../styles/teams.css"; // Reuse teams styling

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, playerId: null, playerName: "" });
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useAuth();

  const handleDeletePlayer = async (playerId, playerName) => {
    try {
      setDeleting(true);
      
      await api.delete(`/players/${playerId}`);
      
      // Remove player from local state
      setPlayers(prevPlayers => prevPlayers.filter(player => player._id !== playerId));
      setDeleteModal({ isOpen: false, playerId: null, playerName: "" });
    } catch (err) {
      setError('Failed to delete player. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (playerId, playerName) => {
    setDeleteModal({ isOpen: true, playerId, playerName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, playerId: null, playerName: "" });
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await getPlayers();
        setPlayers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load players");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  if (loading) {
    return (
      <div className="teams-page">
        <section className="teams-banner">
          <div className="teams-banner-overlay" />
          <div className="teams-banner-content">
            <h1 className="teams-banner-title">🎮 Players</h1>
            <p className="teams-banner-subtitle">Browse all registered players and their profiles.</p>
          </div>
        </section>
        <div className="teams-container">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "#9aa0aa" }}>Loading players...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teams-page">
        <section className="teams-banner">
          <div className="teams-banner-overlay" />
          <div className="teams-banner-content">
            <h1 className="teams-banner-title">🎮 Players</h1>
            <p className="teams-banner-subtitle">Browse all registered players and their profiles.</p>
          </div>
        </section>
        <div className="teams-container">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <h2 style={{ color: "#ff6b6b" }}>Error Loading Players</h2>
            <p style={{ color: "#9aa0aa", marginBottom: "20px" }}>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teams-page">
      <section className="teams-banner">
        <div className="teams-banner-overlay" />
        <div className="teams-banner-content">
          <h1 className="teams-banner-title">🎮 Players</h1>
          <p className="teams-banner-subtitle">Browse all registered players and their profiles.</p>
        </div>
      </section>

      <div className="teams-container">
        <div className="teams-header">
          <div className="teams-header-title">
            <span className="teams-header-icon">🎮</span>
            Players
          </div>
          <Link to="/register" className="create-team-btn">
            ➕ Register Player
          </Link>
        </div>
        
        {players.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎮</div>
            <h2 className="empty-state-title">No Players Found</h2>
            <p className="empty-state-text">
              No players have been registered yet. Be the first to join!
            </p>
            <Link to="/register" className="create-team-btn">
              ➕ Register First Player
            </Link>
          </div>
        ) : (
          <div className="teams-grid">
            {players.map((player) => (
              <div key={player._id} className="team-card">
                <div className="team-card-header">
                  <h3 className="team-name">{player.playerName}</h3>
                  <p className="team-game">{player.gameId || 'Not specified'}</p>
                </div>
                
                <div className="team-card-body">
                  <div className="team-info">
                    <div className="team-info-item">
                      <span className="team-info-label">Role</span>
                      <span className="team-info-value">{player.role || 'Other'}</span>
                    </div>
                    <div className="team-info-item">
                      <span className="team-info-label">Age</span>
                      <span className="team-info-value">{player.age || 'N/A'}</span>
                    </div>
                    <div className="team-info-item">
                      <span className="team-info-label">Contact</span>
                      <span className="team-info-value">{player.contact}</span>
                    </div>
                    {player.teamId && (
                      <div className="team-info-item">
                        <span className="team-info-label">Team</span>
                        <span className="team-info-value">
                          {player.teamId.teamName || 'Assigned'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="team-card-footer">
                    <Link 
                      to={`/players/${player._id}`} 
                      className="btn btn-outline"
                      style={{ width: "100%" }}
                    >
                      View Details
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => openDeleteModal(player._id, player.playerName)}
                        className="btn btn-primary"
                        style={{
                          backgroundColor: '#dc3545',
                          border: '1px solid #dc3545',
                          width: "100%",
                          marginTop: '8px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeletePlayer(deleteModal.playerId, deleteModal.playerName)}
        title="Delete Player"
        message={`Are you sure you want to delete "${deleteModal.playerName}"? This action can be undone.`}
        isLoading={deleting}
      />
    </div>
  );
};

export default PlayerList;
