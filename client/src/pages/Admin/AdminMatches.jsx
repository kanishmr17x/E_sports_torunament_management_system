import { useState } from "react";
import "../../styles/theme.css";

const AdminMatches = () => {
  const [matches, setMatches] = useState([]);
  const [formData, setFormData] = useState({
    tournament: "",
    team1: "",
    team2: "",
    matchDate: "",
    matchTime: "",
    matchType: "Group",
    matchStatus: "Scheduled"
  });
  const [errors, setErrors] = useState({});

  // Mock data for dropdowns
  const mockTournaments = [
    { id: 1, name: "CS:GO Championship 2024" },
    { id: 2, name: "League of Legends Spring Split" },
    { id: 3, name: "Valorant Masters" }
  ];

  const mockTeams = [
    { id: 1, name: "Team Alpha", tournament: 1 },
    { id: 2, name: "Team Beta", tournament: 1 },
    { id: 3, name: "Team Gamma", tournament: 2 },
    { id: 4, name: "Team Delta", tournament: 2 },
    { id: 5, name: "Team Epsilon", tournament: 3 },
    { id: 6, name: "Team Zeta", tournament: 3 }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.tournament) newErrors.tournament = "Tournament is required";
    if (!formData.team1) newErrors.team1 = "Team 1 is required";
    if (!formData.team2) newErrors.team2 = "Team 2 is required";
    if (formData.team1 === formData.team2) {
      newErrors.team2 = "Team 2 cannot be the same as Team 1";
    }
    if (!formData.matchDate) newErrors.matchDate = "Match date is required";
    if (!formData.matchTime) newErrors.matchTime = "Match time is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const tournamentName = mockTournaments.find(t => t.id === parseInt(formData.tournament))?.name || "";
      const team1Name = mockTeams.find(t => t.id === parseInt(formData.team1))?.name || "";
      const team2Name = mockTeams.find(t => t.id === parseInt(formData.team2))?.name || "";
      
      const newMatch = {
        id: Date.now(),
        tournament: tournamentName,
        team1: team1Name,
        team2: team2Name,
        date: new Date(formData.matchDate).toLocaleDateString(),
        time: formData.matchTime,
        matchType: formData.matchType,
        status: formData.matchStatus
      };
      setMatches([...matches, newMatch]);
      setFormData({
        tournament: "",
        team1: "",
        team2: "",
        matchDate: "",
        matchTime: "",
        matchType: "Group",
        matchStatus: "Scheduled"
      });
      setErrors({});
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleDelete = (id) => {
    setMatches(matches.filter(m => m.id !== id));
  };

  // Filter teams based on selected tournament
  const filteredTeams = formData.tournament 
    ? mockTeams.filter(team => team.tournament === parseInt(formData.tournament))
    : mockTeams;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
      padding: '80px 20px 40px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#fff',
            marginBottom: '16px',
            textShadow: '0 0 20px rgba(255, 105, 180, 0.5)'
          }}>🎮 Schedule Matches</h1>
          <p style={{ color: '#9aa0aa', fontSize: '1.1rem' }}>
            Create and manage tournament matches
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '30px',
          marginBottom: '40px'
        }}>
          <div className="card">
            <h2 style={{ color: '#FF69B4', marginBottom: '24px' }}>Schedule Match</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Tournament *
                </label>
                <select
                  name="tournament"
                  value={formData.tournament}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.tournament ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                >
                  <option value="">Select Tournament</option>
                  {mockTournaments.map(tournament => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
                {errors.tournament && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.tournament}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Team 1 *
                </label>
                <select
                  name="team1"
                  value={formData.team1}
                  onChange={handleInputChange}
                  disabled={!formData.tournament}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.team1 ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    opacity: !formData.tournament ? 0.5 : 1
                  }}
                >
                  <option value="">Select Team 1</option>
                  {filteredTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {errors.team1 && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.team1}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Team 2 *
                </label>
                <select
                  name="team2"
                  value={formData.team2}
                  onChange={handleInputChange}
                  disabled={!formData.tournament}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.team2 ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    opacity: !formData.tournament ? 0.5 : 1
                  }}
                >
                  <option value="">Select Team 2</option>
                  {filteredTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {errors.team2 && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.team2}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Match Date *
                </label>
                <input
                  type="date"
                  name="matchDate"
                  value={formData.matchDate}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.matchDate ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                />
                {errors.matchDate && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.matchDate}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Match Time *
                </label>
                <input
                  type="time"
                  name="matchTime"
                  value={formData.matchTime}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.matchTime ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                />
                {errors.matchTime && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.matchTime}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Match Type
                </label>
                <select
                  name="matchType"
                  value={formData.matchType}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                >
                  <option value="Group">Group</option>
                  <option value="Semi Final">Semi Final</option>
                  <option value="Final">Final</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Match Status
                </label>
                <select
                  name="matchStatus"
                  value={formData.matchStatus}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Schedule Match
              </button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ color: '#FF69B4', marginBottom: '24px' }}>Scheduled Matches</h2>
            {matches.length === 0 ? (
              <p style={{ color: '#9aa0aa', textAlign: 'center', padding: '40px' }}>
                No matches scheduled yet. Schedule your first match!
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Tournament</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Teams</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Time</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match) => (
                      <tr key={match.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <td style={{ padding: '12px', color: '#fff' }}>{match.tournament}</td>
                        <td style={{ padding: '12px', color: '#fff' }}>
                          {match.team1} vs {match.team2}
                        </td>
                        <td style={{ padding: '12px', color: '#fff' }}>{match.date}</td>
                        <td style={{ padding: '12px', color: '#fff' }}>{match.time}</td>
                        <td style={{ padding: '12px', color: '#fff' }}>
                          <span className="badge">{match.matchType}</span>
                        </td>
                        <td style={{ padding: '12px', color: '#fff' }}>
                          <span className={`badge ${match.status}`}>{match.status}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button
                            className="btn btn-outline"
                            style={{ marginRight: '8px', padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDelete(match.id)}
                            style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'rgba(255, 107, 107, 0.2)', borderColor: '#ff6b6b', color: '#ff6b6b' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMatches;
