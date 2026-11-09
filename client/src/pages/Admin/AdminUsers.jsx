import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, getUserStats, updateUserRole, deactivateUser, activateUser } from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import "../../styles/theme.css";
import "../../styles/adminUsers.css";

const AdminUsers = () => {
    const navigate = useNavigate();
    const { isAdmin, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, players: 0, organizers: 0, admins: 0, recentUsers: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: "" });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate("/unauthorized");
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        loadUsers();
        loadStats();
    }, [page, search, roleFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 20 };
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            
            const res = await getAdminUsers(params);
            setUsers(res.users);
            setTotalPages(res.pagination.pages);
        } catch (err) {
            setError(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const res = await getUserStats();
            setStats({
                ...res,
                players: res.byRole?.players || 0,
                organizers: res.byRole?.organizers || 0,
                admins: res.byRole?.admins || 0
            });
        } catch (err) {
            console.error("Failed to load stats:", err);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            setError(err.message || "Failed to update role");
        }
    };

    const _handleDeactivate = async (userId) => {
        try {
            await deactivateUser(userId);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: false } : u));
        } catch (err) {
            setError(err.message || "Failed to deactivate user");
        }
    };

    const handleActivate = async (userId) => {
        try {
            await activateUser(userId);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: true } : u));
        } catch (err) {
            setError(err.message || "Failed to activate user");
        }
    };

    const openDeleteModal = (userId, userName) => {
        setDeleteModal({ isOpen: true, userId, userName });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, userId: null, userName: "" });
    };

    const handleDelete = async () => {
        if (!deleteModal.userId) return;
        try {
            setDeleting(true);
            await deactivateUser(deleteModal.userId);
            closeDeleteModal();
            loadUsers();
        } catch (err) {
            setError(err.message || "Failed to delete user");
        } finally {
            setDeleting(false);
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

    if (!isAdmin) {
        return (
            <div className="admin-page unauthorized">
                <div className="unauthorized-content">
                    <div className="unauthorized-icon">🚫</div>
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access this page.</p>
                    <button onClick={() => navigate("/")} className="btn btn-primary">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="header-content">
                    <div>
                        <h1>👥 User Management</h1>
                        <p className="subtitle">Manage user accounts, roles, and permissions</p>
                    </div>
                </div>
            </header>

            <main className="admin-main">
                {error && <div className="alert alert-error">{error}</div>}

                {/* Stats Cards */}
                <section className="stats-section">
                    <h2 className="section-title">📊 User Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon total">👤</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.totalUsers}</div>
                                <div className="stat-label">Total Users</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon players">🎮</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.players}</div>
                                <div className="stat-label">Players</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon organizers">🏆</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.organizers}</div>
                                <div className="stat-label">Organizers</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon admins">👑</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.admins}</div>
                                <div className="stat-label">Admins</div>
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
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="search-input"
                            />
                        </div>
                        <div className="filter-group">
                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="filter-select"
                            >
                                <option value="">All Roles</option>
                                <option value="player">Player</option>
                                <option value="organizer">Organizer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Users Table */}
                <section className="users-section">
                    <div className="section-header">
                        <h2 className="section-title">Users</h2>
                        <span className="user-count">{users.length} users (Page {page} of {totalPages})</span>
                    </div>
                    
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👤</div>
                            <h2>No Users Found</h2>
                            <p>No users match your search criteria.</p>
                        </div>
                    ) : (
                        <>
                            <div className="users-table-container">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Teams</th>
                                            <th>Registrations</th>
                                            <th>Payments</th>
                                            <th>Total Spent</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user._id}>
                                                <td>
                                                    <div className="user-cell">
                                                        <strong>{user.username}</strong>
                                                    </div>
                                                </td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        className="role-select"
                                                    >
                                                        <option value="player">Player</option>
                                                        <option value="organizer">Organizer</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td>{user.teams || 0}</td>
                                                <td>{user.registrations || 0}</td>
                                                <td>{user.payments || 0}</td>
                                                <td>${user.totalSpent || 0}</td>
                                                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        {(user.isActive !== false) && (
                                                            <button
                                                                onClick={() => openDeleteModal(user._id, user.username)}
                                                                className="btn btn-danger btn-sm"
                                                            >
                                                                Deactivate
                                                            </button>
                                                        )}
                                                        {user.isActive === false && (
                                                            <button
                                                                onClick={() => handleActivate(user._id)}
                                                                className="btn btn-success btn-sm"
                                                            >
                                                                Activate
                                                            </button>
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
                    isOpen={deleteModal.isOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleDelete}
                    title="Deactivate User"
                    message={`Are you sure you want to deactivate "${deleteModal.userName}"? This will prevent them from logging in.`}
                    isLoading={deleting}
                />
            </main>
        </div>
    );
};

export default AdminUsers;