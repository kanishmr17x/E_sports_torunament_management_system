import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/theme.css";

const Navbar = () => {
  const { isAdmin } = useAuth();

  return (
    <header className="nav-root">
      <div className="nav-container">
        <Link to="/" className="brand">
          <span className="brand-accent">E</span>-Sports
        </Link>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
          <NavLink to="/tournaments" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Tournaments</NavLink>
          <NavLink to="/teams" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Teams</NavLink>
          <NavLink to="/players" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Players</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Contact</NavLink>
          <NavLink to="/register" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Register</NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active admin-link" : "nav-link admin-link"}>🎮 Admin</NavLink>
          )}
        </nav>
        <div className="nav-auth">
          <NavLink to="/login" className="btn btn-outline">Login</NavLink>
          <NavLink to="/signup" className="btn btn-primary">Sign Up</NavLink>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
