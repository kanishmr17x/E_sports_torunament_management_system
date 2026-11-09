import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getTournamentById,
  getMyTeams,
  registerTeam,
  initiatePayment
} from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import Breadcrumbs from "../../components/Breadcrumbs";
import StatCard from "../../components/StatCard";
import { formatINR, formatDateIST } from "../../utils/formatters";
import "../../styles/theme.css";
import "../../styles/tournamentRegistration.css";

const TournamentRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const [tourneyRes, teamsRes] = await Promise.all([
          getTournamentById(id),
          getMyTeams()
        ]);
        const tourneyData = tourneyRes?.success && tourneyRes.data !== undefined ? tourneyRes.data : tourneyRes;
        setTournament(tourneyData);
        const userTeams = Array.isArray(teamsRes) ? teamsRes : [];
        setTeams(userTeams);
        if (userTeams.length > 0) {
          setSelectedTeamId(userTeams[0]._id);
        }
      } catch (err) {
        setError(err.message || "Failed to load tournament enlistment gate");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, user, navigate]);

  const handleRegister = async () => {
    if (!selectedTeamId) {
      setError("Please select an active squad from your roster.");
      return;
    }

    setError("");
    setSuccess("");
    setProcessing(true);

    try {
      if (tournament.entryFee > 0) {
        const paymentRes = await initiatePayment({
          teamId: selectedTeamId,
          tournamentId: id,
          amount: tournament.entryFee,
          paymentMethod: "test"
        });
        navigate(`/payment/${paymentRes.paymentId || paymentRes._id}`);
      } else {
        await registerTeam({ teamId: selectedTeamId, tournamentId: id });
        setSuccess("Squad deployed successfully! Your slot in the tournament bracket is confirmed.");
        setTimeout(() => navigate(`/tournaments/${id}`), 2200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Tournaments", path: "/tournaments" },
    { label: tournament?.name || "Tournament", path: `/tournaments/${id}` },
    { label: "Squad Enlistment" },
  ];

  if (loading) {
    return (
      <div className="tourney-reg-page-cyber">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div className="admin-spinner" style={{ margin: "0 auto 1.5rem" }} />
          <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Opening Deployment Gate...</h3>
          <p style={{ color: "var(--text-secondary)" }}>Verifying tournament slots and captain eligibility.</p>
        </div>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="tourney-reg-page-cyber">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>Battleground Not Found</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            {error || `Tournament with ID [${id}] does not exist.`}
          </p>
          <Link to="/tournaments" className="btn btn-primary">
            Browse All Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const registeredCount = tournament?.teams?.length || tournament?.registeredTeams || 0;
  const maxSlots = tournament?.maxTeams || 16;
  const slotPercent = Math.min(Math.round((registeredCount / maxSlots) * 100), 100);

  return (
    <div className="tourney-reg-page-cyber">
      <div className="container">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header Banner */}
        <header className="tourney-reg-banner-cyber">
          <div className="tourney-reg-badge-row">
            <span className="tourney-reg-circuit-tag">⚡ BRACKET ENLISTMENT GATE</span>
            <span className="tourney-reg-game-tag">🎮 {tournament?.game || "BGMI"}</span>
          </div>
          <h1 className="tourney-reg-title">Deploy Squad to {tournament?.name}</h1>
          <p className="tourney-reg-subtitle">
            Authorize your competitive squad roster into the championship bracket seedings.
          </p>
        </header>

        {/* Telemetry Row */}
        <section className="tourney-reg-telemetry">
          <StatCard
            kicker="Prize Bounty"
            value={formatINR(tournament?.prizePool, { fallback: "Glory / Trophy" })}
            icon="💎"
            subtitle="Verified Tournament Pool"
          />
          <StatCard
            kicker="Bracket Capacity"
            value={`${registeredCount} / ${maxSlots}`}
            icon="👥"
            progress={slotPercent}
            subtitle={`${maxSlots - registeredCount} Slots Remaining`}
          />
          <StatCard
            kicker="Entry Protocol"
            value={tournament?.entryFee ? formatINR(tournament.entryFee) : "Free Entry"}
            icon="⚡"
            subtitle={tournament?.entryFee ? "Settlement at Checkout" : "Zero Fee Entry"}
          />
        </section>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
            ✅ {success}
          </div>
        )}

        {/* 2-Column Asymmetric Deployment Grid */}
        <div className="tourney-reg-grid">
          {/* Left Column: Squad Selection & Authorization Form */}
          <section className="tourney-reg-form-card">
            <div className="reg-card-header">
              <span className="reg-card-icon">🛡️</span>
              <div>
                <h3 className="reg-card-heading">Select Deployment Squad</h3>
                <p className="reg-card-sub">Choose a registered squad roster under your captaincy.</p>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="reg-no-squads-box">
                <span style={{ fontSize: "2.5rem" }}>👥</span>
                <h4>No Registered Squads Under Your Account</h4>
                <p>You must enlist a squad roster before deploying into a tournament bracket.</p>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ marginTop: "1rem" }}>
                  + Create Squad Now
                </Link>
              </div>
            ) : (
              <div className="reg-squads-selection-list">
                {teams.map((team) => {
                  const isSelected = selectedTeamId === team._id;
                  const teamName = team.teamName || team.name || "Squad";
                  const members = team.totalMembers || (Array.isArray(team.members) ? team.members.length : 1);
                  return (
                    <label
                      key={team._id}
                      className={`squad-select-card ${isSelected ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="teamSelection"
                        value={team._id}
                        checked={isSelected}
                        onChange={() => setSelectedTeamId(team._id)}
                      />
                      <div className="squad-select-avatar">
                        {teamName.charAt(0).toUpperCase()}
                      </div>
                      <div className="squad-select-info">
                        <h4>{teamName}</h4>
                        <div className="squad-select-meta">
                          <span>🎮 {team.game || tournament?.game}</span>
                          <span>•</span>
                          <span>{members} Athletes</span>
                          <span>•</span>
                          <span style={{ color: "#10B981" }}>{team.status || "Active"}</span>
                        </div>
                      </div>
                      <div className="squad-select-indicator">
                        {isSelected ? "READY" : "SELECT"}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="reg-submit-block">
              <button
                type="button"
                onClick={handleRegister}
                disabled={processing || teams.length === 0}
                className="btn btn-primary btn-full btn-lg"
              >
                {processing
                  ? "Authorizing Roster..."
                  : tournament?.entryFee > 0
                  ? `Proceed to Settlement (${formatINR(tournament.entryFee)}) →`
                  : "⚡ Confirm Squad Deployment"}
              </button>
              <Link to={`/tournaments/${id}`} className="btn btn-outline btn-full btn-sm" style={{ marginTop: "0.5rem" }}>
                Cancel & Return to Tournament Dossier
              </Link>
            </div>
          </section>

          {/* Right Column: Battleground Rules & Anti-Cheat */}
          <aside className="tourney-reg-sidebar">
            <div className="reg-specs-card">
              <h4 className="reg-specs-title">Tournament Credentials</h4>
              <div className="reg-spec-row">
                <span>Tournament ID</span>
                <span className="spec-code">{id?.slice(-8)}</span>
              </div>
              <div className="reg-spec-row">
                <span>Bracket Format</span>
                <span style={{ textTransform: "capitalize" }}>{tournament?.format?.replace(/_/g, " ") || "Single Elim"}</span>
              </div>
              <div className="reg-spec-row">
                <span>Kickoff Date</span>
                <span>{formatDateIST(tournament?.startDate)}</span>
              </div>
              <div className="reg-spec-row">
                <span>Entry Fee</span>
                <span className="spec-cyan">{tournament?.entryFee ? formatINR(tournament.entryFee) : "Free Entry"}</span>
              </div>
            </div>

            <div className="reg-rules-card">
              <h4>📜 Roster Commitment Policy</h4>
              <ul>
                <li>All squad members must be checked into the match server 15 minutes before fixture start.</li>
                <li>Roster substitution locks 2 hours prior to bracket seeding.</li>
                <li>Unsportsmanlike conduct or third-party exploits result in instant disqualification.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TournamentRegistration;
