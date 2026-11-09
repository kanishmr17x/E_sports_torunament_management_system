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
import "../../styles/theme.css";
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
                    teams: teamsRes.status === "fulfilled" ? teamsRes.value : [],
                    registrations: regsRes.status === "fulfilled" ? regsRes.value : [],
                    payments: paymentsRes.status === "fulfilled" ? paymentsRes.value : [],
                    upcomingMatches: upcomingMatchesRes.status === "fulfilled" ? upcomingMatchesRes.value : [],
                    completedMatches: completedMatchesRes.status === "fulfilled" ? completedMatchesRes.value : [],
                    notifications: notificationsRes.status === "fulfilled" ? notificationsRes.value : [],
                    unreadCount: unreadCountRes.status === "fulfilled" ? unreadCountRes.value?.count || 0 : 0
                });
            } catch (err) {
                setError(err.message || "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, navigate]);

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setData(prev => ({
                ...prev,
                notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
        } catch (err) {
            console.error("Failed to mark all read:", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (authLoading || loading) {
        return (
            <div className="dashboard-page loading">
                <div className="dashboard-loader">
                    <div className="spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page error">
                <div className="dashboard-error">
                    <h2>⚠️ Error Loading Dashboard</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>
                </div>
            </div>
        );
    }

    const upcomingRegs = data.registrations.filter(r => {
        const tourney = r.tournamentId;
        return tourney && (tourney.status === "registration_open" || tourney.status === "live" || tourney.status === "upcoming");
    }).slice(0, 5);

    const _completedRegs = data.registrations.filter(r => {
        const tourney = r.tournamentId;
        return tourney && tourney.status === "completed";
    }).slice(0, 5);

    const pendingPayments = data.payments.filter(p => p.status === "pending" || p.status === "processing");
    const completedPayments = data.payments.filter(p => p.status === "paid").slice(0, 5);

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="welcome-section">
                        <h1>Welcome back, <span className="username">{user?.username || "Player"}</span>! 🎮</h1>
                        <p className="subtitle">Manage your teams, tournaments, and track your esports journey</p>
                    </div>
                    <div className="header-actions">
                        <span className={`role-badge ${user?.role}`}>{user?.role?.toUpperCase() || "PLAYER"}</span>
                        <button onClick={handleLogout} className="btn btn-outline">Logout</button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-grid">
                    {/* Quick Stats */}
                    <section className="stats-section">
                        <h2 className="section-title">📊 Quick Stats</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon teams">👥</div>
                                <div className="stat-info">
                                    <div className="stat-value">{data.teams.length}</div>
                                    <div className="stat-label">Your Teams</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon tournaments">🏆</div>
                                <div className="stat-info">
                                    <div className="stat-value">{data.registrations.length}</div>
                                    <div className="stat-label">Tournaments Joined</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon matches">🎮</div>
                                <div className="stat-info">
                                    <div className="stat-value">{data.upcomingMatches.length}</div>
                                    <div className="stat-label">Upcoming Matches</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon payments">💰</div>
                                <div className="stat-info">
                                    <div className="stat-value">{pendingPayments.length}</div>
                                    <div className="stat-label">Pending Payments</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="notifications-section">
                        <div className="section-header">
                            <h2 className="section-title">🔔 Notifications</h2>
                            {data.unreadCount > 0 && (
                                <button onClick={handleMarkAllRead} className="btn btn-sm btn-outline">
                                    Mark all read ({data.unreadCount})
                                </button>
                            )}
                        </div>
                        <div className="notifications-list">
                            {data.notifications.length === 0 ? (
                                <p className="empty-state">No notifications yet</p>
                            ) : (
                                data.notifications.map(notification => (
                                    <div key={notification._id} className={`notification-item ${!notification.isRead ? "unread" : ""}`}>
                                        <div className="notification-icon">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notification.title}</div>
                                            <div className="notification-message">{notification.message}</div>
                                            <div className="notification-time">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markNotificationAsRead(notification._id, setData)}
                                                className="btn btn-sm btn-primary"
                                            >
                                                Mark Read
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* My Teams */}
                    <section className="teams-section">
                        <div className="section-header">
                            <h2 className="section-title">👥 My Teams</h2>
                            <Link to="/dashboard/teams" className="btn btn-primary btn-sm">Create Team</Link>
                        </div>
                        <div className="teams-grid">
                            {data.teams.length === 0 ? (
                                <div className="empty-state-card">
                                    <p>You haven't created any teams yet</p>
                                    <Link to="/dashboard/teams" className="btn btn-primary">Create Your First Team</Link>
                                </div>
                            ) : (
                                data.teams.map(team => (
                                    <div key={team._id} className="team-card">
                                        <div className="team-card-header">
                                            <h3>{team.teamName}</h3>
                                            <span className="team-game">{team.game}</span>
                                        </div>
                                        <div className="team-card-body">
                                            <div className="team-info">
                                                <span>Tournament: {team.tournament?.name || "N/A"}</span>
                                                <span>Members: {team.totalMembers || 0}</span>
                                                <span>Status: <span className={`status-badge ${team.status}`}>{team.status}</span></span>
                                            </div>
                                        </div>
                                        <div className="team-card-actions">
                                            <Link to={`/teams/${team._id}`} className="btn btn-outline btn-sm">View Details</Link>
                                            <Link to={`/dashboard/teams/${team._id}/manage`} className="btn btn-primary btn-sm">Manage</Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Active Tournaments */}
                    <section className="tournaments-section">
                        <div className="section-header">
                            <h2 className="section-title">🏆 Active Tournaments</h2>
                            <Link to="/tournaments" className="btn btn-outline btn-sm">Browse All</Link>
                        </div>
                        <div className="tournaments-list">
                            {upcomingRegs.length === 0 ? (
                                <p className="empty-state">No active tournaments. <Link to="/tournaments">Browse tournaments</Link> to join!</p>
                            ) : (
                                upcomingRegs.map(reg => {
                                    const tourney = reg.tournamentId;
                                    const payment = data.payments.find(p => p.tournamentId?._id === tourney._id || p.tournamentId === tourney._id);
                                    return (
                                        <div key={reg._id} className="tournament-item">
                                            <div className="tournament-info">
                                                <h4>{tourney?.name || "Unknown Tournament"}</h4>
                                                <div className="tournament-meta">
                                                    <span>🎮 {tourney?.game}</span>
                                                    <span>📅 {tourney?.startDate ? new Date(tourney.startDate).toLocaleDateString() : "TBD"}</span>
                                                    <span className={`status-badge ${tourney?.status}`}>{tourney?.status?.replace("_", " ")}</span>
                                                </div>
                                            </div>
                                            <div className="tournament-actions">
                                                {payment && payment.status !== "paid" && (
                                                    <Link to={`/payment/${payment._id}`} className="btn btn-primary btn-sm">
                                                        {payment.status === "pending" ? "Pay Now" : "Complete Payment"}
                                                    </Link>
                                                )}
                                                <Link to={`/tournaments/${tourney?._id}`} className="btn btn-outline btn-sm">Details</Link>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* Upcoming Matches */}
                    <section className="matches-section">
                        <div className="section-header">
                            <h2 className="section-title">📅 Upcoming Matches</h2>
                            <Link to="/matches" className="btn btn-outline btn-sm">View All</Link>
                        </div>
                        <div className="matches-list">
                            {data.upcomingMatches.length === 0 ? (
                                <p className="empty-state">No upcoming matches scheduled</p>
                            ) : (
                                data.upcomingMatches.slice(0, 5).map(match => (
                                    <div key={match._id} className="match-item">
                                        <div className="match-teams">
                                            <span className="team-name">{match.team1?.teamName || "TBD"}</span>
                                            <span className="vs">vs</span>
                                            <span className="team-name">{match.team2?.teamName || "TBD"}</span>
                                        </div>
                                        <div className="match-meta">
                                            <span>🏆 {match.tournamentId?.name || "Tournament"}</span>
                                            <span>📅 {match.scheduledAt ? new Date(match.scheduledAt).toLocaleString() : "TBD"}</span>
                                            <span className={`status-badge ${match.status}`}>{match.status}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Recent Results */}
                    <section className="results-section">
                        <div className="section-header">
                            <h2 className="section-title">🏁 Recent Results</h2>
                            <Link to="/results" className="btn btn-outline btn-sm">View All</Link>
                        </div>
                        <div className="results-list">
                            {data.completedMatches.length === 0 ? (
                                <p className="empty-state">No completed matches yet</p>
                            ) : (
                                data.completedMatches.map(match => (
                                    <div key={match._id} className="result-item">
                                        <div className="result-teams">
                                            <span className="team-name">{match.team1?.teamName || "TBD"}</span>
                                            <span className="score">{match.team1Score} - {match.team2Score}</span>
                                            <span className="team-name">{match.team2?.teamName || "TBD"}</span>
                                        </div>
                                        <div className="result-meta">
                                            <span>🏆 {match.tournamentId?.name || "Tournament"}</span>
                                            <span>🏅 Winner: {match.winner?.teamName || "Draw"}</span>
                                            <span>📅 {match.scheduledAt ? new Date(match.scheduledAt).toLocaleDateString() : "TBD"}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Payment History */}
                    <section className="payments-section">
                        <div className="section-header">
                            <h2 className="section-title">💳 Payment History</h2>
                        </div>
                        <div className="payments-list">
                            {completedPayments.length === 0 && pendingPayments.length === 0 ? (
                                <p className="empty-state">No payment history</p>
                            ) : (
                                [...pendingPayments, ...completedPayments].map(payment => (
                                    <div key={payment._id} className="payment-item">
                                        <div className="payment-info">
                                            <h4>{payment.tournamentId?.name || "Tournament"}</h4>
                                            <span>Team: {payment.teamId?.teamName || "Unknown"}</span>
                                        </div>
                                        <div className="payment-details">
                                            <span className="amount">${payment.amount}</span>
                                            <span className={`status-badge ${payment.status}`}>
                                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

function getNotificationIcon(type) {
    const icons = {
        registration_confirmed: "✅",
        payment_confirmed: "💰",
        payment_failed: "❌",
        match_scheduled: "📅",
        match_updated: "🔄",
        match_result: "🏁",
        tournament_status_changed: "🏆",
        team_invite: "👥",
        general: "📢"
    };
    return icons[type] || "📢";
}

async function markNotificationAsRead(id, setData) {
    try {
        await markNotificationRead(id);
        setData(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
            unreadCount: Math.max(0, prev.unreadCount - 1)
        }));
    } catch (err) {
        console.error("Failed to mark read:", err);
    }
}

export default UserDashboard;