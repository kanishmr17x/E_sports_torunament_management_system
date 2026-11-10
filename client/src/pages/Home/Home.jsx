import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeams, getTournaments, getUpcomingMatches } from "../../api/apiRoutes";
import TournamentCard from "../../components/TournamentCard";
import MatchCard from "../../components/MatchCard";
import StatCard from "../../components/StatCard";
import { formatIndianNumber } from "../../utils/formatters";
import "../../styles/theme.css";
import "../../styles/components.css";
import "../../styles/home.css";

const Home = () => {
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalTournaments: 0,
    totalPlayers: 0,
    activeTournaments: 0
  });
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState("all");

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [teamsData, tournamentsData, matchesData] = await Promise.allSettled([
          getTeams(),
          getTournaments(),
          getUpcomingMatches()
        ]);

        const rawTeams = teamsData.status === "fulfilled" && Array.isArray(teamsData.value) ? teamsData.value : [];
        const rawTournaments = tournamentsData.status === "fulfilled" && Array.isArray(tournamentsData.value) ? tournamentsData.value : [];
        const rawMatches = matchesData.status === "fulfilled" && Array.isArray(matchesData.value) ? matchesData.value : [];

        setTeams(rawTeams);
        setTournaments(rawTournaments);
        setMatches(rawMatches);

        setStats({
          totalTeams: rawTeams.length,
          totalTournaments: rawTournaments.length,
          totalPlayers: rawTeams.reduce((sum, team) => sum + (team.totalMembers || 0), 0),
          activeTournaments: rawTournaments.filter(t => t.status === "live" || t.status === "registration_open" || t.status === "open").length
        });
      } catch (err) {
        // Handled silently to avoid breaking UI
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const featuredGames = [
    { id: "all", name: "All Arenas", icon: "🌐" },
    { id: "BGMI", name: "BGMI", icon: "🔫", tag: "Battle Royale" },
    { id: "Free Fire", name: "Free Fire", icon: "🔥", tag: "Survival Shooter" },
    { id: "Valorant", name: "Valorant India", icon: "🛡️", tag: "Tactical FPS" },
    { id: "CS2", name: "Counter-Strike 2", icon: "💣", tag: "Competitive FPS" },
    { id: "COD", name: "COD: Mobile", icon: "⚔️", tag: "Arena FPS" }
  ];

  // Pick the prime featured tournament
  const featuredTournament = tournaments.find(t => t.status === "registration_open" || t.status === "open" || t.status === "live") || tournaments[0] || {
    _id: "preview-1",
    name: "BGMI All-India Championship 2026",
    game: "BGMI",
    type: "team",
    prizePool: 1000000,
    maxTeams: 32,
    registeredTeams: 24,
    status: "registration_open",
    startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    description: "The premier Indian esports circuit featuring elite squads from Mumbai, Delhi, Bengaluru, Chennai, and Hyderabad. Double elimination brackets with live spectator telemetry."
  };

  // Filter tournaments for discovery grid
  const filteredTournaments = selectedGame === "all"
    ? tournaments.slice(0, 6)
    : tournaments.filter(t => t.game?.toLowerCase().includes(selectedGame.toLowerCase())).slice(0, 6);

  return (
    <div className="home-page-pro">
      {/* =========================================================================
          1. ASYMMETRIC HERO ARENA
          ========================================================================= */}
      <section className="hero-asymmetric">
        <div className="container hero-asymmetric-grid">
          {/* Left Column: Mission, Headlines & Live Ribbons */}
          <div className="hero-left-col">
            <div className="hero-pill-badge">
              <span className="live-dot-pulse" />
              <span>TIER-1 ESPORTS CIRCUIT • 2026</span>
            </div>

            <h1 className="hero-headline-pro">
              COMPETE. <span className="gradient-text">DOMINATE.</span> ASCEND.
            </h1>

            <p className="hero-description-pro">
              The premier esports arena platform for competitive tournament management,
              automated brackets, verified athlete rosters, and real-time match telemetry.
            </p>

            <div className="hero-actions-group">
              <Link to="/tournaments" className="btn btn-primary btn-lg">
                🏆 Enter Tournaments
              </Link>
              <Link to="/teams" className="btn btn-outline btn-lg">
                👥 Find a Squad
              </Link>
              <Link to="/register-team" className="btn btn-secondary btn-lg">
                ⚡ Register Squad
              </Link>
            </div>

            {/* Quick KPI Bar under Hero */}
            <div className="hero-kpi-ribbon">
              <div className="kpi-ribbon-item">
                <span className="kpi-val">{loading ? "--" : formatIndianNumber(stats.totalTournaments) || "12+"}</span>
                <span className="kpi-lbl">Arenas Hosted</span>
              </div>
              <div className="kpi-ribbon-divider" />
              <div className="kpi-ribbon-item">
                <span className="kpi-val">{loading ? "--" : formatIndianNumber(stats.totalTeams) || "48+"}</span>
                <span className="kpi-lbl">Verified Squads</span>
              </div>
              <div className="kpi-ribbon-divider" />
              <div className="kpi-ribbon-item">
                <span className="kpi-val">{loading ? "--" : formatIndianNumber(stats.totalPlayers) || "240+"}</span>
                <span className="kpi-lbl">Active Athletes</span>
              </div>
            </div>
          </div>

          {/* Right Column: Heroic Featured Spotlight Card */}
          <div className="hero-right-col">
            <div className="spotlight-header-tag">
              <span>⭐ SPOTLIGHT EVENT</span>
            </div>
            <TournamentCard
              tournament={featuredTournament}
              variant="featured"
              className="hero-spotlight-card"
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. LIVE MATCH TICKER RIBBON (When matches available)
          ========================================================================= */}
      {matches.length > 0 && (
        <section className="matches-ticker-ribbon">
          <div className="ticker-label-box">
            <span className="live-dot-pulse" />
            <span>LIVE FIXTURES</span>
          </div>
          <div className="ticker-scroll-track">
            {matches.slice(0, 6).map(match => (
              <MatchCard key={match._id} match={match} variant="ticker" />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          3. INTERACTIVE GAME EXPLORER STRIP
          ========================================================================= */}
      <section className="game-explorer-strip">
        <div className="container">
          <div className="game-chips-row">
            {featuredGames.map(game => (
              <button
                key={game.id}
                type="button"
                onClick={() => setSelectedGame(game.id)}
                className={`game-nav-chip ${selectedGame === game.id ? "active" : ""}`}
              >
                <span className="game-chip-icon">{game.icon}</span>
                <span className="game-chip-name">{game.name}</span>
                {game.tag && <span className="game-chip-tag">{game.tag}</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container home-content-flow">
        {/* =========================================================================
            4. ECOSYSTEM TELEMETRY
            ========================================================================= */}
        <section className="home-telemetry-section">
          <div className="section-header-flex">
            <div>
              <span className="section-eyebrow">PLATFORM METRICS</span>
              <h2 className="section-heading-pro">Live Ecosystem Telemetry</h2>
            </div>
            <Link to="/leaderboard" className="btn btn-outline btn-sm">
              Global Leaderboard →
            </Link>
          </div>

          <div className="grid grid-4 telemetry-grid">
            <StatCard
              label="Tournaments"
              value={loading ? "--" : stats.totalTournaments}
              subtext="Active brackets & qualifiers"
              icon="🏆"
              trend="+14% this month"
              trendDirection="up"
              accent="violet"
              progress={75}
            />
            <StatCard
              label="Registered Squads"
              value={loading ? "--" : stats.totalTeams}
              subtext="Competitive verified teams"
              icon="🛡️"
              trend="+28 new squads"
              trendDirection="up"
              accent="cyan"
              progress={85}
            />
            <StatCard
              label="Pro Athletes"
              value={loading ? "--" : stats.totalPlayers}
              subtext="Active roster competitors"
              icon="👤"
              trend="99.4% anti-cheat pass"
              trendDirection="up"
              accent="gold"
              progress={94}
            />
            <StatCard
              label="Live Status"
              value="100%"
              subtext="All systems operational"
              icon="⚡"
              trend="Zero downtime"
              trendDirection="neutral"
              accent="cyan"
              progress={100}
            />
          </div>
        </section>

        {/* =========================================================================
            5. TOURNAMENT DISCOVERY ARENA
            ========================================================================= */}
        <section className="home-discovery-section">
          <div className="section-header-flex">
            <div>
              <span className="section-eyebrow">COMPETITIVE ARENAS</span>
              <h2 className="section-heading-pro">Active &amp; Upcoming Tournaments</h2>
              <p className="section-subtext">Join open brackets or watch live matches</p>
            </div>
            <div className="section-actions-wrap">
              <Link to="/tournaments" className="btn btn-primary btn-sm">
                View All Events ({tournaments.length})
              </Link>
            </div>
          </div>

          {filteredTournaments.length === 0 ? (
            <div className="discovery-empty-card">
              <span className="empty-icon-lg">🏆</span>
              <h3>No Tournaments Found</h3>
              <p>There are no active tournaments for this filter right now.</p>
              <Link to="/tournaments" className="btn btn-outline">
                Browse All Arenas
              </Link>
            </div>
          ) : (
            <div className="tournaments-cards-grid">
              {filteredTournaments.map(tournament => (
                <TournamentCard
                  key={tournament._id}
                  tournament={tournament}
                  variant="compact"
                />
              ))}
            </div>
          )}
        </section>

        {/* =========================================================================
            6. FEATURED TEAMS & SQUADS ROSTER
            ========================================================================= */}
        {teams.length > 0 && (
          <section className="home-squads-section">
            <div className="section-header-flex">
              <div>
                <span className="section-eyebrow">COMPETITIVE SQUADS</span>
                <h2 className="section-heading-pro">Top Registered Teams</h2>
                <p className="section-subtext">Assemble your crew or scout opposing lineups</p>
              </div>
              <Link to="/teams" className="btn btn-outline btn-sm">
                Squad Directory ({teams.length}) →
              </Link>
            </div>

            <div className="squads-cards-grid">
              {teams.slice(0, 4).map(team => (
                <div key={team._id} className="squad-mini-card">
                  <div className="squad-mini-top">
                    <div className="squad-avatar-box">
                      {team.teamName ? team.teamName.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div className="squad-meta">
                      <h4 className="squad-name">{team.teamName}</h4>
                      <span className="squad-game">{team.game}</span>
                    </div>
                  </div>
                  <div className="squad-mini-stats">
                    <span className="squad-stat-item">
                      👥 {team.totalMembers || (Array.isArray(team.players) ? team.players.length : 0)} Members
                    </span>
                    <span className="squad-stat-item status-ok">
                      ● {team.status || "Ready"}
                    </span>
                  </div>
                  <Link to={`/teams/${team._id}`} className="btn btn-outline btn-sm squad-btn">
                    View Roster
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            7. PLATFORM PILLARS & TOURNAMENT ENGINE
            ========================================================================= */}
        <section className="home-pillars-section">
          <div className="section-header-center">
            <span className="section-eyebrow">ENGINE ARCHITECTURE</span>
            <h2 className="section-heading-pro">Engineered for Competitive Integrity</h2>
            <p className="section-subtext">Enterprise-grade infrastructure designed for zero-latency operations</p>
          </div>

          <div className="grid grid-4 pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon">⚡</div>
              <h3 className="pillar-title">Instant Brackets</h3>
              <p className="pillar-desc">
                Automated single and double elimination progression trees with dynamic seeding and score updates.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">🛡️</div>
              <h3 className="pillar-title">Anti-Cheat Verification</h3>
              <p className="pillar-desc">
                Strict player registration rules, verified game IDs, and roster lockouts protect tournament integrity.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">💰</div>
              <h3 className="pillar-title">Automated Payouts</h3>
              <p className="pillar-desc">
                Transparent prize pool distribution with instant financial ledger tracking and payment gateway integration.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">📊</div>
              <h3 className="pillar-title">Live Standings</h3>
              <p className="pillar-desc">
                Real-time leaderboard calculations, head-to-head records, and automated points scoring across rounds.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. HIGH-CONVERSION SQUAD RECRUITMENT BANNER
            ========================================================================= */}
        <section className="home-recruitment-banner">
          <div className="recruitment-banner-inner">
            <div className="banner-left">
              <span className="banner-kicker">READY TO ENTER THE ARENA?</span>
              <h2 className="banner-title">
                Assemble Your Squad. Climb the Circuit. Claim the Trophy.
              </h2>
              <p className="banner-desc">
                Join hundreds of competitive squads across BGMI, Free Fire India, Valorant India, and Counter-Strike 2.
                Tournaments hosted across Mumbai, Bengaluru, Delhi NCR, Hyderabad, and Chennai with automated brackets in IST.
              </p>
            </div>
            <div className="banner-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
              <Link to="/register-team" className="btn btn-outline btn-lg">
                Register a Team
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
