import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTournamentById } from "../../api/apiRoutes";
import Breadcrumbs from "../../components/Breadcrumbs";
import StatCard from "../../components/StatCard";
import { formatINR, formatDateTimeIST } from "../../utils/formatters";
import "../../styles/theme.css";
import "../../styles/tournamentDetails.css";

const TournamentDetails = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("squads"); // "squads" | "rules" | "schedule"

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const response = await getTournamentById(id);
        const data = response?.success && response.data !== undefined ? response.data : response;
        setTournament(data);
      } catch (err) {
        setError(err.message || "Failed to fetch tournament dossier");
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <div className="tournament-details-page">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div className="admin-spinner" style={{ margin: "0 auto 1.5rem" }}></div>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Loading Battleground Intel...</h3>
          <p style={{ color: "var(--text-secondary)" }}>Synchronizing tournament bracket, squads, and rules.</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="tournament-details-page">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>Tournament Dossier Not Found</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "500px", margin: "0 auto 2rem" }}>
            {error || `Tournament reference [${id}] does not exist in the active arena database.`}
          </p>
          <Link to="/tournaments" className="btn btn-primary">
            ← Return to Tournament Arena
          </Link>
        </div>
      </div>
    );
  }

  const registeredCount = tournament.teams?.length || tournament.registeredTeams || 0;
  const maxSlots = tournament.maxTeams || 16;
  const slotPercent = Math.min(Math.round((registeredCount / maxSlots) * 100), 100);
  const isRegistrationOpen = tournament.status === "open" || tournament.status === "upcoming" || !tournament.status;

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Tournaments", path: "/tournaments" },
    { label: tournament.name || "Dossier" },
  ];

  return (
    <div className="tournament-details-page">
      <div className="container">
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Arena Header Banner */}
        <section className="td-hero-banner-cyber">
          <div className="td-banner-glow-orb" />
          
          <div className="td-banner-top-meta">
            <div className="td-badge-cluster">
              <span className="td-game-badge">🎮 {tournament.game || "Competitive Esports"}</span>
              <span className="td-format-badge">{tournament.format?.replace(/_/g, " ").toUpperCase() || "SINGLE ELIMINATION"}</span>
              <span className={`td-status-pill ${tournament.status || "upcoming"}`}>
                <span className="td-status-indicator" />
                {tournament.status ? tournament.status.replace(/_/g, " ").toUpperCase() : "UPCOMING"}
              </span>
            </div>

            <span className="td-circuit-id">ID: {tournament._id?.slice(-8)}</span>
          </div>

          <div className="td-banner-hero-body">
            <div className="td-title-block">
              <h1 className="td-hero-title">{tournament.name}</h1>
              <p className="td-hero-desc">
                {tournament.description || "Official competitive esports tournament. Compete against verified squads for glory, points, and cash prizes."}
              </p>
            </div>

            <div className="td-hero-ctas">
              {isRegistrationOpen && (
                <Link to={`/tournaments/${tournament._id}/register`} className="btn btn-primary btn-lg">
                  ⚡ Register Squad
                </Link>
              )}
              <Link to={`/bracket?tournament=${tournament._id}`} className="btn btn-secondary btn-lg">
                🏆 View Bracket
              </Link>
              <Link to={`/leaderboard?tournament=${tournament._id}`} className="btn btn-outline btn-lg">
                📊 Standings
              </Link>
            </div>
          </div>
        </section>

        {/* Telemetry 4-Pack Grid */}
        <section className="td-telemetry-grid">
          <StatCard
            kicker="Prize Bounty"
            value={formatINR(tournament.prizePool, { fallback: "Trophy / Glory" })}
            icon="💎"
            subtitle="Verified Tournament Pool"
          />

          <StatCard
            kicker="Team Slots"
            value={`${registeredCount} / ${maxSlots}`}
            icon="👥"
            progress={slotPercent}
            subtitle={`${slotPercent}% Roster Capacity`}
          />

          <StatCard
            kicker="Entry Fee"
            value={tournament.entryFee ? formatINR(tournament.entryFee) : "Free Entry"}
            icon="⚡"
            subtitle="Official Entry Protocol"
          />

          <StatCard
            kicker="Elimination Mode"
            value={tournament.format?.replace(/_/g, " ") || "Single Elim"}
            icon="⚔️"
            subtitle="Tournament Bracket Rules"
          />
        </section>

        {/* Main Content Layout (Asymmetric 2fr / 1fr) */}
        <div className="td-layout-columns">
          {/* Main Dossier Column */}
          <main className="td-main-content">
            {/* Interactive Tab Switcher */}
            <div className="td-tab-navigation">
              <button
                type="button"
                onClick={() => setActiveTab("squads")}
                className={`td-tab-btn ${activeTab === "squads" ? "active" : ""}`}
              >
                👥 Registered Squads ({registeredCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rules")}
                className={`td-tab-btn ${activeTab === "rules" ? "active" : ""}`}
              >
                📜 Rules & Fair Play
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("schedule")}
                className={`td-tab-btn ${activeTab === "schedule" ? "active" : ""}`}
              >
                📅 Schedule Breakdown
              </button>
            </div>

            {/* TAB 1: Registered Squads */}
            {activeTab === "squads" && (
              <section className="td-tab-pane">
                <div className="td-card-cyber">
                  <div className="td-card-header">
                    <div>
                      <h3 className="td-card-heading">Verified Competitor Squads</h3>
                      <p className="td-card-subheading">Teams confirmed in the championship bracket.</p>
                    </div>

                    {isRegistrationOpen && (
                      <Link to={`/tournaments/${tournament._id}/register`} className="btn btn-primary btn-sm">
                        + Deploy Squad
                      </Link>
                    )}
                  </div>

                  {tournament.teams && tournament.teams.length > 0 ? (
                    <div className="td-squads-roster-grid">
                      {tournament.teams.map((team, idx) => {
                        const teamName = team.teamName || team.name || "Squad Entry";
                        const initial = teamName.charAt(0).toUpperCase();
                        return (
                          <div key={team._id || idx} className="td-squad-entry-card">
                            <div className="td-squad-seed">#{idx + 1}</div>
                            
                            <div className="td-squad-avatar">
                              {team.logo ? (
                                <img src={team.logo} alt={teamName} />
                              ) : (
                                initial
                              )}
                            </div>

                            <div className="td-squad-info">
                              <h4 className="td-squad-name">{teamName}</h4>
                              <span className="td-squad-game">🎮 {team.game || tournament.game}</span>
                            </div>

                            {team._id ? (
                              <Link to={`/teams/${team._id}`} className="btn btn-outline btn-xs">
                                Roster →
                              </Link>
                            ) : (
                              <span className="td-squad-confirmed-pill">Confirmed</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="td-empty-squads">
                      <div className="td-empty-icon">🛡️</div>
                      <h4>No Squads Deployed Yet</h4>
                      <p>Be the first squad to claim a seed in this championship battleground.</p>
                      {isRegistrationOpen && (
                        <Link to={`/tournaments/${tournament._id}/register`} className="btn btn-primary btn-sm" style={{ marginTop: "1rem" }}>
                          ⚡ Register Your Squad
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* TAB 2: Rules & Protocol */}
            {activeTab === "rules" && (
              <section className="td-tab-pane">
                <div className="td-card-cyber">
                  <h3 className="td-card-heading">📜 Official Circuit Guidelines</h3>
                  
                  {tournament.rules ? (
                    <div className="td-rules-content">
                      {tournament.rules}
                    </div>
                  ) : (
                    <div className="td-rules-content">
                      <p><strong>Standard Obsidian Cyber Arena Protocol:</strong></p>
                      <ul>
                        <li>All participating athletes must be registered on the roster 24 hours prior to fixture commencement.</li>
                        <li>Third-party modifications, scripts, or unfair advantages will trigger immediate squad disqualification.</li>
                        <li>Check-in is required in the match hub 15 minutes before the scheduled start time.</li>
                        <li>All match disputes must be filed within 10 minutes of fixture conclusion with screenshot evidence.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* TAB 3: Schedule Breakdown */}
            {activeTab === "schedule" && (
              <section className="td-tab-pane">
                <div className="td-card-cyber">
                  <h3 className="td-card-heading">📅 Schedule & Key Deadlines</h3>
                  
                  <div className="td-timeline-list">
                    <div className="td-timeline-item">
                      <div className="td-timeline-dot active" />
                      <div className="td-timeline-content">
                        <span className="td-timeline-title">Tournament Start Date</span>
                        <span className="td-timeline-date">
                          {tournament.startDate ? formatDateTimeIST(tournament.startDate) : "To Be Announced"}
                        </span>
                      </div>
                    </div>

                    <div className="td-timeline-item">
                      <div className="td-timeline-dot" />
                      <div className="td-timeline-content">
                        <span className="td-timeline-title">Championship Finals & Conclusion</span>
                        <span className="td-timeline-date">
                          {tournament.endDate ? formatDateTimeIST(tournament.endDate) : "To Be Announced"}
                        </span>
                      </div>
                    </div>

                    {tournament.registrationDeadline && (
                      <div className="td-timeline-item">
                        <div className="td-timeline-dot deadline" />
                        <div className="td-timeline-content">
                          <span className="td-timeline-title">Registration Cutoff Deadline</span>
                          <span className="td-timeline-date">
                            {formatDateTimeIST(tournament.registrationDeadline)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </main>

          {/* Tactical Intelligence Sidebar */}
          <aside className="td-sidebar">
            {/* Quick Registration Widget */}
            <div className="td-card-cyber td-widget-card">
              <span className="td-widget-kicker">Deployment Status</span>
              <h4 className="td-widget-title">
                {isRegistrationOpen ? "Squad Entries Open" : "Registration Closed"}
              </h4>
              <p className="td-widget-desc">
                {isRegistrationOpen
                  ? `${maxSlots - registeredCount} slot${maxSlots - registeredCount === 1 ? "" : "s"} remaining before bracket locks.`
                  : "Brackets are finalized. Follow live fixtures and match progress."}
              </p>

              {isRegistrationOpen ? (
                <Link to={`/tournaments/${tournament._id}/register`} className="btn btn-primary btn-full" style={{ marginBottom: "0.75rem" }}>
                  ⚡ Deploy Team Now
                </Link>
              ) : (
                <button disabled className="btn btn-disabled btn-full" style={{ marginBottom: "0.75rem" }}>
                  Bracket Locked
                </button>
              )}

              <Link to={`/bracket?tournament=${tournament._id}`} className="btn btn-outline btn-full">
                🏆 View Tournament Bracket
              </Link>
            </div>

            {/* Tactical Intel Specs Card */}
            <div className="td-card-cyber td-specs-card">
              <h4 className="td-specs-heading">Battleground Specifications</h4>
              
              <div className="td-spec-row">
                <span className="td-spec-label">Game Title</span>
                <span className="td-spec-val">{tournament.game}</span>
              </div>
              <div className="td-spec-row">
                <span className="td-spec-label">Format</span>
                <span className="td-spec-val" style={{ textTransform: "capitalize" }}>
                  {tournament.format?.replace(/_/g, " ") || "Single Elimination"}
                </span>
              </div>
              <div className="td-spec-row">
                <span className="td-spec-label">Mode</span>
                <span className="td-spec-val" style={{ textTransform: "uppercase" }}>
                  {tournament.type || "Team"}
                </span>
              </div>
              <div className="td-spec-row">
                <span className="td-spec-label">Prize Pool</span>
                <span className="td-spec-val gold">{formatINR(tournament.prizePool, { fallback: "Glory / Trophy" })}</span>
              </div>
              <div className="td-spec-row">
                <span className="td-spec-label">Entry Protocol</span>
                <span className="td-spec-val highlight">{tournament.entryFee ? formatINR(tournament.entryFee) : "Free Entry"}</span>
              </div>
            </div>

            {/* Fair Play Shield */}
            <div className="td-shield-card">
              <span className="td-shield-icon">🛡️</span>
              <div className="td-shield-text">
                <strong>Anti-Cheat Active</strong>
                <p>Every match is monitored by automated referee telemetry and verified server logs.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;
