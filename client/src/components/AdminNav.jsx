import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../hooks/useAuth";

const AdminNav = ({ title = "Operations Command Center", subtitle, actions }) => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const navItems = [
    { id: "overview", label: "Overview", icon: "📊", path: "/admin" },
    { id: "tournaments", label: "Tournaments", icon: "🏆", path: "/admin/tournaments" },
    { id: "matches", label: "Matches", icon: "⚔️", path: "/admin/matches" },
    { id: "teams", label: "Teams", icon: "👥", path: "/admin/teams" },
    { id: "registrations", label: "Registrations", icon: "📝", path: "/admin/registrations" },
    { id: "users", label: "Users", icon: "👤", path: "/admin/users" },
    { id: "payments", label: "Payments", icon: "💰", path: "/admin/payments" },
    { id: "reports", label: "Analytics", icon: "📈", path: "/reports" },
  ];

  const currentPath = location.pathname;

  return (
    <div className="admin-nav-shell">
      {/* Top Banner / Identity Bar */}
      <div className="admin-nav-header">
        <div className="admin-nav-info">
          <div className="admin-nav-tags">
            <span className="admin-role-tag">
              🛡️ {isAdmin ? "System Administrator" : "Tournament Organizer"}
            </span>
            <span className="admin-status-tag">
              <span className="admin-status-pulse"></span> SYSTEM ACTIVE
            </span>
            {user?.username && (
              <span className="admin-user-tag">
                👤 {user.username}
              </span>
            )}
          </div>
          <h1 className="admin-nav-title">{title}</h1>
          {subtitle && <p className="admin-nav-subtitle">{subtitle}</p>}
        </div>

        <div className="admin-nav-actions">
          {actions}
          <Link to="/tournaments" className="btn btn-outline btn-sm">
            🌐 Public Arena
          </Link>
        </div>
      </div>

      {/* Module Switcher Strip */}
      <nav className="admin-module-tabs" aria-label="Admin Navigation Tabs">
        <div className="admin-tabs-scroll">
          {navItems.map((item) => {
            const isActive = item.path === "/admin" 
              ? currentPath === "/admin"
              : currentPath.startsWith(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`admin-tab-item ${isActive ? "active" : ""}`}
              >
                <span className="admin-tab-icon">{item.icon}</span>
                <span className="admin-tab-label">{item.label}</span>
                {isActive && <span className="admin-tab-indicator" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

AdminNav.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
};

export default AdminNav;
