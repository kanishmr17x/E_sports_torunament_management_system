import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getTeams } from "../../api/apiRoutes";
import api from "../../api/axiosConfig";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import Breadcrumbs from "../../components/Breadcrumbs";
import TeamCard from "../../components/TeamCard";
import "../../styles/theme.css";
import "../../styles/teams.css";

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, teamId: null, teamName: "" });
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useAuth();

  const handleDeleteTeam = async (teamId) => {
    try {
      setDeleting(true);
      await api.delete(`/teams/${teamId}`);
      setTeams((prevTeams) => prevTeams.filter((team) => team._id !== teamId));
      setDeleteModal({ isOpen: false, teamId: null, teamName: "" });
    } catch {
      setError("Failed to delete team. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (teamId, teamName) => {
    setDeleteModal({ isOpen: true, teamId, teamName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, teamId: null, teamName: "" });
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await getTeams();
        const list = Array.isArray(teamsData) ? teamsData : [];
        setTeams(list);
      } catch (err) {
        setError(err.message || "Failed to load team rosters");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const games = useMemo(() => {
    const set = new Set();
    teams.forEach((t) => {
      if (t.game) set.add(t.game);
    });
    return ["all", ...Array.from(set)];
  }, [teams]);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchGame = selectedGame === "all" || t.game?.toLowerCase() === selectedGame.toLowerCase();
      const matchQuery = !searchQuery.trim() || 
        t.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.game?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGame && matchQuery;
    });
  }, [teams, selectedGame, searchQuery]);

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Teams & Squads" },
  ];

  if (loading) {
    return (
      <div className="teams-page">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div className="admin-spinner" style={{ margin: "0 auto 1.5rem" }} />
          <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Loading Squad Rosters...</h3>
          <p style={{ color: "var(--text-secondary)" }}>Fetching active competitive esports squads.</p>
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
              <span className="teams-circuit-badge">🛡️ ESPORTS DIVISION</span>
              <span className="teams-count-badge">{teams.length} Squads Enlisted</span>
            </div>
            <h1 className="teams-banner-title">Competitive Squad Roster</h1>
            <p className="teams-banner-subtitle">
              Browse elite organizations, analyze win ratios, inspect team athlete dossiers, or register your own squad.
            </p>
          </div>

          <div className="teams-banner-ctas">
            <Link to="/register" className="btn btn-primary btn-lg">
              ⚡ Create New Squad
            </Link>
          </div>
        </header>

        {/* Filter and Search Bar */}
        <section className="teams-controls-bar">
          <div className="teams-game-tabs">
            {games.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGame(g)}
                className={`teams-tab-btn ${selectedGame === g ? "active" : ""}`}
              >
                {g === "all" ? "🎮 All Titles" : g}
              </button>
            ))}
          </div>

          <div className="teams-search-wrapper">
            <span className="teams-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by squad name or game..."
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

        {/* Squad Directory Grid */}
        {filteredTeams.length === 0 ? (
          <div className="teams-empty-state">
            <div className="teams-empty-icon">🛡️</div>
            <h3>No Squads Found</h3>
            <p>
              {searchQuery || selectedGame !== "all"
                ? "No squads matched your filter criteria. Try resetting your search."
                : "No squads are currently registered. Step into the arena and create the first team!"}
            </p>
            <Link to="/register" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              ⚡ Create Squad
            </Link>
          </div>
        ) : (
          <div className="teams-cyber-grid">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team._id}
                team={team}
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
        onConfirm={() => handleDeleteTeam(deleteModal.teamId)}
        title="Disband Squad"
        message={`Are you certain you want to permanently disband "${deleteModal.teamName}"? This action cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  );
};

export default TeamList;
