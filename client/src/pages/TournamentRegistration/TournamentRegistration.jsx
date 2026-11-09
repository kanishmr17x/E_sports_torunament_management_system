import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    getTournamentById,
    getMyTeams,
    registerTeam,
    initiatePayment
} from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
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
        loadData();
    }, [id]);

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
            setTournament(tourneyRes);
            setTeams(teamsRes.filter(t => t.tournament?._id === id || t.tournament === id));
        } catch (err) {
            setError(err.message || "Failed to load tournament");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!selectedTeamId) {
            setError("Please select a team");
            return;
        }

        setError("");
        setSuccess("");
        setProcessing(true);

        try {
            // If tournament has entry fee, redirect to payment
            if (tournament.entryFee > 0) {
                const paymentRes = await initiatePayment({
                    teamId: selectedTeamId,
                    tournamentId: id,
                    amount: tournament.entryFee,
                    paymentMethod: "test"
                });
                navigate(`/payment/${paymentRes.paymentId}`);
            } else {
                await registerTeam({ teamId: selectedTeamId, tournamentId: id });
                setSuccess("Team registered successfully! No payment required.");
                setTimeout(() => navigate("/dashboard"), 2000);
            }
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setProcessing(false);
        }
    };

    const canRegister = () => {
        if (!tournament || teams.length === 0) return false;
        if (tournament.status !== "registration_open") return false;
        const now = new Date();
        if (tournament.registrationStart && new Date(tournament.registrationStart) > now) return false;
        if (tournament.registrationDeadline && new Date(tournament.registrationDeadline) < now) return false;
        if (tournament.registeredTeams >= tournament.maxTeams) return false;
        return true;
    };

    if (loading) {
        return (
            <div className="registration-page loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Loading tournament details...</p>
                </div>
            </div>
        );
    }

    if (error && !tournament) {
        return (
            <div className="registration-page error">
                <div className="error-card">
                    <h2>⚠️ Tournament Not Found</h2>
                    <p>{error}</p>
                    <Link to="/tournaments" className="btn btn-primary">Browse Tournaments</Link>
                </div>
            </div>
        );
    }

    const registrationClosed = tournament.status !== "registration_open";
    const registrationNotStarted = tournament.registrationStart && new Date(tournament.registrationStart) > new Date();
    const registrationEnded = tournament.registrationDeadline && new Date(tournament.registrationDeadline) < new Date();
    const tournamentFull = tournament.registeredTeams >= tournament.maxTeams;

    return (
        <div className="registration-page">
            <header className="registration-header">
                <div className="header-content">
                    <div className="tournament-header-info">
                        <span className="tournament-game">{tournament?.game}</span>
                        <h1>{tournament?.name}</h1>
                        <p className="tournament-subtitle">{tournament?.description}</p>
                        <div className="tournament-meta">
                            <span className={`status-badge ${tournament?.status}`}>
                                {tournament?.status?.replace("_", " ")}
                            </span>
                            <span>📅 {tournament?.startDate ? new Date(tournament.startDate).toLocaleDateString() : "TBD"}</span>
                            <span>👥 {tournament?.registeredTeams || 0}/{tournament?.maxTeams} teams</span>
                            {tournament.entryFee > 0 && (
                                <span className="entry-fee">💰 Entry Fee: ${tournament.entryFee}</span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="registration-main">
                <div className="registration-container">
                    <div className="registration-details">
                        <section className="detail-card">
                            <h2>📋 Tournament Details</h2>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Format</label>
                                    <span>{tournament?.format?.replace("_", " ")}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Type</label>
                                    <span>{tournament?.type}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Registration Period</label>
                                    <span>
                                        {tournament?.registrationStart ? new Date(tournament.registrationStart).toLocaleDateString() : "Now"} - 
                                        {tournament?.registrationDeadline ? new Date(tournament.registrationDeadline).toLocaleDateString() : "Tournament Start"}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Prize Pool</label>
                                    <span>${tournament?.prizePool || 0}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Entry Fee</label>
                                    <span>{tournament?.entryFee > 0 ? `$${tournament.entryFee}` : "Free"}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Max Teams</label>
                                    <span>{tournament?.maxTeams}</span>
                                </div>
                            </div>
                            {tournament?.rules && (
                                <div className="rules-section">
                                    <h3>📜 Rules</h3>
                                    <p>{tournament.rules}</p>
                                </div>
                            )}
                        </section>

                        <section className="detail-card">
                            <h2>👥 Your Eligible Teams</h2>
                            {teams.length === 0 ? (
                                <div className="no-teams">
                                    <p>You don't have any teams eligible for this tournament.</p>
                                    <Link to="/dashboard/teams" className="btn btn-primary">
                                        Create a Team First
                                    </Link>
                                </div>
                            ) : (
                                <div className="teams-selection">
                                    {teams.map(team => (
                                        <label key={team._id} className={`team-option ${selectedTeamId === team._id ? "selected" : ""}`}>
                                            <input
                                                type="radio"
                                                name="team"
                                                value={team._id}
                                                checked={selectedTeamId === team._id}
                                                onChange={(e) => setSelectedTeamId(e.target.value)}
                                                disabled={!canRegister()}
                                            />
                                            <div className="team-option-info">
                                                <h4>{team.teamName}</h4>
                                                <div className="team-option-meta">
                                                    <span>Game: {team.game}</span>
                                                    <span>Members: {team.totalMembers || 0}</span>
                                                    <span>Status: <span className={`status-badge ${team.status}`}>{team.status}</span></span>
                                                </div>
                                            </div>
                                            <span className="radio-custom"></span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="registration-sidebar">
                        <div className="registration-card">
                            <h2>Register Team</h2>
                            
                            {error && <div className="alert alert-error">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <div className="registration-summary">
                                <div className="summary-row">
                                    <span>Tournament</span>
                                    <span>{tournament?.name}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Entry Fee</span>
                                    <span className="fee">{tournament?.entryFee > 0 ? `$${tournament.entryFee}` : "Free"}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span className="fee">{tournament?.entryFee > 0 ? `$${tournament.entryFee}` : "Free"}</span>
                                </div>
                            </div>

                            <div className="registration-status">
                                {registrationNotStarted && (
                                    <div className="status-warning">
                                        ⏳ Registration opens on {new Date(tournament.registrationStart).toLocaleDateString()}
                                    </div>
                                )}
                                {registrationEnded && (
                                    <div className="status-error">
                                        ❌ Registration closed on {new Date(tournament.registrationDeadline).toLocaleDateString()}
                                    </div>
                                )}
                                {tournamentFull && (
                                    <div className="status-error">
                                        ❌ Tournament is full ({tournament.maxTeams} teams)
                                    </div>
                                )}
                                {registrationClosed && !registrationNotStarted && !registrationEnded && !tournamentFull && (
                                    <div className="status-error">
                                        ❌ Registration is not open (Status: {tournament.status?.replace("_", " ")})
                                    </div>
                                )}
                                {canRegister() && (
                                    <div className="status-success">
                                        ✅ Ready to register
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={!canRegister() || !selectedTeamId || processing}
                                className="btn btn-primary btn-block register-btn"
                            >
                                {processing ? "Processing..." : tournament.entryFee > 0 ? "Register & Pay" : "Register for Free"}
                            </button>

                            <p className="registration-note">
                                By registering, you agree to the tournament rules and terms.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default TournamentRegistration;