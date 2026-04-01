import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlayerById } from "../../api/apiRoutes";
import "../../styles/theme.css";

const PlayerDetails = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const response = await getPlayerById(id);
        
        // Handle the new response format with success/data structure
        const player = response.success ? response.data : response;
        setPlayer(player);
      } catch (err) {
        setError(err.message || "Failed to fetch player");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <p style={{ color: "#9aa0aa" }}>Loading player details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2 style={{ color: "#ff6b6b" }}>Player Not Found</h2>
        <p style={{ color: "#9aa0aa", marginBottom: "20px" }}>{error}</p>
        <Link to="/teams" className="btn btn-primary">Back to Teams</Link>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2 style={{ color: "#ff6b6b" }}>Player Not Found</h2>
        <p style={{ color: "#9aa0aa", marginBottom: "20px" }}>Player with ID {id} was not found.</p>
        <Link to="/teams" className="btn btn-primary">Back to Teams</Link>
      </div>
    );
  }

  return (
    <div>
      <section className="banner">
        <div className="banner-overlay" />
        <div className="banner-content">
          <h1>{player.playerName}</h1>
          <p>{player.gameId || 'Gamer'}</p>
        </div>
      </section>

      <div className="container">
        <div className="grid" style={{ marginTop: 24 }}>
          <div className="card">
            <h3>Player Information</h3>
            <p><strong>Name:</strong> {player.playerName}</p>
            <p><strong>Contact:</strong> {player.contact}</p>
            <p><strong>Game:</strong> {player.gameId || 'Not specified'}</p>
            <p><strong>Role:</strong> <span className="badge">{player.role || 'Other'}</span></p>
            <p><strong>Age:</strong> {player.age || 'Not specified'}</p>
            <p><strong>Joined:</strong> {new Date(player.createdAt).toLocaleDateString()}</p>
            
            {player.teamId && (
              <p><strong>Team:</strong> {player.teamId.teamName || 'No team assigned'}</p>
            )}
          </div>

          <div className="card">
            <h3>Actions</h3>
            <Link to={`/register?playerId=${player._id}`} className="btn btn-primary" style={{ marginRight: 8 }}>
              Register Player
            </Link>
            <Link to="/teams" className="btn btn-outline">
              View Teams
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <Link to="/teams" className="btn btn-outline">← Back to Teams</Link>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetails;
