import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTournamentById } from "../../api/apiRoutes";
import "../../styles/theme.css";

const TournamentDetails = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const response = await getTournamentById(id);
        
        // Handle the new response format with success/data structure
        const tournament = response.success ? response.data : response;
        setTournament(tournament);
      } catch (err) {
        setError(err.message || "Failed to fetch tournament");
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <p style={{ color: "#9aa0aa" }}>Loading tournament details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2 style={{ color: "#ff6b6b" }}>Tournament Not Found</h2>
        <p style={{ color: "#9aa0aa", marginBottom: "20px" }}>{error}</p>
        <Link to="/tournaments" className="btn btn-primary">Back to Tournaments</Link>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2 style={{ color: "#ff6b6b" }}>Tournament Not Found</h2>
        <p style={{ color: "#9aa0aa", marginBottom: "20px" }}>Tournament with ID {id} was not found.</p>
        <Link to="/tournaments" className="btn btn-primary">Back to Tournaments</Link>
      </div>
    );
  }

  return (
    <div>
      <section className="banner">
        <div className="banner-overlay" />
        <div className="banner-content">
          <h1>{tournament.name}</h1>
          <p>{tournament.game} Tournament</p>
        </div>
      </section>

      <div className="container">
        <div className="grid" style={{ marginTop: 24 }}>
          <div className="card">
            <h3>Tournament Information</h3>
            <p><strong>Game:</strong> {tournament.game}</p>
            <p><strong>Type:</strong> <span className="badge">{tournament.type}</span></p>
            <p><strong>Status:</strong> <span className={`badge ${tournament.status}`}>{tournament.status}</span></p>
            <p><strong>Start Date:</strong> {new Date(tournament.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(tournament.endDate).toLocaleDateString()}</p>
            <p><strong>Max Teams:</strong> {tournament.maxTeams}</p>
            <p><strong>Registered Teams:</strong> {tournament.teams ? tournament.teams.length : 0}</p>
            <p><strong>Prize Pool:</strong> {tournament.prizePool || "$0"}</p>
            {tournament.description && (
              <p><strong>Description:</strong> {tournament.description}</p>
            )}
          </div>

          <div className="card">
            <h3>Actions</h3>
            <Link to={`/register?tournamentId=${tournament._id}`} className="btn btn-primary" style={{ marginRight: 8 }}>
              Register Team
            </Link>
            <Link to="/teams" className="btn btn-outline">
              View Teams
            </Link>
          </div>
        </div>

        {tournament.teams && tournament.teams.length > 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            <h3>Registered Teams</h3>
            <div className="grid">
              {tournament.teams.map((team) => (
                <div key={team._id} className="card" style={{ padding: 16 }}>
                  <h4>{team.teamName}</h4>
                  <p><strong>Game:</strong> {team.game}</p>
                  <p><strong>Status:</strong> <span className={`badge ${team.status}`}>{team.status}</span></p>
                  <Link to={`/teams/${team._id}`} className="btn btn-outline" style={{ marginTop: 8 }}>
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Link to="/tournaments" className="btn btn-outline">← Back to Tournaments</Link>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;
