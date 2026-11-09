import { useState, useEffect } from "react";
import { registerTeam, getTournaments, getTeams } from "../../api/apiRoutes";

const TeamRegister = () => {
  const [teamId, setTeamId] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch teams and tournaments on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, tournamentsData] = await Promise.all([
          getTeams(),
          getTournaments()
        ]);
        setTeams(Array.isArray(teamsData) ? teamsData : []);
        setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
      } catch (err) {
        setError("Failed to load data");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Client-side validation
    if (!teamId.trim()) {
      setError("Team selection is required");
      setLoading(false);
      return;
    }

    if (!tournamentId.trim()) {
      setError("Tournament selection is required");
      setLoading(false);
      return;
    }

    try {
      await registerTeam({ 
        teamId: teamId.trim(),
        tournamentId: tournamentId.trim()
      });
      
      // The axios interceptor extracts the data, so response is already the data
      alert("Team registered successfully!");
      setTeamId("");
      setTournamentId("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to register team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Register Team to Tournament</h2>
      
      {error && (
        <div style={{ 
          color: "#ff4444", 
          backgroundColor: "#ffe6e6", 
          padding: "10px", 
          borderRadius: "4px", 
          marginBottom: "15px" 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Team</label>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ddd", 
              borderRadius: "4px" 
            }}
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.teamName} ({team.game})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Tournament</label>
          <select
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value)}
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ddd", 
              borderRadius: "4px" 
            }}
          >
            <option value="">Select Tournament</option>
            {tournaments.map((tournament) => (
              <option key={tournament._id} value={tournament._id}>
                {tournament.name} ({tournament.game})
              </option>
            ))}
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !teamId.trim() || !tournamentId.trim()}
          style={{ 
            backgroundColor: loading || !teamId.trim() || !tournamentId.trim() ? "#ccc" : "#007bff", 
            color: "white", 
            padding: "12px 20px", 
            border: "none", 
            borderRadius: "4px", 
            cursor: loading || !teamId.trim() || !tournamentId.trim() ? "not-allowed" : "pointer",
            width: "100%"
          }}
        >
          {loading ? "Registering..." : "Register Team"}
        </button>
      </form>
    </div>
  );
};

export default TeamRegister;
