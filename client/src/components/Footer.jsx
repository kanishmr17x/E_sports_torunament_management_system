import { Link } from "react-router-dom";
import "../styles/theme.css";

const Footer = () => {
  return (
    <footer className="footer-root">
      <div className="container footer-content-wrapper">
        <div className="footer-grid-top">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="brand">
              <span className="brand-icon">⚡</span>
              <span className="brand-accent">E</span>-SPORTS
            </Link>
            <p className="footer-desc">
              The premier platform for competitive tournaments, automated brackets, verified rosters, and live esports standings across top tactical and battle royale titles.
            </p>
            <div className="footer-status-badge">
              <span className="footer-status-dot"></span>
              Platform Systems 100% Operational
            </div>
          </div>

          {/* Navigation Column 1 */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Arenas</h4>
            <ul className="footer-list">
              <li><Link to="/tournaments" className="footer-link">Active Tournaments</Link></li>
              <li><Link to="/leaderboard" className="footer-link">Global Leaderboard</Link></li>
              <li><Link to="/matches" className="footer-link">Live Matches & Schedules</Link></li>
              <li><Link to="/results" className="footer-link">Tournament Results</Link></li>
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Rosters & Squads</h4>
            <ul className="footer-list">
              <li><Link to="/teams" className="footer-link">Team Directory</Link></li>
              <li><Link to="/players" className="footer-link">Player Database</Link></li>
              <li><Link to="/register-team" className="footer-link">Register Squad</Link></li>
              <li><Link to="/dashboard" className="footer-link">Player Dashboard</Link></li>
            </ul>
          </div>

          {/* Navigation Column 3 */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Support & Rules</h4>
            <ul className="footer-list">
              <li><Link to="/contact" className="footer-link">Help Desk & Contact</Link></li>
              <li><Link to="/tournaments" className="footer-link">Fair Play Guidelines</Link></li>
              <li><Link to="/contact" className="footer-link">Anti-Cheat Policies</Link></li>
              <li><Link to="/contact" className="footer-link">Organizer Inquiries</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            © 2026 E-Sports Tournament Platform India. Engineered for competitive excellence • Asia/Kolkata (IST).
          </p>
          <div className="footer-bottom-badges">
            <span className="footer-tag">BGMI</span>
            <span className="footer-tag">Free Fire India</span>
            <span className="footer-tag">Valorant India</span>
            <span className="footer-tag">Counter-Strike 2</span>
            <span className="footer-tag">All-India Circuit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
