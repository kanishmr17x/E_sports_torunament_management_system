import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import "../../styles/signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "player",
    teamName: "",
    teamTag: "",
    tournamentName: "",
    tournamentGame: "",
    tournamentType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) return "Please fill all required fields";
    if (form.username.length < 3) return "Username must be at least 3 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (!["player", "organizer"].includes(form.role)) return "Select a valid role";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");
    const v = validate();
    if (v) { setError(v); return; }
    try {
      setLoading(true);
      await api.post("/auth/register", {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
      
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-overlay" />
      <div className="signup-card">
        <h1 className="signup-title">Join the Arena</h1>
        <p className="signup-subtitle">Create your account to compete, organize, and dominate.</p>

        {error && <div className="signup-error">{error}</div>}
        {success && <div className="signup-success">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="signup-field">
            <label htmlFor="username" className="signup-label">Gamer Tag</label>
            <input
              id="username"
              name="username"
              type="text"
              className="signup-input"
              placeholder="e.g., ProGamer123"
              value={form.username}
              onChange={onChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="email" className="signup-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="signup-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="signup-grid-2">
            <div className="signup-field">
              <label htmlFor="password" className="signup-label">Password (min 6)</label>
              <input
                id="password"
                name="password"
                type="password"
                className="signup-input"
                placeholder="Secure password"
                value={form.password}
                onChange={onChange}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="signup-field">
              <label htmlFor="confirmPassword" className="signup-label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="signup-input"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={onChange}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="role" className="signup-label">Join As</label>
            <select
              id="role"
              name="role"
              className="signup-input"
              value={form.role}
              onChange={onChange}
              aria-label="Select role"
            >
              <option value="player">🎮 Player</option>
              <option value="organizer">🏆 Tournament Organizer</option>
            </select>
          </div>

          <div className="signup-field">
            <label htmlFor="teamName" className="signup-label">Team Name (Optional)</label>
            <input
              id="teamName"
              name="teamName"
              type="text"
              className="signup-input"
              placeholder="e.g., Alpha Squad"
              value={form.teamName}
              onChange={onChange}
            />
          </div>

          <div className="signup-field">
            <label htmlFor="teamTag" className="signup-label">Team Tag (Optional)</label>
            <input
              id="teamTag"
              name="teamTag"
              type="text"
              className="signup-input"
              placeholder="e.g., [AS]"
              maxLength={6}
              value={form.teamTag}
              onChange={onChange}
            />
          </div>

          {form.role === "organizer" && (
            <>
              <div className="signup-field">
                <label htmlFor="tournamentName" className="signup-label">Tournament Name</label>
                <input
                  id="tournamentName"
                  name="tournamentName"
                  type="text"
                  className="signup-input"
                  placeholder="e.g., Champions League 2025"
                  value={form.tournamentName}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="signup-grid-2">
                <div className="signup-field">
                  <label htmlFor="tournamentGame" className="signup-label">Game</label>
                  <select
                    id="tournamentGame"
                    name="tournamentGame"
                    className="signup-input"
                    value={form.tournamentGame}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select Game</option>
                    <option value="freefire">Free Fire</option>
                    <option value="pubg">PUBG Mobile</option>
                    <option value="bgmi">BGMI</option>
                    <option value="cod">Call of Duty</option>
                    <option value="valorant">Valorant</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="signup-field">
                  <label htmlFor="tournamentType" className="signup-label">Tournament Type</label>
                  <select
                    id="tournamentType"
                    name="tournamentType"
                    className="signup-input"
                    value={form.tournamentType}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="solo">Solo</option>
                    <option value="duo">Duo</option>
                    <option value="squad">Squad</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="signup-button" disabled={loading} aria-busy={loading}>
            {loading ? "Creating account..." : "Join Now"}
          </button>
        </form>

        <div className="signup-link-row">
          Already have an account?
          <Link to="/login" className="signup-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
