import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getPlayers } from "../../api/apiRoutes";
import api from "../../api/axiosConfig";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import Breadcrumbs from "../../components/Breadcrumbs";
import PlayerCard from "../../components/PlayerCard";
import "../../styles/theme.css";
import "../../styles/teams.css";

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, playerId: null, playerName: "" });
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useAuth();

  const handleDeletePlayer = async (playerId) => {
    try {
      setDeleting(true);
      await api.delete(`/players/${playerId}`);
      setPlayers((prevPlayers) => prevPlayers.filter((p) => p._id !== playerId));
      setDeleteModal({ isOpen: false, playerId: null, playerName: "" });
    } catch {
      setError("Failed to delete athlete dossier. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (playerId, playerName) => {
    setDeleteModal({ isOpen: true, playerId, playerName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, playerId: null, playerName: "" });
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await getPlayers();
        setPlayers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load player directory");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const roles = useMemo(() => {
    const set = new Set();
    players.forEach((p) => {
      if (p.role) set.add(p.role);
    });
    return ["all", ...Array.from(set)];
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchRole = selectedRole === "all" || p.role?.toLowerCase() === selectedRole.toLowerCase();
      const matchQuery = !searchQuery.trim() || 
        p.playerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.gameId?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRole && matchQuery;
    });
  }, [players, selectedRole, searchQuery]);

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Athletes & Players" },
  ];

  if (loading) {
    return (
      <div className="teams-page">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div className="admin-spinner" style={{ margin: "0 auto 1.5rem" }} />
          <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Loading Athlete Database...</h3>
          <p style={{ color: "var(--text-secondary)" }}>Accessing verified player profiles and dossiers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teams-page">
      <div className="container">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Banner Header */}
        <header className="teams-banner-cyber">
          <div className="teams-banner-content">
            <div className="teams-kicker-row">
              <span className="teams-circuit-badge">⚡ ATHLETE ROSTER</span>
              <span className="teams-count-badge">{players.length} Registered Competitors</span>
            </div>
            <h1 className="teams-banner-title">Esports Athletes Directory</h1>
            <p className="teams-banner-subtitle">
              Inspect verified competitor dossiers, view assigned teams, explore roles, or register a new athlete profile.
            </p>
          </div>

          <div className="teams-banner-ctas">
            <Link to="/register" className="btn btn-primary btn-lg">
              ⚡ Enlist Athlete
            </Link>
          </div>
        </header>

        {/* Controls / Filter Bar */}
        <section className="teams-controls-bar">
          <div className="teams-game-tabs">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`teams-tab-btn ${selectedRole === r ? "active" : ""}`}
              >
                {r === "all" ? "🎯 All Roles" : r}
              </button>
            ))}
          </div>

          <div className="teams-search-wrapper">
            <span className="teams-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by IGN or Game ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="teams-search-input"
            />
          </div>
        </section>

        {error && (
          <div className="teams-error-alert">
            <span>⚠️ {error}</span>
            <button onClick={() => window.location.reload()} className="btn btn-outline btn-xs">
              Retry
            </button>
          </div>
        )}

        {/* Players Cyber Grid */}
        {filteredPlayers.length === 0 ? (
          <div className="teams-empty-state">
            <div className="teams-empty-icon">🎮</div>
            <h3>No Athletes Located</h3>
            <p>
              {searchQuery || selectedRole !== "all"
                ? "No athletes match your query. Try clearing the search or role filter."
                : "No athletes have registered yet. Register your profile to enter tournaments!"}
            </p>
            <Link to="/register" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              ⚡ Register Athlete
            </Link>
          </div>
        ) : (
          <div className="teams-cyber-grid">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player._id}
                player={player}
                isAdmin={isAdmin}
                onDelete={openDeleteModal}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeletePlayer(deleteModal.playerId)}
        title="Delete Athlete Dossier"
        message={`Are you sure you want to permanently delete the profile of "${deleteModal.playerName}"? This cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  );
};

export default PlayerList;
