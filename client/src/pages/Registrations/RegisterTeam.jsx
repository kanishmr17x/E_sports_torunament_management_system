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

  const apiRequest = async (url, body, auth = true) => {
    resetStatus();
    try {
      setStatus(s => ({ ...s, loading: true }));
      
      const response = await api.post(url, body);
      
      setStatus(s => ({ ...s, loading: false }));
      
      // Handle new response format with success/data structure
      if (response.data) {
        return response.data;
      }
      return response;
    } catch (err) {
      // Handle different types of errors
      let errorMessage = "Network error occurred";
      if (err.name === 'TypeError') {
        errorMessage = "Network error: Failed to connect to server";
      } else if (err.name === 'AbortError') {
        errorMessage = "Request was cancelled or timed out";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setStatus({ loading: false, error: errorMessage, success: "" });
      return { success: false, message: errorMessage };
    }
  };

  const submitPlayer = async e => {
    e.preventDefault();
    const f = forms.player;
    
    // Client-side validation
    if (!f.playerName || !f.playerEmail || !f.playerPassword) {
      setStatus({ loading: false, error: "Fill all fields.", success: "" });
      return;
    }
    
    if (f.playerName.length < 3) {
      setStatus({ loading: false, error: "Username must be at least 3 characters", success: "" });
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(f.playerEmail)) {
      setStatus({ loading: false, error: "Enter a valid email", success: "" });
      return;
    }
    
    if (f.playerPassword.length < 6) {
      setStatus({ loading: false, error: "Password must be at least 6 characters", success: "" });
      return;
    }
    
    const result = await api.post("/auth/register", {
      username: f.playerName.trim(),
      email: f.playerEmail.toLowerCase(),
      password: f.playerPassword,
      role: "player"
    });
    
    if (result.success || result.data) {
      setForms({ ...forms, player: initialStates.player });
      setStatus({ loading: false, error: "", success: "Player registered successfully!" });
    }
    // Error is already handled by apiRequest function
  };

  const validateGame = (game) => {
  const validGames = ["PUBG", "BGMI", "Free Fire", "COD", "Valorant", "Other"];
  return validGames.includes(game);
};

const submitTeam = async e => {
    e.preventDefault();
    if (!authCheck()) return;
    const f = forms.team;
    
    // Client-side validation
    if (!f.name || !f.game || !f.tournamentId) {
      setStatus({ loading: false, error: "Team name, game & tournament required.", success: "" });
      return;
    }
    
    if (f.name.length < 3) {
      setStatus({ loading: false, error: "Team name must be at least 3 characters", success: "" });
      return;
    }
    
    // Validate game enum
    if (!validateGame(f.game)) {
      setStatus({ loading: false, error: "Invalid game selection. Please choose from: PUBG, BGMI, Free Fire, COD, Valorant, Other", success: "" });
      return;
    }
    
    const result = await api.post("/api/teams", {
      teamName: f.name.trim(),
      game: f.game.trim(),
      tournamentId: f.tournamentId.trim()
    });
    
    if (result.success || result.data) {
      setForms({ ...forms, team: initialStates.team });
      setStatus({ loading: false, error: "", success: "Team created successfully!" });
    }
    // Error is already handled by apiRequest function
  };

  const submitTournament = async e => {
    e.preventDefault();
    if (!authCheck()) return;
    const f = forms.tournament;
    if (!f.name || !f.game || !f.type || !f.startDate || !f.endDate || !f.maxTeams) {
      setStatus({ loading: false, error: "Fill all required fields.", success: "" });
      return;
    }
    const result = await api.post("/api/tournaments", { ...f, maxTeams: Number(f.maxTeams) });
    if (result.success || result.data) {
      setForms({ ...forms, tournament: initialStates.tournament });
      setStatus({ loading: false, error: "", success: "Tournament created successfully!" });
    }
  };

  const submitRegister = async e => {
    e.preventDefault();
    if (!authCheck()) return;
    const f = forms.register;
    if (!f.teamId || !f.tournamentId) {
      setStatus({ loading: false, error: "Both IDs required.", success: "" });
      return;
    }
    const result = await apiRequest("/api/registrations/team", f, true);
    if (result.success || result.data) {
      setForms({ ...forms, register: initialStates.register });
      setStatus({ loading: false, error: "", success: "Team registered to tournament!" });
    }
  };

  return (
    <div className="registration-hub">
      {/* NAV */}
      <nav className="hub-navbar">
        <Link to="/">E-Sports</Link>
        <div>
          <button onClick={() => setActiveTab("player")}>Player</button>
          <button onClick={() => setActiveTab("create")}>Team</button>
          <button onClick={() => setActiveTab("tournament")}>Tournament</button>
          <button onClick={() => setActiveTab("register")}>Register</button>
        </div>
      </nav>

      {/* CONTENT WRAPPER */}
      <div className="registration-content">
        {/* STATUS */}
        {status.error && <p className="error-message">{status.error}</p>}
        {status.success && <p className="success-message">{status.success}</p>}

        {/* FORMS */}
        {activeTab === "player" && (
          <form onSubmit={submitPlayer}>
            <h2>Player Registration</h2>
            <input name="playerName" placeholder="Name" value={forms.player.playerName} onChange={e => updateForm("player", e)} />
            <input name="playerEmail" placeholder="Email" value={forms.player.playerEmail} onChange={e => updateForm("player", e)} />
            <input name="playerPassword" type="password" placeholder="Password" value={forms.player.playerPassword} onChange={e => updateForm("player", e)} />
            <select name="playerGame" value={forms.player.playerGame} onChange={e => updateForm("player", e)} disabled={status.loading}>
              <option value="">Select Game</option>
              <option value="PUBG">PUBG</option>
              <option value="BGMI">BGMI</option>
              <option value="Free Fire">Free Fire</option>
              <option value="COD">COD</option>
              <option value="Valorant">Valorant</option>
              <option value="Other">Other</option>
            </select>
            <button disabled={status.loading}>Register</button>
          </form>
        )}

        {activeTab === "create" && (
          <form onSubmit={submitTeam}>
            <h2>Create Team</h2>
            <input name="name" placeholder="Team Name" value={forms.team.name} onChange={e => updateForm("team", e)} />
            <select name="game" value={forms.team.game} onChange={e => updateForm("team", e)} disabled={status.loading}>
              <option value="">Select Game</option>
              <option value="PUBG">PUBG</option>
              <option value="BGMI">BGMI</option>
              <option value="Free Fire">Free Fire</option>
              <option value="COD">COD</option>
              <option value="Valorant">Valorant</option>
              <option value="Other">Other</option>
            </select>
            <input name="tournamentId" placeholder="Tournament ID" value={forms.team.tournamentId} onChange={e => updateForm("team", e)} />
            <button disabled={status.loading}>Create Team</button>
          </form>
        )}

        {activeTab === "tournament" && (
          <form onSubmit={submitTournament}>
            <h2>Create Tournament</h2>
            <input name="name" placeholder="Tournament Name" value={forms.tournament.name} onChange={e => updateForm("tournament", e)} />
            <input name="game" placeholder="Game" value={forms.tournament.game} onChange={e => updateForm("tournament", e)} />
            <input name="type" placeholder="Type" value={forms.tournament.type} onChange={e => updateForm("tournament", e)} />
            <input name="maxTeams" type="number" placeholder="Max Teams" value={forms.tournament.maxTeams} onChange={e => updateForm("tournament", e)} />
            <button disabled={status.loading}>Create Tournament</button>
          </form>
        )}

        {activeTab === "register" && (
          <form onSubmit={submitRegister}>
            <h2>Register Team</h2>
            <input name="teamId" placeholder="Team ID" value={forms.register.teamId} onChange={e => updateForm("register", e)} />
            <input name="tournamentId" placeholder="Tournament ID" value={forms.register.tournamentId} onChange={e => updateForm("register", e)} />
            <button disabled={status.loading}>Register Team</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterTeam;
