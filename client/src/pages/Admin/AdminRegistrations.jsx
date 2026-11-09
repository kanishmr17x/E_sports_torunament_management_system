import { useEffect, useState } from "react";
import { getAdminRegistrations, getRegistrationStats, approveRegistration, rejectRegistration } from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import AdminNav from "../../components/AdminNav";
import { formatINR, formatDateTimeIST } from "../../utils/formatters";
import "../../styles/theme.css";
import "../../styles/adminRegistrations.css";

const AdminRegistrations = () => {
    const { isAdmin, isOrganizer, loading: authLoading } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [stats, setStats] = useState({ total: 0, byTournament: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [tournamentFilter, setTournamentFilter] = useState("");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
    const [rejectModal, setRejectModal] = useState({ isOpen: false, registrationId: null, registration: null });

    useEffect(() => {
        if (!authLoading && !isAdmin && !isOrganizer) {
            window.location.href = "/unauthorized";
        }
    }, [isAdmin, isOrganizer, authLoading]);

    useEffect(() => {
        loadRegistrations();
        loadStats();
    }, [page, tournamentFilter, paymentStatusFilter]);

    const loadRegistrations = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 20 };
            if (tournamentFilter) params.tournamentId = tournamentFilter;
            if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
            
            const res = await getAdminRegistrations(params);
            setRegistrations(res.registrations);
            setTotalPages(res.pagination.pages);
        } catch (err) {
            setError(err.message || "Failed to load registrations");
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const res = await getRegistrationStats();
            setStats(res);
        } catch (err) {
            console.error("Failed to load stats:", err);
        }
    };

    const handleApprove = async (registrationId) => {
        try {
            await approveRegistration(registrationId);
            setRegistrations(prev => prev.map(r => 
                r._id === registrationId ? { ...r, paymentStatus: "paid" } : r
            ));
        } catch (err) {
            setError(err.message || "Failed to approve registration");
        }
    };

    const openRejectModal = (registration) => {
        setRejectModal({ isOpen: true, registrationId: registration._id, registration });
    };

    const closeRejectModal = () => {
        setRejectModal({ isOpen: false, registrationId: null, registration: null });
    };

    const handleReject = async (reason) => {
        if (!rejectModal.registrationId) return;
        try {
            await rejectRegistration(rejectModal.registrationId, reason);
            closeRejectModal();
            loadRegistrations();
        } catch (err) {
            setError(err.message || "Failed to reject registration");
        }
    };

    if (authLoading) {
        return (
            <div className="admin-page loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin && !isOrganizer) {
        return (
            <div className="admin-page unauthorized">
                <div className="unauthorized-content">
                    <div className="unauthorized-icon">🚫</div>
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    const pendingApprovals = registrations.filter(r => r.paymentStatus === "paid" && r.status !== "approved").length;

    return (
        <div className="admin-page">
            <div className="container">
                <AdminNav
                    title="Registration Approvals"
                    subtitle="Review pending tournament entries, verify player requirements, approve or reject rosters."
                />

            <main className="admin-main">
                {error && <div className="alert alert-error">{error}</div>}

                {/* Stats */}
                <section className="stats-section">
                    <h2 className="section-title">📊 Registration Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📝</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.total}</div>
                                <div className="stat-label">Total Registrations</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <div className="stat-value">{pendingApprovals}</div>
                                <div className="stat-label">Pending Approval</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-info">
                                <div className="stat-value">
                                    ${registrations.filter(r => r.paymentStatus === "paid").reduce((sum, r) => sum + (r.amount || 0), 0)}
                                </div>
                                <div className="stat-label">Revenue</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <section className="filters-section">
                    <div className="filters">
                        <div className="filter-group">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="filter-group">
                            <select
                                value={tournamentFilter}
                                onChange={(e) => {
                                    setTournamentFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="filter-select"
                            >
                                <option value="">All Tournaments</option>
                                {stats.byTournament.map(t => (
                                    <option key={t._id} value={t._id}>{t.tournamentName} ({t.count})</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <select
                                value={paymentStatusFilter}
                                onChange={(e) => {
                                    setPaymentStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="filter-select"
                            >
                                <option value="">All Payment Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Registrations Table */}
                <section className="registrations-section">
                    <div className="section-header">
                        <h2 className="section-title">Registrations</h2>
                        <span className="reg-count">{registrations.length} registrations (Page {page} of {totalPages})</span>
                    </div>
                    
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading registrations...</p>
                        </div>
                    ) : registrations.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📝</div>
                            <h2>No Registrations Found</h2>
                            <p>No registrations match your filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="registrations-table-container">
                                <table className="registrations-table">
                                    <thead>
                                        <tr>
                                            <th>Team</th>
                                            <th>Tournament</th>
                                            <th>Registered</th>
                                            <th>Payment Status</th>
                                            <th>Amount</th>
                                            <th>Registration Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrations.map(reg => (
                                            <tr key={reg._id}>
                                                <td>
                                                    <div className="team-cell">
                                                        <strong>{reg.teamId?.teamName || "Unknown"}</strong>
                                                        <span className="team-game">{reg.teamId?.game}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="tournament-cell">
                                                        <strong>{reg.tournamentId?.name || "Unknown"}</strong>
                                                        <span className="tournament-game">{reg.tournamentId?.game}</span>
                                                    </div>
                                                </td>
                                                <td>{reg.registeredAt ? formatDateTimeIST(reg.registeredAt) : "N/A"}</td>
                                                <td>
                                                    <span className={`payment-status ${reg.paymentStatus}`}>
                                                        {reg.paymentStatus.charAt(0).toUpperCase() + reg.paymentStatus.slice(1)}
                                                    </span>
                                                </td>
                                                <td>{formatINR(reg.amount || 0)}</td>
                                                <td>
                                                    <span className={`reg-status ${reg.status || "registered"}`}>
                                                        {reg.status || "Registered"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        {reg.paymentStatus === "paid" && reg.status !== "approved" && (
                                                            <button
                                                                onClick={() => handleApprove(reg._id)}
                                                                className="btn btn-success btn-sm"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        {(reg.paymentStatus === "paid" || reg.paymentStatus === "pending") && (
                                                            <button
                                                                onClick={() => openRejectModal(reg)}
                                                                className="btn btn-danger btn-sm"
                                                            >
                                                                Reject
                                                            </button>
                                                        )}
                                                        {reg.paymentId && (
                                                            <a href={`/admin/payments/${reg.paymentId}`} className="btn btn-outline btn-sm">
                                                                View Payment
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn btn-outline btn-sm"
                                >
                                    Previous
                                </button>
                                <span className="page-info">Page {page} of {totalPages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn btn-outline btn-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </section>

                <ConfirmModal
                    isOpen={rejectModal.isOpen}
                    onClose={closeRejectModal}
                    onConfirm={() => handleReject(rejectModal.reason)}
                    title="Reject Registration"
                    message={`Are you sure you want to reject this registration? This will refund any payment made.`}
                    isLoading={false}
                    showReasonInput
                    onReasonChange={(reason) => setRejectModal(prev => ({ ...prev, reason }))}
                />
            </main>
            </div>
        </div>
    );
};

export default AdminRegistrations;