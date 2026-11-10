import { useEffect, useState } from "react";
import { getUpcomingMatches, getCompletedMatches } from "../../api/apiRoutes";
import MatchCard from "../../components/MatchCard";
import Breadcrumbs from "../../components/Breadcrumbs";
import "../../styles/theme.css";
import "../../styles/matches.css";

const Matches = () => {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [completedMatches, setCompletedMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterTournament, setFilterTournament] = useState("");

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            setLoading(true);
            const [upcomingRes, completedRes] = await Promise.all([
                getUpcomingMatches(),
                getCompletedMatches({ limit: 100 })
            ]);
            setUpcomingMatches(upcomingRes);
            setCompletedMatches(completedRes);
        } catch (err) {
            setError(err.message || "Failed to load matches");
        } finally {
            setLoading(false);
        }
    };

    const filteredUpcoming = filterTournament
        ? upcomingMatches.filter(m => m.tournamentId?._id === filterTournament || m.tournamentId === filterTournament)
        : upcomingMatches;

    const filteredCompleted = filterTournament
        ? completedMatches.filter(m => m.tournamentId?._id === filterTournament || m.tournamentId === filterTournament)
        : completedMatches;

    const tournaments = [...new Set([
        ...upcomingMatches.map(m => m.tournamentId).filter(Boolean),
        ...completedMatches.map(m => m.tournamentId).filter(Boolean)
    ])].map(t => typeof t === "object" ? t : { _id: t }).filter((t, i, arr) => 
        arr.findIndex(x => x._id === t._id) === i
    );

    if (loading) {
        return (
            <div className="matches-page loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Loading matches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="matches-page">
            <div className="container" style={{ paddingTop: "1rem" }}><Breadcrumbs items={[{ label: "Matches & Fixtures" }]} /></div>
            <header className="matches-header">
                <div className="header-content">
                    <div>
                        <h1>📅 Match Schedule</h1>
                        <p className="subtitle">View upcoming and completed matches</p>
                    </div>
                    <div className="header-filters">
                        <select
                            value={filterTournament}
                            onChange={(e) => setFilterTournament(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Tournaments</option>
                            {tournaments.map(t => (
                                <option key={t._id} value={t._id}>
                                    {t.name || "Unknown Tournament"}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            <div className="matches-tabs">
                <button
                    className={`tab ${activeTab === "upcoming" ? "active" : ""}`}
                    onClick={() => setActiveTab("upcoming")}
                >
                    Upcoming Matches ({filteredUpcoming.length})
                </button>
                <button
                    className={`tab ${activeTab === "completed" ? "active" : ""}`}
                    onClick={() => setActiveTab("completed")}
                >
                    Completed Matches ({filteredCompleted.length})
                </button>
            </div>

                        <main className="matches-main">
                {error && <div className="alert alert-error">{error}</div>}

                {activeTab === "upcoming" ? (
                    <div className="matches-list">
                        {filteredUpcoming.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📅</div>
                                <h2>No Upcoming Matches</h2>
                                <p>No matches scheduled at the moment.</p>
                            </div>
                        ) : (
                            filteredUpcoming.map(match => (
                                <MatchCard key={match._id} match={match} variant="standard" />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="matches-list">
                        {filteredCompleted.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🏁</div>
                                <h2>No Completed Matches</h2>
                                <p>No matches have been completed yet.</p>
                            </div>
                        ) : (
                            filteredCompleted.map(match => (
                                <MatchCard key={match._id} match={match} variant="standard" />
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Matches;