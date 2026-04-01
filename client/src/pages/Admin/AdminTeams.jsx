import { useState } from "react";
import "../../styles/theme.css";

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    contactEmail: "",
    tournament: ""
  });
  const [errors, setErrors] = useState({});

  // Mock tournaments for dropdown
  const mockTournaments = [
    { id: 1, name: "CS:GO Championship 2024" },
    { id: 2, name: "League of Legends Spring Split" },
    { id: 3, name: "Valorant Masters" }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.teamName.trim()) newErrors.teamName = "Team name is required";
    if (!formData.captainName.trim()) newErrors.captainName = "Captain name is required";
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }
    if (!formData.tournament) newErrors.tournament = "Tournament selection is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const tournamentName = mockTournaments.find(t => t.id === parseInt(formData.tournament))?.name || "";
      const newTeam = {
        id: Date.now(),
        ...formData,
        tournament: tournamentName
      };
      setTeams([...teams, newTeam]);
      setFormData({
        teamName: "",
        captainName: "",
        contactEmail: "",
        tournament: ""
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
    setTeams(teams.filter(t => t.id !== id));
  };

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
            textShadow: '0 0 20px rgba(0, 206, 209, 0.5)'
          }}>👥 Manage Teams</h1>
          <p style={{ color: '#9aa0aa', fontSize: '1.1rem' }}>
            Organize and manage team rosters
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '30px',
          marginBottom: '40px'
        }}>
          <div className="card">
            <h2 style={{ color: '#00CED1', marginBottom: '24px' }}>Add Team</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Team Name *
                </label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.teamName ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                />
                {errors.teamName && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.teamName}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Captain Name *
                </label>
                <input
                  type="text"
                  name="captainName"
                  value={formData.captainName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.captainName ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                />
                {errors.captainName && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.captainName}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Contact Email *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.contactEmail ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                />
                {errors.contactEmail && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.contactEmail}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
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

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Add Team
              </button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ color: '#00CED1', marginBottom: '24px' }}>Teams List</h2>
            {teams.length === 0 ? (
              <p style={{ color: '#9aa0aa', textAlign: 'center', padding: '40px' }}>
                No teams added yet. Add your first team!
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Team Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Captain</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Tournament</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr key={team.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <td style={{ padding: '12px', color: '#fff' }}>{team.teamName}</td>
                        <td style={{ padding: '12px', color: '#fff' }}>{team.captainName}</td>
                        <td style={{ padding: '12px', color: '#fff' }}>{team.tournament}</td>
                        <td style={{ padding: '12px' }}>
                          <button
                            className="btn btn-outline"
                            style={{ marginRight: '8px', padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDelete(team.id)}
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

export default AdminTeams;
