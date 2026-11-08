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
      } catch (err) {
        // Fallback without crashing
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
      color: "#FFD700"
    },
    {
      id: "teams",
      title: "Team & Roster Control",
      description: "Monitor registered squads, team captains, roster changes, and player eligibility.",
      icon: "👥",
      route: "/admin/teams",
      count: stats.teams,
      color: "#00ffa3"
    },
    {
      id: "matches",
      title: "Match & Schedule Hub",
      description: "Schedule fixtures, configure server credentials, record scores, and advance rounds.",
      icon: "⚔️",
      route: "/admin/matches",
      count: stats.matches,
      color: "#00d4ff"
    },
    {
      id: "registrations",
      title: "Registration Approvals",
      description: "Review pending tournament entries, verify player requirements, approve or reject rosters.",
      icon: "📝",
      route: "/admin/registrations",
      count: stats.registrations,
      color: "#ff006e"
    },
    {
      id: "users",
      title: "User & Role Administration",
      description: "Manage player accounts, promote organizers, grant permissions, and review security logs.",
      icon: "👤",
      route: "/admin/users",
      count: stats.users,
      color: "#b76bf7"
    },
    {
      id: "payments",
      title: "Financials & Payments",
      description: "Audit tournament entry fees, verify payment states, and process player refunds.",
      icon: "💰",
      route: "/admin/payments",
      count: stats.payments,
      color: "#f59e0b"
    },
    {
      id: "reports",
      title: "Analytics & Reports",
      description: "View platform growth metrics, tournament completion rates, and participation charts.",
      icon: "📊",
      route: "/reports",
      count: "Analytics",
      color: "#38bdf8"
    }
  ];

  if (authLoading || loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-loading-state">
          <div className="admin-spinner"></div>
          <p className="admin-subtitle">Loading admin control center...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isOrganizer) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-error-state">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚫</div>
          <h2 className="admin-title">Access Restricted</h2>
          <p className="admin-subtitle">You do not hold administrative privileges to access this console.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
            Return to Arena
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      {/* Admin Header */}
      <header className="admin-header">
        <div>
          <div className="admin-badge-row">
            <span className="admin-badge">🛡️ {isAdmin ? "System Administrator" : "Tournament Organizer"}</span>
            <span className="admin-badge" style={{ borderColor: "rgba(0, 255, 163, 0.3)", color: "var(--neon-cyan)" }}>
              Console v1.0
            </span>
          </div>
          <h1 className="admin-title">Operations Command Center</h1>
          <p className="admin-subtitle">
            Welcome back, <strong>{user?.username || "Admin"}</strong>. Manage tournaments, players, and fixtures in real time.
          </p>
        </div>

        <div className="admin-actions">
          <Link to="/tournaments" className="btn btn-outline btn-sm">
            Public View
          </Link>
          <Link to="/admin/tournaments" className="btn btn-primary btn-sm">
            + Create Tournament
          </Link>
        </div>
      </header>

      {/* Quick Metrics Bar */}
      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">🏆</div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.tournaments}</span>
            <span className="admin-stat-label">Tournaments</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.teams}</span>
            <span className="admin-stat-label">Teams</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">⚔️</div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.matches}</span>
            <span className="admin-stat-label">Matches</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👤</div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.users}</span>
            <span className="admin-stat-label">Users</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📝</div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.registrations}</span>
            <span className="admin-stat-label">Registrations</span>
          </div>
        </div>
      </section>

      {/* Management Operations Grid */}
      <section>
        <h2 className="admin-section-heading">⚡ Management Operations</h2>
        <div className="admin-cards-grid">
          {adminCards.map(card => (
            <Link
              key={card.id}
              to={card.route}
              className="admin-card"
              style={{ "--card-color": card.color }}
            >
              <div className="admin-card-header">
                <span className="admin-card-icon">{card.icon}</span>
                <span className="admin-card-count">{card.count}</span>
              </div>
              <h3 className="admin-card-title">{card.title}</h3>
              <p className="admin-card-desc">{card.description}</p>
              <div className="admin-card-footer">
                <span>Access Module</span>
                <span className="admin-card-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
