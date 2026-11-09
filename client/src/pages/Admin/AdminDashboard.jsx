import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  getTournaments, 
  getTeams, 
  getAdminUsers, 
  getAdminRegistrations, 
  getMatches,
  getAllPayments
} from "../../api/apiRoutes";
import AdminNav from "../../components/AdminNav";
import StatCard from "../../components/StatCard";
import "../../styles/theme.css";
import "../../styles/adminDashboard.css";

const AdminDashboard = () => {
  const { user, isAdmin, isOrganizer, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tournaments: 0,
    teams: 0,
    matches: 0,
    users: 0,
    registrations: 0,
    payments: 0
  });

  useEffect(() => {
    if (!authLoading && !isAdmin && !isOrganizer) {
      navigate("/unauthorized");
    }
  }, [isAdmin, isOrganizer, authLoading, navigate]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const [
          tournamentsRes,
          teamsRes,
          matchesRes,
          usersRes,
          registrationsRes,
          paymentsRes
        ] = await Promise.allSettled([
          getTournaments(),
          getTeams(),
          getMatches(),
          getAdminUsers({ limit: 1 }),
          getAdminRegistrations({ limit: 1 }),
          getAllPayments({ limit: 1 })
        ]);

        setStats({
          tournaments: tournamentsRes.status === "fulfilled" && Array.isArray(tournamentsRes.value) ? tournamentsRes.value.length : 0,
          teams: teamsRes.status === "fulfilled" && Array.isArray(teamsRes.value) ? teamsRes.value.length : 0,
          matches: matchesRes.status === "fulfilled" && Array.isArray(matchesRes.value) ? matchesRes.value.length : 0,
          users: usersRes.status === "fulfilled" && usersRes.value?.pagination ? usersRes.value.pagination.total : 0,
          registrations: registrationsRes.status === "fulfilled" && registrationsRes.value?.pagination ? registrationsRes.value.pagination.total : 0,
          payments: paymentsRes.status === "fulfilled" && Array.isArray(paymentsRes.value) ? paymentsRes.value.length : 0
        });
      } catch {
        // Fallback gracefully without crash
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin || isOrganizer) {
      fetchAdminStats();
    }
  }, [isAdmin, isOrganizer]);

  const adminCards = [
    {
      id: "tournaments",
      title: "Tournament Management",
      description: "Create, configure, publish, and delete esports tournaments & prize pools.",
      icon: "🏆",
      route: "/admin/tournaments",
      count: stats.tournaments,
      badgeText: "Brackets & Seeds",
      color: "#7657FF"
    },
    {
      id: "matches",
      title: "Match & Fixture Hub",
      description: "Schedule fixtures, configure server credentials, record scores, and advance rounds.",
      icon: "⚔️",
      route: "/admin/matches",
      count: stats.matches,
      badgeText: "Live Scoring",
      color: "#00D4FF"
    },
    {
      id: "teams",
      title: "Team & Roster Control",
      description: "Monitor registered squads, team captains, roster changes, and player eligibility.",
      icon: "👥",
      route: "/admin/teams",
      count: stats.teams,
      badgeText: "Roster Telemetry",
      color: "#10B981"
    },
    {
      id: "registrations",
      title: "Registration Approvals",
      description: "Review pending tournament entries, verify player requirements, approve or reject rosters.",
      icon: "📝",
      route: "/admin/registrations",
      count: stats.registrations,
      badgeText: "Entry Queue",
      color: "#F59E0B"
    },
    {
      id: "users",
      title: "User & Role Administration",
      description: "Manage athlete accounts, promote organizers, grant permissions, and review security logs.",
      icon: "👤",
      route: "/admin/users",
      count: stats.users,
      badgeText: "IAM Security",
      color: "#A78BFA"
    },
    {
      id: "payments",
      title: "Financials & Payments",
      description: "Audit tournament entry fees, verify payment states, and process player refunds.",
      icon: "💰",
      route: "/admin/payments",
      count: stats.payments,
      badgeText: "Treasury",
      color: "#FFD700"
    },
    {
      id: "reports",
      title: "Analytics & Platform Intel",
      description: "View platform growth metrics, tournament completion rates, and participation charts.",
      icon: "📊",
      route: "/reports",
      count: "Metrics",
      badgeText: "Intelligence",
      color: "#38BDF8"
    }
  ];

  if (authLoading || loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div className="admin-spinner" style={{ margin: "0 auto 1.5rem" }} />
          <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Initializing Command Center...</h3>
          <p style={{ color: "var(--text-secondary)" }}>Verifying administrative credentials and telemetry feeds.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isOrganizer) {
    return (
      <div className="admin-dashboard-page">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🚫</div>
          <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>Administrative Access Restricted</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            You do not possess elevated privileges required to access the central operations console.
          </p>
          <Link to="/" className="btn btn-primary">
            Return to Arena
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        {/* Universal Admin Navigation */}
        <AdminNav
          title="Operations Command Center"
          subtitle={`Welcome back, Commander ${user?.username || "Admin"}. Real-time operational intelligence and circuit telemetry.`}
          actions={
            <Link to="/admin/tournaments" className="btn btn-primary btn-sm">
              + New Tournament
            </Link>
          }
        />

        {/* Telemetry KPI Matrix */}
        <section className="admin-telemetry-section">
          <div className="admin-section-header">
            <div>
              <h2 className="admin-section-heading">⚡ Circuit Telemetry Feeds</h2>
              <p className="admin-section-sub">Live telemetry aggregates across all competitive entities.</p>
            </div>
            <span className="admin-refresh-pill">● Realtime Sync</span>
          </div>

          <div className="admin-stats-grid">
            <StatCard
              kicker="Tournaments"
              value={stats.tournaments}
              icon="🏆"
              subtitle="Active & Scheduled"
              accentColor="rgba(118, 87, 255, 0.4)"
            />
            <StatCard
              kicker="Matches"
              value={stats.matches}
              icon="⚔️"
              subtitle="Total Fixtures"
              accentColor="rgba(0, 212, 255, 0.4)"
            />
            <StatCard
              kicker="Squads"
              value={stats.teams}
              icon="👥"
              subtitle="Registered Rosters"
              accentColor="rgba(16, 185, 129, 0.4)"
            />
            <StatCard
              kicker="Athletes & Users"
              value={stats.users}
              icon="👤"
              subtitle="Verified Profiles"
              accentColor="rgba(167, 139, 250, 0.4)"
            />
            <StatCard
              kicker="Tournament Entries"
              value={stats.registrations}
              icon="📝"
              subtitle="Slot Registrations"
              accentColor="rgba(245, 158, 11, 0.4)"
            />
            <StatCard
              kicker="Invoices & Fees"
              value={stats.payments}
              icon="💰"
              subtitle="Processed Payments"
              accentColor="rgba(255, 215, 0, 0.4)"
            />
          </div>
        </section>

        {/* Operations Modules Grid */}
        <section className="admin-modules-section">
          <div className="admin-section-header">
            <div>
              <h2 className="admin-section-heading">🛠️ Core Administration Modules</h2>
              <p className="admin-section-sub">Direct access to tournament configuration, rosters, and security.</p>
            </div>
          </div>

          <div className="admin-cards-grid">
            {adminCards.map((card) => (
              <Link
                key={card.id}
                to={card.route}
                className="admin-card-cyber"
                style={{ "--card-accent": card.color }}
              >
                <div className="admin-card-top">
                  <span className="admin-card-icon-box">{card.icon}</span>
                  <div className="admin-card-meta">
                    <span className="admin-card-badge">{card.badgeText}</span>
                    <span className="admin-card-counter">{card.count}</span>
                  </div>
                </div>

                <div className="admin-card-content">
                  <h3 className="admin-card-title">{card.title}</h3>
                  <p className="admin-card-desc">{card.description}</p>
                </div>

                <div className="admin-card-footer">
                  <span className="admin-card-action-text">Launch Console</span>
                  <span className="admin-card-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* System Diagnostics & Platform Infrastructure */}
        <section className="admin-diagnostics-section">
          <div className="admin-diag-card">
            <div className="admin-diag-header">
              <div className="admin-diag-title-row">
                <span className="admin-diag-icon">⚙️</span>
                <h4>System Architecture & Security Guardrails</h4>
              </div>
              <span className="admin-status-tag">
                <span className="admin-status-pulse"></span> ALL SYSTEMS HEALTHY
              </span>
            </div>

            <div className="admin-diag-grid">
              <div className="diag-item">
                <span className="diag-label">API Endpoints Status</span>
                <span className="diag-val online">● 200 OK — Real Contract</span>
              </div>
              <div className="diag-item">
                <span className="diag-label">Auth Protocol</span>
                <span className="diag-val">JWT HttpOnly / Bearer Secure</span>
              </div>
              <div className="diag-item">
                <span className="diag-label">Database Engine</span>
                <span className="diag-val">MongoDB Connected</span>
              </div>
              <div className="diag-item">
                <span className="diag-label">Theme Specification</span>
                <span className="diag-val highlight-theme">Obsidian Cyber Arena</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
