import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTeamById, getPlayersByTeam } from "../../api/apiRoutes";
import "../../styles/theme.css";

const TeamDetails = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const response = await getTeamById(id);
        
        // Handle the new response format with success/data structure
        const teamData = response.success ? response.data : response;
        setTeam(teamData);
        
        // Fetch players for this team
        if (teamData && teamData._id) {
          const playersData = await getPlayersByTeam(teamData._id);
          const playersList = playersData.success ? playersData.data : playersData;
          setPlayers(Array.isArray(playersList) ? playersList : []);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch team");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <p style={{ color: "#9aa0aa" }}>Loading team details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2 style={{ color: "#ff6b6b" }}>Team Not Found</h2>
        <p style={{ color: "#9aa0aa", marginBottom: "20px" }}>{error}</p>
        <Link to="/teams" className="btn btn-primary">Back to Teams</Link>
      </div>
    );
  }

  return (
    <div>
      {!team && !loading && !error ? (
        <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2 style={{ color: "#9aa0aa" }}>Team Not Found</h2>
          <p style={{ color: "#9aa0aa", marginBottom: "20px" }}>The team you're looking for doesn't exist.</p>
          <Link to="/teams" className="btn btn-primary">Back to Teams</Link>
        </div>
      ) : (
        <>
          <section className="banner">
            <div className="banner-overlay" />
            <div className="banner-content">
              <h1>{team?.teamName || 'Loading...'}</h1>
              <p>{team?.game || 'Loading...'} Team</p>
            </div>
          </section>

          <div className="container">
            <div className="grid" style={{ marginTop: 24 }}>
              <div className="card">
                <h3>Team Information</h3>
                <p><strong>Game:</strong> {team?.game || 'N/A'}</p>
                <p><strong>Status:</strong> <span className={`badge ${team?.status || 'current'}`}>{team?.status || 'N/A'}</span></p>
                <p><strong>Members:</strong> {team?.totalMembers || players.length || 0}</p>
                <p><strong>Created:</strong> {team?.createdAt ? new Date(team.createdAt).toLocaleDateString() : 'N/A'}</p>
                
                {team?.logo && (
                  <div style={{ marginTop: 16 }}>
                    <img 
                      src={team.logo} 
                      alt={`${team.teamName} logo`} 
                      style={{ maxWidth: 120, borderRadius: 8 }}
                    />
                  </div>
                )}
              </div>

              <div className="card">
                <h3>Actions</h3>
                <Link to={`/register?teamId=${team?._id}`} className="btn btn-primary" style={{ marginRight: 8 }}>
                  Register Team
                </Link>
                <Link to="/tournaments" className="btn btn-outline">
                  View Tournaments
                </Link>
              </div>
            </div>

            {/* Players Section */}
            <div style={{ marginTop: 24 }}>
              <div className="card">
                <h3>Players ({players.length})</h3>
                {players.length === 0 ? (
                  <p style={{ color: "#9aa0aa", textAlign: "center", padding: "20px 0" }}>
                    No players registered for this team yet.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {players.map((player) => (
                      <div key={player._id} style={{ 
                        padding: "12px", 
                        border: "1px solid #ddd", 
                        borderRadius: "6px",
                        backgroundColor: "#f9f9f9"
                      }}>
                        <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>
                          {player.playerName}
                        </h4>
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                          <strong>Role:</strong> {player.role || 'Other'}
                        </p>
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                          <strong>Contact:</strong> {player.contact}
                        </p>
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                          <strong>Age:</strong> {player.age}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <Link to="/teams" className="btn btn-outline">← Back to Teams</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamDetails;
