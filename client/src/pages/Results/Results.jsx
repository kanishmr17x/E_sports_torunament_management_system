import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompletedMatches, getLeaderboard } from "../../api/apiRoutes";
import Breadcrumbs from "../../components/Breadcrumbs";
import MatchCard from "../../components/MatchCard";
import StatCard from "../../components/StatCard";
import "../../styles/theme.css";
import "../../styles/results.css";

const Results = () => {
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTournament, setFilterTournament] = useState("");
  const [viewMode, setViewMode] = useState("matches"); // "matches" | "leaderboard"

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [matchesRes] = await Promise.allSettled([
          getCompletedMatches({ limit: 200 })
        ]);
        setMatches(matchesRes.status === "fulfilled" && Array.isArray(matchesRes.value) ? matchesRes.value : []);
      } catch (err) {
        setError(err.message || "Failed to load archived match results");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadLeaderboardData = async (tournamentId) => {
      try {
        const res = await getLeaderboard(tournamentId);
        setLeaderboard(res);
      } catch (err) {
        console.error("Failed to load standings for tournament:", err);
      }
    };

    if (filterTournament && viewMode === "leaderboard") {
      loadLeaderboardData(filterTournament);
    } else {
      setLeaderboard(null);
    }
  }, [filterTournament, viewMode]);

  const filteredMatches = filterTournament
    ? matches.filter(m => m.tournamentId?._id === filterTournament || m.tournamentId === filterTournament)
    : matches;

  const tournaments = [...new Set(
    matches.map(m => m.tournamentId).filter(Boolean)
  )].map(t => typeof t === "object" ? t : { _id: t, name: "Championship Circuit" }).filter((t, i, arr) => 
    arr.findIndex(x => x._id === t._id) === i
  );

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Completed Fixtures & Results" },
  ];

  if (loading) {
    return (
      <div className="results-page-cyber">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div className="admin-spinner" style={{ margin: "0 auto 1.5rem" }} />
          <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Loading Circuit Records...</h3>
          <p style={{ color: "var(--text-secondary)" }}>Accessing verified fixture outcomes and championship standings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page-cyber">
      <div className="container">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Header */}
        <header className="results-banner-cyber">
          <div className="results-banner-top">
            <span className="results-kicker">🏁 VERIFIED ARCHIVES</span>
            <span className="results-count-pill">{matches.length} Fixtures Logged</span>
          </div>
          <h1 className="results-title">Tournament Match Results</h1>
          <p className="results-subtitle">
            Inspect verified scorecards, crown highlights, completed bracket fixtures, and circuit standings.
          </p>

          {/* Controls Bar */}
          <div className="results-controls-bar">
            <div className="results-filter-box">
              <label htmlFor="tournamentSelect" className="results-filter-lbl">Tournament Filter:</label>
              <select
                id="tournamentSelect"
                value={filterTournament}
                onChange={(e) => setFilterTournament(e.target.value)}
                className="results-select"
              >
                <option value="">All Tournaments ({tournaments.length})</option>
                {tournaments.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name || "Tournament"} ({t.game || "Esports"})
                  </option>
                ))}
              </select>
            </div>

            <div className="results-toggle-group">
              <button
                type="button"
                onClick={() => setViewMode("matches")}
                className={`results-toggle-btn ${viewMode === "matches" ? "active" : ""}`}
              >
                ⚔️ Fixture Scorecards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("leaderboard")}
                className={`results-toggle-btn ${viewMode === "leaderboard" ? "active" : ""}`}
              >
                🏆 Standings & Medals
              </button>
            </div>
          </div>
        </header>

        {/* Telemetry Row */}
        <section className="results-telemetry-row">
          <StatCard
            kicker="Completed Fixtures"
            value={filteredMatches.length}
            icon="⚔️"
            subtitle="Recorded match conclusions"
            accentColor="rgba(0, 212, 255, 0.4)"
          />
          <StatCard
            kicker="Active Circuits"
            value={tournaments.length || 1}
            icon="🏆"
            subtitle="Competitive titles hosted"
            accentColor="rgba(118, 87, 255, 0.4)"
          />
          <StatCard
            kicker="Outcome Protocol"
            value="100%"
            icon="🛡️"
            subtitle="Referee verified results"
            accentColor="rgba(16, 185, 129, 0.4)"
          />
        </section>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Mode 1: Fixtures Grid */}
        {viewMode === "matches" && (
          <section className="results-grid-section">
            <div className="results-section-header">
              <h3 className="results-section-title">Verified Match Scorecards ({filteredMatches.length})</h3>
            </div>

            {filteredMatches.length === 0 ? (
              <div className="results-empty-card">
                <div className="results-empty-icon">⚔️</div>
                <h4>No Completed Fixtures Located</h4>
                <p>No matches matching your current tournament filter have concluded yet.</p>
                <Link to="/matches" className="btn btn-primary btn-sm" style={{ marginTop: "1rem" }}>
                  View Scheduled Matches
                </Link>
              </div>
            ) : (
              <div className="results-cards-grid">
                {filteredMatches.map(m => (
                  <MatchCard key={m._id} match={m} variant="feed" />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Mode 2: Standings Table */}
        {viewMode === "leaderboard" && (
          <section className="results-standings-section">
            {!filterTournament ? (
              <div className="results-empty-card">
                <div className="results-empty-icon">🏆</div>
                <h4>Select a Tournament Above</h4>
                <p>Please select a specific tournament from the dropdown filter to view official podium standings.</p>
              </div>
            ) : !leaderboard || !leaderboard.rankings || leaderboard.rankings.length === 0 ? (
              <div className="results-empty-card">
                <div className="results-empty-icon">📊</div>
                <h4>No Standings Computed Yet</h4>
                <p>Standings will be compiled upon the completion of group or playoff stages.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <div className="admin-table-header-row">
                  <div>
                    <h3 className="admin-table-title">Official Tournament Standings</h3>
                    <p className="admin-table-sub">{leaderboard.tournament?.name || "Tournament Circuit"}</p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Squad Name</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Points</th>
                        <th>Differential</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.rankings.map((rank, idx) => (
                        <tr key={rank._id || idx}>
                          <td>
                            <span className={`rank-medal rank-${idx + 1}`}>
                              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "var(--text-primary)" }}>{rank.team?.name || rank.teamName || "Squad"}</strong>
                          </td>
                          <td style={{ color: "#10B981", fontWeight: 700 }}>{rank.wins || 0}</td>
                          <td style={{ color: "#FF6B6B", fontWeight: 700 }}>{rank.losses || 0}</td>
                          <td style={{ fontWeight: 900, color: "var(--accent-secondary)" }}>{rank.points || 0} PTS</td>
                          <td>{rank.scoreDifference || rank.diff || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Results;
