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
        
        const teams = Array.isArray(teamsData) ? teamsData : [];
        const tournaments = Array.isArray(tournamentsData) ? tournamentsData : [];
        
        setStats({
          totalTeams: teams.length,
          totalTournaments: tournaments.length,
          totalPlayers: teams.reduce((sum, team) => sum + (team.totalMembers || 0), 0)
        });
      } catch (err) {
        // Fallback gracefully without breaking UI
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const featuredGames = [
    { name: "Valorant", tag: "Tactical FPS", icon: "🛡️" },
    { name: "BGMI / PUBG", tag: "Battle Royale", icon: "🔫" },
    { name: "Free Fire", tag: "Survival Shooter", icon: "🔥" },
    { name: "Call of Duty", tag: "Arena FPS", icon: "⚔️" },
    { name: "Apex Legends", tag: "Hero Shooter", icon: "🎯" }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            NEXT-GEN COMPETITIVE TOURNAMENT ARENA
          </div>

          <h1 className="hero-title">
            COMPETE. DOMINATE. <span className="gradient-text">ASCEND.</span>
          </h1>

          <p className="hero-sub">
            The premier tournament management and competitive esports platform.
            Join brackets, track match schedules, recruit top players, and climb live leaderboards.
          </p>

          <div className="home-cta">
            <Link to="/tournaments" className="btn btn-primary">
              🏆 Explore Tournaments
            </Link>
            <Link to="/teams" className="btn btn-outline">
              👥 Discover Teams
            </Link>
            <Link to="/register" className="btn btn-glass">
              ⚡ Register Now
            </Link>
          </div>

          {/* Featured Games Bar */}
          <div className="hero-games-bar">
            <span className="games-bar-label">SUPPORTED TITLES:</span>
            <div className="games-chips">
              {featuredGames.map(game => (
                <div key={game.name} className="game-chip">
                  <span className="game-icon">{game.icon}</span>
                  <span className="game-name">{game.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="container">
        {/* Live Ecosystem Stats */}
        <section className="home-stats-section">
          <div className="stats-header">
            <h2 className="section-title">📊 Ecosystem Overview</h2>
            <p className="section-desc">Live community and tournament activity</p>
          </div>

          <div className="grid grid-3">
            <div className="card stat-card-hover">
              <div className="stat-card-header">
                <span className="stat-icon-wrapper cyan">🏆</span>
                <span className="stat-growth-tag">Active</span>
              </div>
              <h3 className="stat-title">Tournaments</h3>
              <p className="stat-big-number cyan">{loading ? "--" : stats.totalTournaments}</p>
              <p className="stat-subtext">Open brackets & upcoming events</p>
              <Link to="/tournaments" className="btn btn-outline btn-sm stat-btn">
                Browse Tournaments →
              </Link>
            </div>

            <div className="card stat-card-hover">
              <div className="stat-card-header">
                <span className="stat-icon-wrapper purple">👥</span>
                <span className="stat-growth-tag">Registered</span>
              </div>
              <h3 className="stat-title">Teams</h3>
              <p className="stat-big-number purple">{loading ? "--" : stats.totalTeams}</p>
              <p className="stat-subtext">Competitive squads ready for battle</p>
              <Link to="/teams" className="btn btn-outline btn-sm stat-btn">
                Explore Teams →
              </Link>
            </div>

            <div className="card stat-card-hover">
              <div className="stat-card-header">
                <span className="stat-icon-wrapper blue">🎮</span>
                <span className="stat-growth-tag">Verified</span>
              </div>
              <h3 className="stat-title">Players</h3>
              <p className="stat-big-number blue">{loading ? "--" : stats.totalPlayers}</p>
              <p className="stat-subtext">Esports athletes & roster members</p>
              <Link to="/players" className="btn btn-outline btn-sm stat-btn">
                View Players →
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Hub Grid */}
        <section className="home-features-section">
          <div className="stats-header">
            <h2 className="section-title">⚡ Tournament Operations Hub</h2>
            <p className="section-desc">Complete end-to-end tooling for players, captains, and organizers</p>
          </div>

          <div className="grid grid-4">
            <Link to="/tournaments" className="card feature-card clickable" aria-label="Browse Tournaments">
              <div className="feature-icon">🏆</div>
              <h4 className="feature-title">Bracket Engine</h4>
              <p className="feature-desc">Single elimination, double elimination, and round-robin structures.</p>
              <span className="feature-link-text">Enter Arenas →</span>
            </Link>

            <Link to="/teams" className="card feature-card clickable" aria-label="Manage Teams">
              <div className="feature-icon">👥</div>
              <h4 className="feature-title">Roster Management</h4>
              <p className="feature-desc">Assemble your lineup, assign captains, and coordinate team entries.</p>
              <span className="feature-link-text">Manage Squads →</span>
            </Link>

            <Link to="/leaderboard" className="card feature-card clickable" aria-label="View Leaderboards">
              <div className="feature-icon">📈</div>
              <h4 className="feature-title">Live Leaderboards</h4>
              <p className="feature-desc">Track standings, points distribution, kill counts, and match results.</p>
              <span className="feature-link-text">Check Standings →</span>
            </Link>

            <Link to="/contact" className="card feature-card clickable" aria-label="Support and Contact">
              <div className="feature-icon">🛡️</div>
              <h4 className="feature-title">Fair Play & Support</h4>
              <p className="feature-desc">Direct support, dispute resolution, and community inquiries.</p>
              <span className="feature-link-text">Get Support →</span>
            </Link>
          </div>
        </section>

        {/* CTA Conversion Banner */}
        <section className="home-cta-banner">
          <div className="cta-banner-content">
            <h2 className="cta-banner-title">Ready to take your squad to the top tier?</h2>
            <p className="cta-banner-subtitle">
              Register your team, join open tournaments, and compete for verified prize pools.
            </p>
            <div className="cta-banner-actions">
              <Link to="/signup" className="btn btn-primary">
                Create Free Account
              </Link>
              <Link to="/tournaments" className="btn btn-outline">
                View Open Events
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
