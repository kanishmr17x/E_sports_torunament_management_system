import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/theme.css";
import "../../styles/signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
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
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email address";
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
      await signup(
        form.username.trim(),
        form.email.trim().toLowerCase(),
        form.password,
        form.role
      );
      
      setSuccess("Athlete account created successfully! Entering the circuit...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 900);
    } catch (err) {
      setError(err.message || "Failed to create account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-overlay" />
      
      <div className="auth-editorial-shell">
        {/* Left Column: Editorial Showcase */}
        <aside className="auth-editorial-side">
          <div className="auth-editorial-badge">
            <span className="auth-pulse-dot" /> ENLISTMENT PROTOCOL
          </div>
          
          <h2 className="auth-editorial-title">
            Forge Your Esports Legacy in the Arena
          </h2>
          
          <p className="auth-editorial-desc">
            Register as a competitive athlete to deploy squads into championship brackets, or enroll as an organizer to host and broadcast tournaments.
          </p>

          <div className="auth-features-stack">
            <div className="auth-feature-row">
              <span className="auth-feature-icon">🛡️</span>
              <div>
                <strong>Squad Roster Management</strong>
                <p>Build, manage, and verify team athlete rosters with real-time stats.</p>
              </div>
            </div>
            <div className="auth-feature-row">
              <span className="auth-feature-icon">🏆</span>
              <div>
                <strong>Championship Brackets</strong>
                <p>Compete in automated single-elimination, double-elimination, and round-robin events.</p>
              </div>
            </div>
            <div className="auth-feature-row">
              <span className="auth-feature-icon">💎</span>
              <div>
                <strong>Audited Prize Pools</strong>
                <p>Official verified rewards, cash bounties, and circuit rankings.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Cyber Signup Card */}
        <main className="auth-card-side">
          <div className="signup-card">
            <div className="auth-card-header">
              <span className="auth-card-icon">🎮</span>
              <h1 className="signup-title">Enlist in the Arena</h1>
              <p className="signup-subtitle">Create your verified esports profile to begin competing.</p>
            </div>

            {error && <div className="signup-error">⚠️ {error}</div>}
            {success && <div className="signup-success">✅ {success}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="signup-field">
                <label htmlFor="username" className="signup-label">Gamer Tag / Athlete Handle *</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="signup-input"
                  placeholder="e.g. ShadowFragger"
                  value={form.username}
                  onChange={onChange}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="email" className="signup-label">Official Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="signup-input"
                  placeholder="you@domain.com"
                  value={form.email}
                  onChange={onChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="signup-grid-2">
                <div className="signup-field">
                  <label htmlFor="password" className="signup-label">Password * (min 6)</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="signup-input"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="signup-field">
                  <label htmlFor="confirmPassword" className="signup-label">Confirm Password *</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="signup-input"
                    placeholder="••••••••••••"
                    value={form.confirmPassword}
                    onChange={onChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="signup-field">
                <label htmlFor="role" className="signup-label">Circuit Access Role *</label>
                <select
                  id="role"
                  name="role"
                  className="signup-input"
                  value={form.role}
                  onChange={onChange}
                  aria-label="Select role"
                >
                  <option value="player">🎮 Competitor / Player</option>
                  <option value="organizer">🛡️ Tournament Organizer</option>
                </select>
              </div>

              <div className="signup-grid-2">
                <div className="signup-field">
                  <label htmlFor="teamName" className="signup-label">Squad Name (Optional)</label>
                  <input
                    id="teamName"
                    name="teamName"
                    type="text"
                    className="signup-input"
                    placeholder="e.g. Apex Predators"
                    value={form.teamName}
                    onChange={onChange}
                  />
                </div>

                <div className="signup-field">
                  <label htmlFor="teamTag" className="signup-label">Squad Tag (Optional)</label>
                  <input
                    id="teamTag"
                    name="teamTag"
                    type="text"
                    className="signup-input"
                    placeholder="e.g. [APX]"
                    maxLength={6}
                    value={form.teamTag}
                    onChange={onChange}
                  />
                </div>
              </div>

              {form.role === "organizer" && (
                <div className="organizer-extra-fields">
                  <div className="signup-field">
                    <label htmlFor="tournamentName" className="signup-label">Tournament Initiative</label>
                    <input
                      id="tournamentName"
                      name="tournamentName"
                      type="text"
                      className="signup-input"
                      placeholder="e.g. Winter Clash 2026"
                      value={form.tournamentName}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="signup-grid-2">
                    <div className="signup-field">
                      <label htmlFor="tournamentGame" className="signup-label">Game Title</label>
                      <select
                        id="tournamentGame"
                        name="tournamentGame"
                        className="signup-input"
                        value={form.tournamentGame}
                        onChange={onChange}
                        required
                      >
                        <option value="">Select Game</option>
                        <option value="bgmi">BGMI</option>
                        <option value="valorant">Valorant</option>
                        <option value="freefire">Free Fire MAX</option>
                        <option value="pubg">PUBG Mobile</option>
                        <option value="cod">Call of Duty</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="signup-field">
                      <label htmlFor="tournamentType" className="signup-label">Tournament Mode</label>
                      <select
                        id="tournamentType"
                        name="tournamentType"
                        className="signup-input"
                        value={form.tournamentType}
                        onChange={onChange}
                        required
                      >
                        <option value="">Select Mode</option>
                        <option value="squad">Squad (4v4)</option>
                        <option value="solo">Solo (1v1)</option>
                        <option value="duo">Duo (2v2)</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="signup-button btn btn-primary btn-full" disabled={loading} aria-busy={loading}>
                {loading ? "Registering Profile..." : "⚡ Enlist in Arena"}
              </button>
            </form>

            <div className="signup-link-row">
              Already have an active athlete profile?
              <Link to="/login" className="signup-link">Login Here →</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Signup;
