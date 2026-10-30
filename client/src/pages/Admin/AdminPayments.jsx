import { useEffect, useState } from "react";
import { getAllPayments, getPaymentStats, refundPayment } from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import "../../styles/theme.css";
import "../../styles/adminPayments.css";

const AdminPayments = () => {
    const { isAdmin, isOrganizer, loading: authLoading } = useAuth();
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ byStatus: [], totalRevenue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [tournamentFilter, setTournamentFilter] = useState("");
    const [refundModal, setRefundModal] = useState({ isOpen: false, paymentId: null, payment: null, reason: "" });

    useEffect(() => {
        if (!authLoading && !isAdmin && !isOrganizer) {
            window.location.href = "/unauthorized";
        }
    }, [isAdmin, isOrganizer, authLoading]);

    useEffect(() => {
        loadPayments();
        loadStats();
    }, [page, statusFilter, tournamentFilter]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 20 };
            if (statusFilter) params.status = statusFilter;
            if (tournamentFilter) params.tournamentId = tournamentFilter;
            
            const res = await getAllPayments(params);
            setPayments(res);
            setTotalPages(Math.ceil(res.length / 20));
        } catch (err) {
            setError(err.message || "Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const res = await getPaymentStats();
            setStats(res);
        } catch (err) {
            console.error("Failed to load stats:", err);
        }
    };

    const openRefundModal = (payment) => {
        setRefundModal({ isOpen: true, paymentId: payment._id, payment, reason: "" });
    };

    const closeRefundModal = () => {
        setRefundModal({ isOpen: false, paymentId: null, payment: null, reason: "" });
    };

    const handleRefund = async () => {
        if (!refundModal.paymentId || !refundModal.reason.trim()) return;
        try {
            await refundPayment(refundModal.paymentId, { reason: refundModal.reason });
            closeRefundModal();
            loadPayments();
            loadStats();
        } catch (err) {
            setError(err.message || "Failed to process refund");
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

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="header-content">
                    <div>
                        <h1>💰 Payment Management</h1>
                        <p className="subtitle">View and manage tournament payments</p>
                    </div>
                </div>
            </header>

            <main className="admin-main">
                {error && <div className="alert alert-error">{error}</div>}

                {/* Revenue Stats */}
                <section className="stats-section">
                    <h2 className="section-title">📊 Revenue Overview</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-info">
                                <div className="stat-value">${stats.totalRevenue || 0}</div>
                                <div className="stat-label">Total Revenue</div>
                            </div>
                        </div>
                        {stats.byStatus.map(s => (
                            <div key={s._id} className="stat-card">
                                <div className="stat-icon">{getStatusIcon(s._id)}</div>
                                <div className="stat-info">
                                    <div className="stat-value">${s.totalAmount}</div>
                                    <div className="stat-label">{s._id.charAt(0).toUpperCase() + s._id.slice(1)} ({s.count})</div>
                                </div>
                            </div>
                        ))}
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
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="filter-select"
                            >
                                <option value="">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="failed">Failed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
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
                            </select>
                        </div>
                    </div>
                </section>

                {/* Payments Table */}
                <section className="payments-section">
                    <div className="section-header">
                        <h2 className="section-title">All Payments</h2>
                        <span className="pay-count">{payments.length} payments (Page {page} of {totalPages})</span>
                    </div>
                    
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading payments...</p>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">💰</div>
                            <h2>No Payments Found</h2>
                            <p>No payments match your filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="payments-table-container">
                                <table className="payments-table">
                                    <thead>
                                        <tr>
                                            <th>Transaction ID</th>
                                            <th>User</th>
                                            <th>Team</th>
                                            <th>Tournament</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Method</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(payment => (
                                            <tr key={payment._id}>
                                                <td>
                                                    <code className="txn-id">{payment.transactionId}</code>
                                                </td>
                                                <td>
                                                    <div className="user-cell">
                                                        <strong>{payment.userId?.username || "Unknown"}</strong>
                                                        <span>{payment.userId?.email}</span>
                                                    </div>
                                                </td>
                                                <td>{payment.teamId?.teamName || "Unknown"}</td>
                                                <td>
                                                    <div className="tournament-cell">
                                                        <strong>{payment.tournamentId?.name || "Unknown"}</strong>
                                                        <span className="tournament-game">{payment.tournamentId?.game}</span>
                                                    </div>
                                                </td>
                                                <td className="amount-cell">${payment.amount}</td>
                                                <td>
                                                    <span className={`payment-status ${payment.status}`}>
                                                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td>{payment.paymentMethod?.toUpperCase() || "Test"}</td>
                                                <td>{payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "N/A"}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        {payment.status === "paid" && (
                                                            <button
                                                                onClick={() => openRefundModal(payment)}
                                                                className="btn btn-warning btn-sm"
                                                            >
                                                                Refund
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => window.open(`/payment/${payment._id}`, "_blank")}
                                                            className="btn btn-outline btn-sm"
                                                        >
                                                            View
                                                        </button>
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
                    isOpen={refundModal.isOpen}
                    onClose={closeRefundModal}
                    onConfirm={handleRefund}
                    title="Refund Payment"
                    message={`Are you sure you want to refund $${refundModal.payment?.amount} for transaction ${refundModal.payment?.transactionId}? This will also cancel the associated registration.`}
                    isLoading={false}
                    showReasonInput
                    onReasonChange={(reason) => setRefundModal(prev => ({ ...prev, reason }))}
                />
            </main>
        </div>
    );
};

function getStatusIcon(status) {
    const icons = {
        paid: "✅",
        pending: "⏳",
        processing: "⚙️",
        failed: "❌",
        cancelled: "🚫",
        refunded: "↩️"
    };
    return icons[status] || "💰";
}

export default AdminPayments;