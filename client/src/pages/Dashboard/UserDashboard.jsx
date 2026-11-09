import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getMyTeams,
    getMyRegistrations,
    getMyPayments,
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    getUpcomingMatches,
    getCompletedMatches,
    getProfile
} from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import StatCard from "../../components/StatCard";
import TournamentCard from "../../components/TournamentCard";
import MatchCard from "../../components/MatchCard";
import Breadcrumbs from "../../components/Breadcrumbs";
import { formatTimeIST } from "../../utils/formatters";
import "../../styles/theme.css";
import "../../styles/components.css";
import "../../styles/dashboard.css";

const UserDashboard = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        profile: null,
        teams: [],
        registrations: [],
        payments: [],
        upcomingMatches: [],
        completedMatches: [],
        notifications: [],
        unreadCount: 0
    });
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (authLoading) return;
            if (!user) {
                navigate("/login");
                return;
            }
            try {
                setLoading(true);
                const [
                    profileRes,
                    teamsRes,
                    regsRes,
                    paymentsRes,
                    upcomingMatchesRes,
                    completedMatchesRes,
                    notificationsRes,
                    unreadCountRes
                ] = await Promise.allSettled([
                    getProfile(),
                    getMyTeams(),
                    getMyRegistrations(),
                    getMyPayments(),
                    getUpcomingMatches(),
                    getCompletedMatches({ limit: 10 }),
                    getNotifications({ limit: 10 }),
                    getUnreadCount()
                ]);

                setData({
                    profile: profileRes.status === "fulfilled" ? profileRes.value : null,
                    teams: teamsRes.status === "fulfilled" && Array.isArray(teamsRes.value) ? teamsRes.value : [],
                    registrations: regsRes.status === "fulfilled" && Array.isArray(regsRes.value) ? regsRes.value : [],
                    payments: paymentsRes.status === "fulfilled" && Array.isArray(paymentsRes.value) ? paymentsRes.value : [],
                    upcomingMatches: upcomingMatchesRes.status === "fulfilled" && Array.isArray(upcomingMatchesRes.value) ? upcomingMatchesRes.value : [],
                    completedMatches: completedMatchesRes.status === "fulfilled" && Array.isArray(completedMatchesRes.value) ? completedMatchesRes.value : [],
                    notifications: notificationsRes.status === "fulfilled" && Array.isArray(notificationsRes.value) ? notificationsRes.value : [],
                    unreadCount: unreadCountRes.status === "fulfilled" ? unreadCountRes.value?.count || 0 : 0
                });
            } catch (err) {
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, authLoading, navigate]);

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setData(prev => ({
                ...prev,
                notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleMarkOneRead = async (id) => {
        try {
            await markNotificationRead(id);
            setData(prev => ({
                ...prev,
                notifications: prev.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
                unreadCount: Math.max(0, prev.unreadCount - 1)
            }));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (authLoading || loading) {
        return (
            <div className="dashboard-page-pro loading">
                <div className="dashboard-loader-pro">
                    <div className="spinner"></div>
                    <p>Loading Athlete Headquarters...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page-pro error">
                <div className="dashboard-error-card">
                    <h2>⚠️ Dashboard Telemetry Error</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary">
                        Reconnect
                    </button>
                </div>
            </div>
        );
    }

    const upcomingRegs = data.registrations.filter(r => {
        const tourney = r.tournamentId;
        return tourney && (tourney.status === "registration_open" || tourney.status === "live" || tourney.status === "open" || tourney.status === "upcoming");
    });

    const pendingPayments = data.payments.filter(p => p.status === "pending" || p.status === "processing");

    return (
        <div className="dashboard-page-pro">
            <div className="container">
                <Breadcrumbs items={[{ label: "Player Headquarters" }]} />

                {/* =========================================================================
                    1. ATHLETE PROFILE BANNER & COMMAND BAR
                    ========================================================================= */}
                <header className="athlete-profile-banner">
                    <div className="athlete-profile-left">
                        <div className="athlete-avatar-pro">
                            {user?.username ? user.username.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div className="athlete-info-col">
                            <div className="athlete-title-row">
                                <h1 className="athlete-ign">{user?.username || "Player"}</h1>
                                <span className={`athlete-role-badge ${user?.role || "player"}`}>
                                    {user?.role?.toUpperCase() || "PLAYER"}
                                </span>
                                <span className="athlete-verified-badge" title="Identity Verified">
                                    ✓ Verified
                                </span>
                            </div>
                            <p className="athlete-meta">
                                <span>📧 {user?.email}</span>
                                <span>🏆 Competitive Tier: Pro Division</span>
                                <span>🛡️ Squads Active: {data.teams.length}</span>
                            </p>
                        </div>
                    </div>

                    <div className="athlete-profile-actions">
                        <Link to="/team-management" className="btn btn-primary btn-sm">
                            + Create Squad
                        </Link>
                        <Link to="/tournaments" className="btn btn-outline btn-sm">
                            Join Tournament
                        </Link>
                        <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Log Out">
                            Logout
                        </button>
                    </div>
                </header>

                {/* =========================================================================
                    2. TELEMETRY METRIC TILES
                    ========================================================================= */}
                <section className="dashboard-kpi-grid">
                    <StatCard
                        label="Registered Squads"
                        value={data.teams.length}
                        subtext="Active competitive rosters"
                        icon="🛡️"
                        trend={data.teams.length > 0 ? "Lineup ready" : "Create a squad"}
                        trendDirection="up"
                        accent="violet"
                        progress={data.teams.length > 0 ? 100 : 25}
                    />
                    <StatCard
                        label="Active Tournaments"
                        value={upcomingRegs.length}
                        subtext="Circuits entered"
                        icon="🏆"
                        trend={`${data.registrations.length} Total Registered`}
                        trendDirection="up"
                        accent="cyan"
                        progress={Math.min(100, upcomingRegs.length * 25)}
                    />
                    <StatCard
                        label="Scheduled Fixtures"
                        value={data.upcomingMatches.length}
                        subtext="Pending match rounds"
                        icon="⚔️"
                        trend={data.upcomingMatches.length > 0 ? "Upcoming battle" : "No matches pending"}
                        trendDirection={data.upcomingMatches.length > 0 ? "up" : "neutral"}
                        accent="gold"
                        progress={data.upcomingMatches.length > 0 ? 80 : 0}
                    />
                    <StatCard
                        label="Entry Invoices"
                        value={pendingPayments.length}
                        subtext={pendingPayments.length > 0 ? "Action required" : "All accounts clear"}
                        icon="💳"
                        trend={pendingPayments.length > 0 ? "Pending payment" : "Zero balance"}
                        trendDirection={pendingPayments.length > 0 ? "down" : "neutral"}
                        accent={pendingPayments.length > 0 ? "danger" : "cyan"}
                        progress={pendingPayments.length > 0 ? 40 : 100}
                    />
                </section>

                {/* =========================================================================
                    3. DELIBERATE 2-COLUMN ASYMMETRIC GRID (8 / 4 Split)
                    ========================================================================= */}
                <div className="dashboard-asymmetric-grid">
                    {/* LEFT / MAIN COLUMN (2fr) */}
                    <div className="dashboard-main-col">
                        {/* Active Circuit Entries */}
                        <section className="dash-section-card">
                            <div className="dash-section-header">
                                <div className="dash-header-title-wrap">
                                    <span className="dash-kicker">COMPETITIVE SLATE</span>
                                    <h2 className="dash-section-title">Active Tournament Entries</h2>
                                </div>
                                <Link to="/tournaments" className="btn btn-outline btn-sm">
                                    Browse Arenas →
                                </Link>
                            </div>

                            {upcomingRegs.length === 0 ? (
                                <div className="dash-empty-state">
                                    <span className="empty-ico">🏆</span>
                                    <h3>No Active Tournaments</h3>
                                    <p>Your squads are not registered for any upcoming tournaments right now.</p>
                                    <Link to="/tournaments" className="btn btn-primary btn-sm">
                                        Explore Open Tournaments
                                    </Link>
                                </div>
                            ) : (
                                <div className="dash-tournaments-list">
                                    {upcomingRegs.map(reg => {
                                        const tourney = reg.tournamentId;
                                        if (!tourney) return null;
                                        return (
                                            <TournamentCard
                                                key={reg._id}
                                                tournament={tourney}
                                                variant="horizontal"
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Upcoming Match Schedule */}
                        <section className="dash-section-card">
                            <div className="dash-section-header">
                                <div className="dash-header-title-wrap">
                                    <span className="dash-kicker">BATTLE TIMELINE</span>
                                    <h2 className="dash-section-title">Upcoming Match Schedule</h2>
                                </div>
                                <Link to="/matches" className="btn btn-outline btn-sm">
                                    View Full Schedule →
                                </Link>
                            </div>

                            {data.upcomingMatches.length === 0 ? (
                                <div className="dash-empty-state">
                                    <span className="empty-ico">📅</span>
                                    <h3>No Upcoming Matches</h3>
                                    <p>Fixtures will appear here once brackets are generated by organizers.</p>
                                </div>
                            ) : (
                                <div className="dash-matches-grid">
                                    {data.upcomingMatches.slice(0, 4).map(match => (
                                        <MatchCard
                                            key={match._id}
                                            match={match}
                                            variant="standard"
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Recent Match Performance Log */}
                        <section className="dash-section-card">
                            <div className="dash-section-header">
                                <div className="dash-header-title-wrap">
                                    <span className="dash-kicker">HISTORICAL LOG</span>
                                    <h2 className="dash-section-title">Recent Battle Results</h2>
                                </div>
                                <Link to="/results" className="btn btn-outline btn-sm">
                                    All Results →
                                </Link>
                            </div>

                            {data.completedMatches.length === 0 ? (
                                <div className="dash-empty-state">
                                    <span className="empty-ico">🏁</span>
                                    <h3>No Match History</h3>
                                    <p>Completed tournament matches will log here automatically.</p>
                                </div>
                            ) : (
                                <div className="dash-matches-grid">
                                    {data.completedMatches.slice(0, 4).map(match => (
                                        <MatchCard
                                            key={match._id}
                                            match={match}
                                            variant="standard"
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* RIGHT / SIDEBAR COLUMN (1fr) */}
                    <aside className="dashboard-sidebar-col">
                        {/* My Teams Quick Command */}
                        <section className="dash-side-panel">
                            <div className="dash-side-header">
                                <h3 className="side-panel-title">🛡️ My Squads ({data.teams.length})</h3>
                                <Link to="/team-management" className="btn btn-primary btn-xs">
                                    + New
                                </Link>
                            </div>

                            {data.teams.length === 0 ? (
                                <div className="side-empty-state">
                                    <p>No squads assembled yet.</p>
                                    <Link to="/team-management" className="btn btn-outline btn-sm">
                                        Form a Team
                                    </Link>
                                </div>
                            ) : (
                                <div className="side-squads-list">
                                    {data.teams.map(team => (
                                        <div key={team._id} className="side-squad-row">
                                            <div className="side-squad-avatar">
                                                {team.teamName ? team.teamName.charAt(0).toUpperCase() : "S"}
                                            </div>
                                            <div className="side-squad-info">
                                                <h4 className="side-squad-name">{team.teamName}</h4>
                                                <span className="side-squad-meta">
                                                    {team.game} • {team.totalMembers || 0} Members
                                                </span>
                                            </div>
                                            <Link to={`/teams/${team._id}`} className="btn btn-outline btn-xs">
                                                Dossier
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Notifications Hub */}
                        <section className="dash-side-panel">
                            <div className="dash-side-header">
                                <div className="side-title-with-pill">
                                    <h3 className="side-panel-title">🔔 Tactical Intel</h3>
                                    {data.unreadCount > 0 && (
                                        <span className="unread-counter-pill">
                                            {data.unreadCount} New
                                        </span>
                                    )}
                                </div>
                                {data.unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleMarkAllRead}
                                        className="btn btn-ghost btn-xs"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {data.notifications.length === 0 ? (
                                <p className="side-empty-msg">Zero unread dispatches. All quiet on the circuit.</p>
                            ) : (
                                <div className="side-notifications-feed">
                                    {data.notifications.slice(0, 5).map(n => (
                                        <div
                                            key={n._id}
                                            className={`side-notif-item ${!n.isRead ? "unread" : ""}`}
                                        >
                                            <div className="notif-header-row">
                                                <span className="notif-title">{n.title || "Dispatch"}</span>
                                                {!n.isRead && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMarkOneRead(n._id)}
                                                        className="notif-mark-btn"
                                                        title="Mark read"
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                            </div>
                                            <p className="notif-body">{n.message}</p>
                                            <span className="notif-date">
                                                {formatTimeIST(n.createdAt)} IST
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Quick Action Shortcuts */}
                        <section className="dash-side-panel quick-links-panel">
                            <h3 className="side-panel-title">⚡ Command Shortcuts</h3>
                            <div className="quick-actions-list">
                                <Link to="/bracket" className="quick-action-link">
                                    <span>🏆 Bracket Visualizer</span>
                                    <span className="quick-arrow">→</span>
                                </Link>
                                <Link to="/leaderboard" className="quick-action-link">
                                    <span>📈 Circuit Standings</span>
                                    <span className="quick-arrow">→</span>
                                </Link>
                                <Link to="/matches" className="quick-action-link">
                                    <span>⚔️ Match Fixtures</span>
                                    <span className="quick-arrow">→</span>
                                </Link>
                                <Link to="/contact" className="quick-action-link">
                                    <span>🛡️ Contact Tournament Admin</span>
                                    <span className="quick-arrow">→</span>
                                </Link>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
