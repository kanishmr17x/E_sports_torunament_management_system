import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeams, getTournaments } from "../../api/apiRoutes";
import "../../styles/theme.css";
import "../../styles/home.css";

const Home = () => {
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalTournaments: 0,
    totalPlayers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamsData, tournamentsData] = await Promise.all([
          getTeams(),
          getTournaments()
        ]);
        
        // Handle the response format (axios interceptor already extracts data)
        const teams = Array.isArray(teamsData) ? teamsData : [];
        const tournaments = Array.isArray(tournamentsData) ? tournamentsData : [];
        
        setStats({
          totalTeams: teams.length,
          totalTournaments: tournaments.length,
          totalPlayers: teams.reduce((sum, team) => sum + (team.totalMembers || 0), 0)
        });
      } catch (err) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <video autoPlay muted loop playsInline>
          <source src="/assets/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay">
          <h1 className="hero-title">🎮 E-Sports Tournament Platform</h1>
          <p className="hero-sub">
            Organize, discover, and compete in tournaments for Free Fire, PUBG, BGMI,
            COD, Valorant and more.
          </p>
        </div>
      </section>

      <div className="container">
        {!loading && (
          <div className="grid" style={{ marginTop: 24 }}>
            <div className="card">
              <h3>👥 Teams</h3>
              <p style={{ fontSize: 24, fontWeight: 700, color: "#00ffa3" }}>{stats.totalTeams}</p>
              <Link to="/teams" className="btn btn-outline" style={{ marginTop: 12 }}>View Teams</Link>
            </div>
            <div className="card">
              <h3>🏆 Tournaments</h3>
              <p style={{ fontSize: 24, fontWeight: 700, color: "#00ffa3" }}>{stats.totalTournaments}</p>
              <Link to="/tournaments" className="btn btn-outline" style={{ marginTop: 12 }}>View Tournaments</Link>
            </div>
            <div className="card">
              <h3>🎮 Players</h3>
              <p style={{ fontSize: 24, fontWeight: 700, color: "#00ffa3" }}>{stats.totalPlayers}</p>
              <Link to="/players" className="btn btn-outline" style={{ marginTop: 12 }}>View Players</Link>
            </div>
          </div>
        )}
        
        <div className="grid" style={{ marginTop: 24 }}>
          <Link to="/tournaments" className="card clickable" aria-label="Go to Tournaments">
            🏆 Organize Tournaments
          </Link>
          <Link to="/teams" className="card clickable" aria-label="Go to Teams">
            👥 Manage Teams
          </Link>
          <Link to="/tournaments" className="card clickable" aria-label="View Match Schedules">
            📅 Match Schedules
          </Link>
          <Link to="/register" className="card clickable" aria-label="Register your Team">
            📝 Easy Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
