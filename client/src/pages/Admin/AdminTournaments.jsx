import { useState } from "react";
import "../../styles/theme.css";

const AdminTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [formData, setFormData] = useState({
    tournamentName: "",
    gameTitle: "",
    startDate: "",
    endDate: "",
    format: "League",
    status: "Upcoming"
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.tournamentName.trim()) newErrors.tournamentName = "Tournament name is required";
    if (!formData.gameTitle.trim()) newErrors.gameTitle = "Game title is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newTournament = {
        id: Date.now(),
        ...formData,
        startDate: new Date(formData.startDate).toLocaleDateString(),
        endDate: new Date(formData.endDate).toLocaleDateString()
      };
      setTournaments([...tournaments, newTournament]);
      setFormData({
        tournamentName: "",
        gameTitle: "",
        startDate: "",
        endDate: "",
        format: "League",
        status: "Upcoming"
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
    setTournaments(tournaments.filter(t => t.id !== id));
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
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
          }}>🏆 Manage Tournaments</h1>
          <p style={{ color: '#9aa0aa', fontSize: '1.1rem' }}>
            Create and manage esports tournaments
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '30px',
          marginBottom: '40px'
        }}>
          <div className="card">
            <h2 style={{ color: '#FFD700', marginBottom: '24px' }}>Create Tournament</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Tournament Name *
                </label>
                <input
                  type="text"
                  name="tournamentName"
                  value={formData.tournamentName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.tournamentName ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                />
                {errors.tournamentName && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.tournamentName}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Game Title *
                </label>
                <input
                  type="text"
                  name="gameTitle"
                  value={formData.gameTitle}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.gameTitle ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                />
                {errors.gameTitle && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.gameTitle}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.startDate ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                />
                {errors.startDate && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors.endDate ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                />
                {errors.endDate && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {errors.endDate}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Format
                </label>
                <select
                  name="format"
                  value={formData.format}
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
                  <option value="League">League</option>
                  <option value="Knockout">Knockout</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
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
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Create Tournament
              </button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ color: '#FFD700', marginBottom: '24px' }}>Tournament List</h2>
            {tournaments.length === 0 ? (
              <p style={{ color: '#9aa0aa', textAlign: 'center', padding: '40px' }}>
                No tournaments created yet. Create your first tournament!
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Game</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Start Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>End Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Format</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((tournament) => (
                      <tr key={tournament.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <td style={{ padding: '12px', color: '#fff' }}>{tournament.tournamentName}</td>
                        <td style={{ padding: '12px', color: '#fff' }}>{tournament.gameTitle}</td>
                        <td style={{ padding: '12px', color: '#fff' }}>{tournament.startDate}</td>
                        <td style={{ padding: '12px', color: '#fff' }}>{tournament.endDate}</td>
                        <td style={{ padding: '12px', color: '#fff' }}>
                          <span className="badge">{tournament.format}</span>
                        </td>
                        <td style={{ padding: '12px', color: '#fff' }}>
                          <span className={`badge ${tournament.status}`}>{tournament.status}</span>
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
                            onClick={() => handleDelete(tournament.id)}
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

export default AdminTournaments;
