import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import "../../styles/theme.css";
import "../../styles/register.css";

const initialStates = {
  player: { playerName: "", playerEmail: "", playerPassword: "", playerGame: "" },
  team: { name: "", game: "", tournamentId: "", description: "" },
  tournament: { name: "", game: "", type: "", startDate: "", endDate: "", maxTeams: "", description: "" },
  register: { teamId: "", tournamentId: "" }
};

const TABS = [
  { id: "player",     label: "👤 Player",     icon: "👤", desc: "Register as a new player" },
  { id: "create",     label: "🛡️ Team",        icon: "🛡️", desc: "Create a new team" },
  { id: "tournament", label: "🏆 Tournament",  icon: "🏆", desc: "Create a tournament" },
  { id: "register",   label: "⚡ Register",    icon: "⚡", desc: "Register team to tournament" },
];

const GAMES = ["BGMI", "Free Fire", "Valorant", "Counter-Strike 2", "COD: Mobile", "Other"];

const RegisterTeam = () => {
  const [activeTab, setActiveTab] = useState("player");
  const [forms, setForms] = useState(initialStates);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const updateForm = (type, e) => {
    setForms({ ...forms, [type]: { ...forms[type], [e.target.name]: e.target.value } });
  };

  const resetStatus = () => setStatus({ loading: false, error: "", success: "" });

  const authCheck = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus({ loading: false, error: "You must be logged in.", success: "" });
      return false;
    }
    return true;
  };

  const apiRequest = async (url, body) => {
    resetStatus();
    try {
      setStatus(s => ({ ...s, loading: true }));
      const response = await api.post(url, body);
      setStatus(s => ({ ...s, loading: false }));
      return response;
    } catch (err) {
      let errorMessage = "Network error occurred";
      if (err.name === "TypeError") errorMessage = "Network error: Failed to connect to server";
      else if (err.name === "AbortError") errorMessage = "Request was cancelled or timed out";
      else if (err.message) errorMessage = err.message;
      setStatus({ loading: false, error: errorMessage, success: "" });
      return { success: false, message: errorMessage };
    }
  };

  const submitPlayer = async e => {
    e.preventDefault();
    const f = forms.player;
    if (!f.playerName || !f.playerEmail || !f.playerPassword) {
      setStatus({ loading: false, error: "Fill all required fields.", success: "" });
      return;
    }
    if (f.playerName.length < 3) {
      setStatus({ loading: false, error: "Username must be at least 3 characters", success: "" });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(f.playerEmail)) {
      setStatus({ loading: false, error: "Enter a valid email address", success: "" });
      return;
    }
    if (f.playerPassword.length < 6) {
      setStatus({ loading: false, error: "Password must be at least 6 characters", success: "" });
      return;
    }
    const result = await apiRequest("/auth/register", {
      username: f.playerName.trim(),
      email: f.playerEmail.toLowerCase(),
      password: f.playerPassword,
      role: "player"
    });
    if (result && result.success !== false) {
      setForms({ ...forms, player: initialStates.player });
      setStatus({ loading: false, error: "", success: "Player registered successfully! You can now login." });
    }
  };

  const validateGame = (game) => ["PUBG", "BGMI", "Free Fire", "COD", "Valorant", "Other"].includes(game);

  const submitTeam = async e => {
    e.preventDefault();
    if (!authCheck()) return;
    const f = forms.team;
    if (!f.name || !f.game || !f.tournamentId) {
      setStatus({ loading: false, error: "Team name, game & tournament ID are required.", success: "" });
      return;
    }
    if (f.name.length < 3) {
      setStatus({ loading: false, error: "Team name must be at least 3 characters", success: "" });
      return;
    }
    if (!validateGame(f.game)) {
      setStatus({ loading: false, error: "Invalid game selection.", success: "" });
      return;
    }
    const result = await apiRequest("/teams", {
      teamName: f.name.trim(),
      game: f.game.trim(),
      tournamentId: f.tournamentId.trim()
    });
    if (result && result.success !== false) {
      setForms({ ...forms, team: initialStates.team });
      setStatus({ loading: false, error: "", success: "Team created successfully!" });
    }
  };

  const submitTournament = async e => {
    e.preventDefault();
    if (!authCheck()) return;
    const f = forms.tournament;
    if (!f.name || !f.game || !f.type || !f.startDate || !f.endDate || !f.maxTeams) {
      setStatus({ loading: false, error: "Fill all required fields.", success: "" });
      return;
    }
    const result = await apiRequest("/tournaments", { ...f, maxTeams: Number(f.maxTeams) });
    if (result && result.success !== false) {
      setForms({ ...forms, tournament: initialStates.tournament });
      setStatus({ loading: false, error: "", success: "Tournament created successfully!" });
    }
  };

  const submitRegister = async e => {
    e.preventDefault();
    if (!authCheck()) return;
    const f = forms.register;
    if (!f.teamId || !f.tournamentId) {
      setStatus({ loading: false, error: "Both Team ID and Tournament ID are required.", success: "" });
      return;
    }
    const result = await apiRequest("/registrations/team", f);
    if (result && result.success !== false) {
      setForms({ ...forms, register: initialStates.register });
      setStatus({ loading: false, error: "", success: "Team successfully registered to the tournament!" });
    }
  };

  return (
    <div className="registration-hub">
      {/* NAV TABS */}
      <nav className="hub-navbar">
        <div>
          <Link to="/">⚡ E-Sports Arena</Link>
          <div>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); resetStatus(); }}
                className={activeTab === tab.id ? "active" : ""}
              >
                {tab.icon} {tab.label.split(" ").slice(1).join(" ")}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="registration-content">

        {/* PAGE TITLE */}
        <div style={{ textAlign: "center", marginBottom: "clamp(1.5rem, 4vw, 2.5rem)" }}>
          <p style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(0.7rem, 1.8vw, 0.825rem)",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--neon-cyan)",
            marginBottom: "0.5rem",
          }}>
            Registration Hub
          </p>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 900,
            color: "var(--text-primary)",
            lineHeight: 1.1,
          }}>
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>
        </div>

        {/* STATUS MESSAGES */}
        {status.error && (
          <p className="error-message">❌ {status.error}</p>
        )}
        {status.success && (
          <p className="success-message">✅ {status.success}</p>
        )}

        {/* ---- PLAYER FORM ---- */}
        {activeTab === "player" && (
          <form onSubmit={submitPlayer}>
            <h2>Create Player Account</h2>
            <div className="form-group">
              <label htmlFor="rt-pname">Username *</label>
              <input id="rt-pname" name="playerName" placeholder="Your in-game name" value={forms.player.playerName} onChange={e => updateForm("player", e)} />
            </div>
            <div className="form-group">
              <label htmlFor="rt-pemail">Email *</label>
              <input id="rt-pemail" name="playerEmail" type="email" placeholder="player@example.com" value={forms.player.playerEmail} onChange={e => updateForm("player", e)} />
            </div>
            <div className="form-group">
              <label htmlFor="rt-ppwd">Password *</label>
              <input id="rt-ppwd" name="playerPassword" type="password" placeholder="Min. 6 characters" value={forms.player.playerPassword} onChange={e => updateForm("player", e)} />
            </div>
            <div className="form-group">
              <label htmlFor="rt-pgame">Main Game</label>
              <select id="rt-pgame" name="playerGame" value={forms.player.playerGame} onChange={e => updateForm("player", e)} disabled={status.loading}>
                <option value="">Select Game</option>
                {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <button type="submit" disabled={status.loading}>
              {status.loading ? "Registering…" : "👤 Register Player"}
            </button>
            <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "1rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--neon-cyan)", textDecoration: "none" }}>Sign in</Link>
            </p>
          </form>
        )}

        {/* ---- CREATE TEAM FORM ---- */}
        {activeTab === "create" && (
          <form onSubmit={submitTeam}>
            <h2>Create a Team</h2>
            <div className="form-group">
              <label htmlFor="rt-tname">Team Name *</label>
              <input id="rt-tname" name="name" placeholder="e.g. Shadow Strikers" value={forms.team.name} onChange={e => updateForm("team", e)} />
            </div>
            <div className="form-group">
              <label htmlFor="rt-tgame">Game *</label>
              <select id="rt-tgame" name="game" value={forms.team.game} onChange={e => updateForm("team", e)} disabled={status.loading}>
                <option value="">Select Game</option>
                {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="rt-ttid">Tournament ID *</label>
              <input id="rt-ttid" name="tournamentId" placeholder="Paste tournament ID here" value={forms.team.tournamentId} onChange={e => updateForm("team", e)} />
            </div>
            <button type="submit" disabled={status.loading}>
              {status.loading ? "Creating…" : "🛡️ Create Team"}
            </button>
          </form>
        )}

        {/* ---- CREATE TOURNAMENT FORM ---- */}
        {activeTab === "tournament" && (
          <form onSubmit={submitTournament}>
            <h2>Create Tournament</h2>
            <div className="form-group">
              <label htmlFor="rt-trname">Tournament Name *</label>
              <input id="rt-trname" name="name" placeholder="e.g. Cyber Arena Open" value={forms.tournament.name} onChange={e => updateForm("tournament", e)} />
            </div>
            <div className="form-group">
              <label htmlFor="rt-trgame">Game *</label>
              <input id="rt-trgame" name="game" placeholder="e.g. Valorant" value={forms.tournament.game} onChange={e => updateForm("tournament", e)} />
            </div>
            <div className="form-group">
              <label htmlFor="rt-trtype">Format *</label>
              <input id="rt-trtype" name="type" placeholder="e.g. single_elimination" value={forms.tournament.type} onChange={e => updateForm("tournament", e)} />
            </div>
            <div className="form-group">
              <label htmlFor="rt-trmx">Max Teams *</label>
              <input id="rt-trmx" name="maxTeams" type="number" placeholder="e.g. 16" value={forms.tournament.maxTeams} onChange={e => updateForm("tournament", e)} />
            </div>
            <div className="form-group">
              <label htmlFor="rt-trsd">Start Date *</label>
              <input id="rt-trsd" name="startDate" type="date" value={forms.tournament.startDate} onChange={e => updateForm("tournament", e)} />
            </div>
            <div className="form-group">
              <label htmlFor="rt-tred">End Date *</label>
              <input id="rt-tred" name="endDate" type="date" value={forms.tournament.endDate} onChange={e => updateForm("tournament", e)} />
            </div>
            <button type="submit" disabled={status.loading}>
              {status.loading ? "Creating…" : "🏆 Create Tournament"}
            </button>
          </form>
        )}

        {/* ---- REGISTER TEAM FORM ---- */}
        {activeTab === "register" && (
          <form onSubmit={submitRegister}>
            <h2>Register Team to Tournament</h2>
            <div className="form-group">
              <label htmlFor="rt-rid-team">Team ID *</label>
              <input id="rt-rid-team" name="teamId" placeholder="Paste team ID here" value={forms.register.teamId} onChange={e => updateForm("register", e)} />
            </div>
            <div className="form-group">
              <label htmlFor="rt-rid-tour">Tournament ID *</label>
              <input id="rt-rid-tour" name="tournamentId" placeholder="Paste tournament ID here" value={forms.register.tournamentId} onChange={e => updateForm("register", e)} />
            </div>
            <button type="submit" disabled={status.loading}>
              {status.loading ? "Registering…" : "⚡ Register Team"}
            </button>
            <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "1rem" }}>
              You can find IDs on the{" "}
              <Link to="/tournaments" style={{ color: "var(--neon-cyan)", textDecoration: "none" }}>Tournaments</Link>{" "}
              and{" "}
              <Link to="/teams" style={{ color: "var(--neon-cyan)", textDecoration: "none" }}>Teams</Link>{" "}
              pages.
            </p>
          </form>
        )}

      </div>
    </div>
  );
};

export default RegisterTeam;
