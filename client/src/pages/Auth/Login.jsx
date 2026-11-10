import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/theme.css";
import "../../styles/login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.emailOrUsername || !form.password) return "Please fill all fields";
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
      const data = await login(form.emailOrUsername.trim(), form.password);
      
      setSuccess("Authentication verified! Entering the arena...");
      setTimeout(() => {
        if (data?.user?.role === "admin" || data?.user?.role === "organizer") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 800);
    } catch (err) {
      setError(err.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay" />
      
      <div className="auth-editorial-shell">
        {/* Left Column: Editorial Showcase & Circuit Intel */}
        <aside className="auth-editorial-side">
          <div className="auth-editorial-badge">
            <span className="auth-pulse-dot" /> OBSIDIAN CIRCUIT ACCESS
          </div>
          
          <h2 className="auth-editorial-title">
            Step Onto the Championship Battleground
          </h2>
          
          <p className="auth-editorial-desc">
            Access verified tournament fixtures, manage squad rosters, view real-time bracket telemetry, and compete for certified prize pools.
          </p>

          <div className="auth-telemetry-cluster">
            <div className="auth-telemetry-tile">
              <span className="auth-telemetry-val">100%</span>
              <span className="auth-telemetry-lbl">Anti-Cheat Verified</span>
            </div>
            <div className="auth-telemetry-tile">
              <span className="auth-telemetry-val">Live</span>
              <span className="auth-telemetry-lbl">Bracket Telemetry</span>
            </div>
            <div className="auth-telemetry-tile">
              <span className="auth-telemetry-val">Realtime</span>
              <span className="auth-telemetry-lbl">Instant Match Scoring</span>
            </div>
          </div>

          <div className="auth-quote-card">
            <p className="auth-quote-text">
              &ldquo;The definitive standard for competitive esports brackets and verified roster deployment.&rdquo;
            </p>
            <span className="auth-quote-author">— Circuit Operations Council</span>
          </div>
        </aside>

        {/* Right Column: Cyber Login Card */}
        <main className="auth-card-side">
          <div className="login-card">
            <div className="auth-card-header">
              <span className="auth-card-icon">⚡</span>
              <h1 className="login-title">Sign In to Circuit</h1>
              <p className="login-subtitle">Enter your esports credentials to access your dashboard.</p>
            </div>

            {error && <div className="login-error">⚠️ {error}</div>}
            {success && <div className="login-success">✅ {success}</div>}

            <form onSubmit={handleLogin} noValidate>
              <div className="login-field">
                <label htmlFor="emailOrUsername" className="login-label">Email or Gamer Tag</label>
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  className="login-input"
                  placeholder="you@domain.com or ProGamer"
                  value={form.emailOrUsername}
                  onChange={onChange}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="password" className="login-label">Security Key / Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="login-input"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={onChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" className="login-button btn btn-primary btn-full" disabled={loading} aria-busy={loading}>
                {loading ? "Authenticating..." : "⚡ Enter Arena"}
              </button>
            </form>

            <div className="login-link-row">
              Don&apos;t have an enlisted athlete profile?
              <Link to="/signup" className="login-link">Create Account →</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
