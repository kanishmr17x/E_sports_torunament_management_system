import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeams } from "../../api/apiRoutes";
import api from "../../api/axiosConfig";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import "../../styles/theme.css";
import "../../styles/teams.css";

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, teamId: null, teamName: "" });
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useAuth();

  const handleDeleteTeam = async (teamId, teamName) => {
    try {
      setDeleting(true);
      
      await api.delete(`/teams/${teamId}`);
      
      // Remove team from local state
      setTeams(prevTeams => prevTeams.filter(team => team._id !== teamId));
      setDeleteModal({ isOpen: false, teamId: null, teamName: "" });
    } catch (err) {
      setError('Failed to delete team. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (teamId, teamName) => {
    setDeleteModal({ isOpen: true, teamId, teamName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, teamId: null, teamName: "" });
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await getTeams();
        
        // Handle the response format (axios interceptor already extracts data)
        const teams = Array.isArray(teamsData) ? teamsData : [];
        setTeams(teams);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="teams-page">
        <section className="teams-banner">
          <div className="teams-banner-overlay" />
          <div className="teams-banner-content">
            <h1 className="teams-banner-title">👥 Teams</h1>
            <p className="teams-banner-subtitle">Explore rosters, games, and standings.</p>
          </div>
        </section>

        <div className="teams-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading teams...</p>
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
            <h1 className="teams-banner-title">👥 Teams</h1>
            <p className="teams-banner-subtitle">Explore rosters, games, and standings.</p>
          </div>
        </section>

        <div className="teams-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Error Loading Teams</h2>
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
    <div className="teams-page">
      <section className="teams-banner">
        <div className="teams-banner-overlay" />
        <div className="teams-banner-content">
          <h1 className="teams-banner-title">👥 Teams</h1>
          <p className="teams-banner-subtitle">Explore rosters, games, and standings.</p>
        </div>
      </section>

      <div className="teams-container">
        <div className="teams-header">
          <div className="teams-header-title">
            <span className="teams-header-icon">👥</span>
            Teams
          </div>
          <Link to="/register" className="create-team-btn">
            ➕ Create Team
          </Link>
        </div>
        
        {teams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎮</div>
            <h2 className="empty-state-title">No Teams Found</h2>
            <p className="empty-state-text">
              Be the first to create a team and start your esports journey!
            </p>
            <Link to="/register" className="create-team-btn">
              ➕ Create First Team
            </Link>
          </div>
        ) : (
          <div className="teams-grid">
            {teams.map((team) => (
              <div key={team._id} className="team-card">
                <div className="team-card-header">
                  <h3 className="team-name">{team.teamName}</h3>
                  <p className="team-game">{team.game}</p>
                </div>
                
                <div className="team-stats">
                  <div className="team-stat">
                    <div className="team-stat-value">{team.totalMembers || 0}</div>
                    <div className="team-stat-label">Members</div>
                  </div>
                  <div className="team-stat">
                    <div className="team-stat-value">{team.wins || 0}</div>
                    <div className="team-stat-label">Wins</div>
                  </div>
                  <div className="team-stat">
                    <div className="team-stat-value">{team.losses || 0}</div>
                    <div className="team-stat-label">Losses</div>
                  </div>
                </div>

                <div className="team-status">
                  {team.status || 'Active'}
                </div>

                <div className="team-card-footer">
                  <Link to={`/teams/${team._id}`} className="team-action-btn">
                    👁️ View Details
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => openDeleteModal(team._id, team.teamName)}
                      className="team-action-btn delete-btn"
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
      </div>
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteTeam(deleteModal.teamId, deleteModal.teamName)}
        title="Delete Team"
        message={`Are you sure you want to delete "${deleteModal.teamName}"? This action can be undone.`}
        isLoading={deleting}
      />
    </div>
  );
};

export default TeamList;
