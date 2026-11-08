import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  getTournaments, 
  getTeams, 
  getUserStats, 
  getRegistrationStats, 
  getPaymentStats 
} from "../../api/apiRoutes";
import "../../styles/theme.css";
import "../../styles/reports.css";

const Reports = () => {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    totalTeams: 0,
    totalUsers: 0,
    players: 0,
    organizers: 0,
    totalRegistrations: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [
          tournamentsRes,
          teamsRes,
          userStatsRes,
          regStatsRes,
          payStatsRes
        ] = await Promise.allSettled([
          getTournaments(),
          getTeams(),
          getUserStats(),
          getRegistrationStats(),
          getPaymentStats()
        ]);

        const totalTournaments = tournamentsRes.status === "fulfilled" && Array.isArray(tournamentsRes.value) ? tournamentsRes.value.length : 0;
        const totalTeams = teamsRes.status === "fulfilled" && Array.isArray(teamsRes.value) ? teamsRes.value.length : 0;
        
        const userData = userStatsRes.status === "fulfilled" ? userStatsRes.value : {};
        const regData = regStatsRes.status === "fulfilled" ? regStatsRes.value : {};
        const payData = payStatsRes.status === "fulfilled" ? payStatsRes.value : {};

        setStats({
          totalTournaments,
          totalTeams,
          totalUsers: userData.totalUsers || 0,
          players: userData.byRole?.players || 0,
          organizers: userData.byRole?.organizers || 0,
          totalRegistrations: regData.total || 0,
          totalRevenue: payData.totalRevenue || 0
        });
      } catch (err) {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const totalRoleUsers = (stats.players + stats.organizers) || 1;
  const playerPercent = Math.round((stats.players / totalRoleUsers) * 100);
  const organizerPercent = Math.round((stats.organizers / totalRoleUsers) * 100);

  return (
    <div className="reports-page">
      {/* Page Header */}
      <header className="reports-header">
        <Link to="/admin" className="btn btn-outline btn-sm" style={{ marginBottom: "1rem", display: "inline-flex" }}>
          ← Back to Admin Console
        </Link>
        <h1 className="admin-title">📊 Analytics & Platform Intelligence</h1>
        <p className="admin-subtitle">
          Real-time metrics on tournaments, user acquisition, team formations, and platform health.
        </p>
      </header>

      {/* KPI Stats Grid */}
      <section className="reports-stats-grid">
        <div className="report-stat-card">
          <div className="report-stat-icon">🏆</div>
          <div className="report-stat-value" style={{ color: "var(--neon-cyan)" }}>
            {loading ? "--" : stats.totalTournaments}
          </div>
          <div className="report-stat-label">Tournaments Hosted</div>
          <div className="report-stat-desc">Brackets created across all titles</div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon">👥</div>
          <div className="report-stat-value" style={{ color: "var(--neon-blue)" }}>
            {loading ? "--" : stats.totalTeams}
          </div>
          <div className="report-stat-label">Registered Squads</div>
          <div className="report-stat-desc">Competitive esports rosters</div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon">👤</div>
          <div className="report-stat-value" style={{ color: "var(--neon-purple)" }}>
            {loading ? "--" : stats.totalUsers}
          </div>
          <div className="report-stat-label">Total Platform Users</div>
          <div className="report-stat-desc">Athletes, captains & organizers</div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon">📝</div>
          <div className="report-stat-value" style={{ color: "var(--neon-pink)" }}>
            {loading ? "--" : stats.totalRegistrations}
          </div>
          <div className="report-stat-label">Tournament Entries</div>
          <div className="report-stat-desc">Verified team registrations</div>
        </div>
      </section>

      {/* Distribution Breakdown Card */}
      <section className="reports-chart-card">
        <div className="reports-chart-header">
          <h2 className="admin-section-heading" style={{ margin: 0 }}>
            👥 User Role Distribution
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Active Accounts
          </span>
        </div>

        <div className="distribution-list">
          <div className="distribution-item">
            <div className="distribution-meta">
              <span>🎮 Players & Athletes ({stats.players})</span>
              <span style={{ color: "var(--neon-cyan)" }}>{playerPercent}%</span>
            </div>
            <div className="distribution-bar-bg">
              <div
                className="distribution-bar-fill cyan"
                style={{ width: `${playerPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="distribution-item">
            <div className="distribution-meta">
              <span>🛡️ Tournament Organizers ({stats.organizers})</span>
              <span style={{ color: "#ffd700" }}>{organizerPercent}%</span>
            </div>
            <div className="distribution-bar-bg">
              <div
                className="distribution-bar-fill purple"
                style={{ width: `${organizerPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Health & Infrastructure Card */}
      <section className="reports-chart-card">
        <div className="reports-chart-header">
          <h2 className="admin-section-heading" style={{ margin: 0 }}>
            ⚙️ System Health & Infrastructure
          </h2>
          <span className="table-badge open">Online</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>API Runtime</span>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "0.25rem" }}>Node.js / Express</div>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Frontend Framework</span>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "0.25rem" }}>React 19 / Vite</div>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Data Engine</span>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "0.25rem" }}>MongoDB / Mongoose</div>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Deployment Target</span>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "0.25rem" }}>Vercel Full-Stack</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
