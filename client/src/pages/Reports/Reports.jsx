import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  getTournaments, 
  getTeams, 
  getUserStats, 
  getRegistrationStats, 
  getPaymentStats 
} from "../../api/apiRoutes";
import AdminNav from "../../components/AdminNav";
import StatCard from "../../components/StatCard";
import { formatIndianNumber } from "../../utils/formatters";
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
      } catch {
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
      <div className="container">
        {/* Universal Admin Navigation */}
        <AdminNav
          title="Platform Intelligence & Analytics"
          subtitle="Real-time telemetry on tournaments, user acquisition, team formations, and circuit health."
          actions={
            <Link to="/admin" className="btn btn-outline btn-sm">
              ← Dashboard Overview
            </Link>
          }
        />

        {/* Telemetry KPI Matrix */}
        <section className="reports-stats-grid">
          <StatCard
            kicker="Tournaments Hosted"
            value={loading ? "--" : formatIndianNumber(stats.totalTournaments)}
            icon="🏆"
            subtitle="Brackets created across all titles"
            accentColor="rgba(0, 212, 255, 0.4)"
          />

          <StatCard
            kicker="Enlisted Squads"
            value={loading ? "--" : formatIndianNumber(stats.totalTeams)}
            icon="👥"
            subtitle="Competitive esports rosters"
            accentColor="rgba(118, 87, 255, 0.4)"
          />

          <StatCard
            kicker="Platform Users"
            value={loading ? "--" : formatIndianNumber(stats.totalUsers)}
            icon="👤"
            subtitle="Athletes, captains & organizers"
            accentColor="rgba(167, 139, 250, 0.4)"
          />

          <StatCard
            kicker="Tournament Entries"
            value={loading ? "--" : formatIndianNumber(stats.totalRegistrations)}
            icon="📝"
            subtitle="Verified slot reservations"
            accentColor="rgba(245, 158, 11, 0.4)"
          />
        </section>

        {/* Distribution Breakdown & Circuit Health */}
        <div className="reports-charts-split">
          {/* User Role Distribution */}
          <section className="reports-chart-card">
            <div className="reports-chart-header">
              <div>
                <h3 className="admin-section-heading" style={{ margin: 0 }}>
                  👥 User Role Demographics
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                  Active verified accounts categorized by operational permissions.
                </p>
              </div>
              <span className="admin-status-tag">
                <span className="admin-status-pulse"></span> Active Sync
              </span>
            </div>

            <div className="distribution-list">
              <div className="distribution-item">
                <div className="distribution-meta">
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                    🎮 Players & Athletes ({stats.players})
                  </span>
                  <span style={{ color: "var(--accent-secondary)", fontWeight: 800 }}>
                    {playerPercent}%
                  </span>
                </div>
                <div className="distribution-bar-bg">
                  <div
                    className="distribution-bar-fill cyan"
                    style={{ width: `${playerPercent}%` }}
                  />
                </div>
              </div>

              <div className="distribution-item">
                <div className="distribution-meta">
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                    🛡️ Tournament Organizers ({stats.organizers})
                  </span>
                  <span style={{ color: "var(--accent-primary)", fontWeight: 800 }}>
                    {organizerPercent}%
                  </span>
                </div>
                <div className="distribution-bar-bg">
                  <div
                    className="distribution-bar-fill purple"
                    style={{ width: `${organizerPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* System Health & Architecture Status */}
          <section className="reports-chart-card">
            <div className="reports-chart-header">
              <div>
                <h3 className="admin-section-heading" style={{ margin: 0 }}>
                  ⚙️ System Health & Infrastructure
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                  Core stack runtime and service uptime telemetry.
                </p>
              </div>
              <span className="table-badge open">Operational</span>
            </div>

            <div className="reports-infra-grid">
              <div className="infra-tile">
                <span className="infra-label">API Runtime</span>
                <span className="infra-value">Node.js Express</span>
                <span className="infra-sub">REST / Bearer Auth</span>
              </div>
              <div className="infra-tile">
                <span className="infra-label">Frontend</span>
                <span className="infra-value">React 19 / Vite</span>
                <span className="infra-sub">Obsidian Cyber Arena</span>
              </div>
              <div className="infra-tile">
                <span className="infra-label">Data Engine</span>
                <span className="infra-value">MongoDB / Atlas</span>
                <span className="infra-sub">Schema Strictness</span>
              </div>
              <div className="infra-tile">
                <span className="infra-label">Production Target</span>
                <span className="infra-value">Vercel Serverless</span>
                <span className="infra-sub">Edge CDN Global</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Reports;
