import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/theme.css";

const Navbar = () => {
  const { user, isAdmin, isOrganizer, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="nav-root">
      <div className="nav-container">
        {/* Brand */}
        <Link to="/" className="brand" onClick={closeMenu} aria-label="E-SPORTS Home">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">
            <span className="brand-accent">E</span>-SPORTS
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links" aria-label="Main Navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Home
          </NavLink>
          <NavLink to="/tournaments" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Tournaments
          </NavLink>
          <NavLink to="/bracket" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Bracket
          </NavLink>
          <NavLink to="/matches" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Matches
          </NavLink>
          <NavLink to="/teams" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Teams
          </NavLink>
          <NavLink to="/players" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Players
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Leaderboard
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Contact
          </NavLink>

          {/* Authenticated Links */}
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Dashboard
            </NavLink>
          )}

          {(isAdmin || isOrganizer) && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? "nav-link active admin-link" : "nav-link admin-link")}>
              🛡️ Admin
            </NavLink>
          )}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="nav-auth">
          {user ? (
            <div className="nav-user-wrapper">
              <Link to="/dashboard" className="nav-user-chip" title="View Dashboard">
                <span className="nav-avatar">
                  {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="nav-username">{user.username || user.email}</span>
                <span className={`nav-role-tag ${user.role || "player"}`}>
                  {user.role || "player"}
                </span>
              </Link>
              <button onClick={handleLogout} className="btn nav-logout-btn" title="Sign Out">
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-guest-btns">
              <NavLink to="/login" className="btn btn-outline nav-btn-login">Login</NavLink>
              <NavLink to="/signup" className="btn btn-primary nav-btn-signup">Sign Up</NavLink>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          className={`nav-hamburger ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <nav className="mobile-menu-links">
            <NavLink to="/" end className="mobile-nav-link" onClick={closeMenu}>
              🏠 Home
            </NavLink>
            <NavLink to="/tournaments" className="mobile-nav-link" onClick={closeMenu}>
              🏆 Tournaments
            </NavLink>
            <NavLink to="/bracket" className="mobile-nav-link" onClick={closeMenu}>
              ⚔️ Bracket
            </NavLink>
            <NavLink to="/matches" className="mobile-nav-link" onClick={closeMenu}>
              🎯 Matches
            </NavLink>
            <NavLink to="/teams" className="mobile-nav-link" onClick={closeMenu}>
              👥 Teams
            </NavLink>
            <NavLink to="/players" className="mobile-nav-link" onClick={closeMenu}>
              🎮 Players
            </NavLink>
            <NavLink to="/leaderboard" className="mobile-nav-link" onClick={closeMenu}>
              📊 Leaderboard
            </NavLink>
            <NavLink to="/contact" className="mobile-nav-link" onClick={closeMenu}>
              ✉️ Contact
            </NavLink>

            {user && (
              <NavLink to="/dashboard" className="mobile-nav-link" onClick={closeMenu}>
                👤 Player Dashboard
              </NavLink>
            )}

            {(isAdmin || isOrganizer) && (
              <NavLink to="/admin" className="mobile-nav-link mobile-admin-link" onClick={closeMenu}>
                🛡️ Admin Management
              </NavLink>
            )}
          </nav>

          <div className="mobile-menu-footer">
            {user ? (
              <div className="mobile-user-box">
                <div className="mobile-user-info">
                  <span className="nav-avatar">{user.username ? user.username.charAt(0).toUpperCase() : "U"}</span>
                  <div>
                    <div className="mobile-username">{user.username}</div>
                    <div className="mobile-email">{user.email}</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="btn btn-outline btn-full">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mobile-guest-box">
                <Link to="/login" className="btn btn-outline btn-full" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-full" onClick={closeMenu}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
