import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import "../../styles/login.css";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrUsername: "", password: "", role: "player" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.emailOrUsername || !form.password || !form.role) return "Please fill all fields";
    return "";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");
    const v = validate();
    if (v) { setError(v); return; }
    try {
      setLoading(true);
      const data = await api.post("/auth/login", {
        emailOrUsername: form.emailOrUsername.trim(),
        password: form.password,
        role: form.role,
      });

      // Persist auth and role
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      // Store selected role for frontend routing (temporary simulation)
      localStorage.setItem("userRole", form.role);
      
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        // Role-based redirect logic
        if (form.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (form.role === "organizer") {
          navigate("/admin", { replace: true }); // Can be changed to /conductor later
        } else {
          navigate("/", { replace: true }); // Regular user goes to home
        }
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay" />
      <div className="login-card">
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Log in to manage teams and tournaments.</p>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <form onSubmit={handleLogin} noValidate>
          <div className="login-field">
            <label htmlFor="emailOrUsername" className="login-label">Email or Username</label>
            <input
              id="emailOrUsername"
              name="emailOrUsername"
              type="text"
              className="login-input"
              placeholder="you@example.com or gamer123"
              value={form.emailOrUsername}
              onChange={onChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="login-input"
              placeholder="Your password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="role" className="login-label">Role</label>
            <select
              id="role"
              name="role"
              className="login-input"
              value={form.role}
              onChange={onChange}
              required
            >
              <option value="player">Player</option>
              <option value="organizer">Tournament Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="login-button" disabled={loading} aria-busy={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-link-row">
          Don&apos;t have an account?
          <Link to="/signup" className="login-link">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
