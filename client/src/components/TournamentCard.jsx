import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatINR, formatDateIST } from "../utils/formatters";

/**
 * TournamentCard — Multi-variant Esports Tournament Card
 * Variants:
 *  - "featured": Heroic spotlight card with prominent prize pool, game artwork, slot meter, and dual CTAs
 *  - "compact": Dense tactical card for tournament grids and directories
 *  - "horizontal": Row-oriented card for player dashboards and match hubs
 */
const TournamentCard = ({
  tournament,
  variant = "compact",
  isAdmin = false,
  onDelete = null,
  className = ""
}) => {
  if (!tournament) return null;

  const {
    _id,
    name,
    game = "Esports",
    prizePool,
    status = "upcoming",
    type = "team",
    maxTeams = 16,
    registeredTeams = 0,
    startDate,
    endDate,
    description
  } = tournament;

  // Calculate registration progress
  const slotsFilled = typeof registeredTeams === "number" ? registeredTeams : (Array.isArray(registeredTeams) ? registeredTeams.length : 0);
  const slotsPercentage = Math.min(100, Math.round((slotsFilled / (maxTeams || 16)) * 100));

  // Game badge icon/color mapping
  const getGameIcon = (g = "") => {
    const lower = g.toLowerCase();
    if (lower.includes("val")) return "🛡️";
    if (lower.includes("bgmi") || lower.includes("pubg") || lower.includes("battleground")) return "🔫";
    if (lower.includes("fire")) return "🔥";
    if (lower.includes("cs") || lower.includes("counter")) return "💣";
    if (lower.includes("cod") || lower.includes("call")) return "⚔️";
    if (lower.includes("apex")) return "🎯";
    return "🎮";
  };

  // Status mapping
  const normalizedStatus = (status || "upcoming").toLowerCase().replace("_", " ");
  const isLive = normalizedStatus.includes("live") || normalizedStatus.includes("ongoing");
  const isOpen = normalizedStatus.includes("open");

  const formattedDate = formatDateIST(startDate);

  // ==========================================
  // VARIANT: FEATURED SPOTLIGHT CARD
  // ==========================================
  if (variant === "featured") {
    return (
      <article className={`tcard-featured ${className}`}>
        <div className="tcard-featured-glow" />
        <div className="tcard-featured-body">
          <div className="tcard-top-row">
            <div className="tcard-badge-group">
              <span className="tcard-game-chip">
                {getGameIcon(game)} {game}
              </span>
              <span className="tcard-format-chip">
                {type?.toUpperCase() || "TEAM"}
              </span>
            </div>
            <span className={`tcard-status-chip ${isLive ? "live" : isOpen ? "open" : "upcoming"}`}>
              {isLive && <span className="live-dot-pulse" />}
              {isOpen ? "REGISTRATION OPEN" : isLive ? "LIVE NOW" : normalizedStatus.toUpperCase()}
            </span>
          </div>

          <h3 className="tcard-featured-title">
            <Link to={`/tournaments/${_id}`}>{name}</Link>
          </h3>

          {description && (
            <p className="tcard-featured-desc">{description}</p>
          )}

          <div className="tcard-featured-metrics">
            <div className="tcard-metric-item">
              <span className="metric-lbl">TOTAL PRIZE POOL</span>
              <div className="metric-val prize">
                {formatINR(prizePool, { fallback: "Ranked" })}
              </div>
            </div>

            <div className="tcard-metric-item">
              <span className="metric-lbl">SQUAD SLOTS</span>
              <div className="metric-val">
                {slotsFilled} <span className="val-max">/ {maxTeams}</span>
              </div>
            </div>

            <div className="tcard-metric-item">
              <span className="metric-lbl">START SCHEDULE</span>
              <div className="metric-val date">
                📅 {formattedDate}
              </div>
            </div>
          </div>

          <div className="tcard-slots-bar-wrap">
            <div className="slots-header">
              <span>Bracket Capacity</span>
              <span className="slots-pct">{slotsPercentage}% Filled</span>
            </div>
            <div className="slots-track">
              <div className="slots-fill" style={{ width: `${slotsPercentage}%` }} />
            </div>
          </div>

          <div className="tcard-actions-row">
            <Link to={`/tournaments/${_id}`} className="btn btn-primary tcard-btn-main">
              View Arena Details
            </Link>
            <Link to={`/bracket?tournament=${_id}`} className="btn btn-outline tcard-btn-sec">
              Brackets
            </Link>
            {isAdmin && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(_id, name)}
                className="btn btn-danger btn-sm tcard-btn-del"
                title="Delete Tournament"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  // ==========================================
  // VARIANT: HORIZONTAL ROW CARD (Dashboard / List)
  // ==========================================
  if (variant === "horizontal") {
    return (
      <article className={`tcard-horizontal ${className}`}>
        <div className="tcard-h-game-col">
          <span className="tcard-game-icon-large">{getGameIcon(game)}</span>
          <span className="tcard-game-name">{game}</span>
        </div>

        <div className="tcard-h-main-col">
          <div className="tcard-h-header">
            <h4 className="tcard-h-title">
              <Link to={`/tournaments/${_id}`}>{name}</Link>
            </h4>
            <span className={`tcard-status-chip ${isLive ? "live" : isOpen ? "open" : "upcoming"}`}>
              {isLive && <span className="live-dot-pulse" />}
              {normalizedStatus.toUpperCase()}
            </span>
          </div>

          <div className="tcard-h-meta">
            <span>🏆 {formatINR(prizePool, { fallback: "Ranked" })}</span>
            <span>👥 {slotsFilled}/{maxTeams} Teams</span>
            <span>📅 {formattedDate}</span>
          </div>
        </div>

        <div className="tcard-h-action-col">
          <Link to={`/tournaments/${_id}`} className="btn btn-outline btn-sm">
            Arena Details
          </Link>
          <Link to={`/bracket?tournament=${_id}`} className="btn btn-primary btn-sm">
            Bracket
          </Link>
        </div>
      </article>
    );
  }

  // ==========================================
  // VARIANT: COMPACT TACTICAL CARD (Standard Grid)
  // ==========================================
  return (
    <article className={`tcard-compact ${className}`}>
      <div className="tcard-top-bar">
        <span className="tcard-game-chip">
          {getGameIcon(game)} {game}
        </span>
        <span className={`tcard-status-chip ${isLive ? "live" : isOpen ? "open" : "upcoming"}`}>
          {isLive && <span className="live-dot-pulse" />}
          {isOpen ? "OPEN" : isLive ? "LIVE" : normalizedStatus.toUpperCase()}
        </span>
      </div>

      <div className="tcard-banner-strip">
        <div className="tcard-prize-callout">
          <span className="prize-kicker">PRIZE POOL</span>
          <span className="prize-sum">
            {formatINR(prizePool, { fallback: "Ranked" })}
          </span>
        </div>
        <span className="tcard-format-tag">{type}</span>
      </div>

      <div className="tcard-compact-content">
        <h3 className="tcard-compact-title">
          <Link to={`/tournaments/${_id}`} title={name}>{name}</Link>
        </h3>

        <div className="tcard-slots-bar-wrap">
          <div className="slots-header">
            <span>Teams: {slotsFilled}/{maxTeams}</span>
            <span className="slots-pct">{slotsPercentage}%</span>
          </div>
          <div className="slots-track">
            <div className="slots-fill" style={{ width: `${slotsPercentage}%` }} />
          </div>
        </div>

        <div className="tcard-compact-footer">
          <span className="tcard-date">📅 {formattedDate}</span>
          {endDate && (
            <span className="tcard-date-end">→ {formatDateIST(endDate)}</span>
          )}
        </div>

        <div className="tcard-actions-row">
          <Link to={`/tournaments/${_id}`} className="tcard-btn-primary">
            Details
          </Link>
          <Link to={`/bracket?tournament=${_id}`} className="tcard-btn-secondary">
            Bracket
          </Link>
          {isAdmin && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(_id, name)}
              className="tcard-btn-danger"
              title="Delete tournament"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

TournamentCard.propTypes = {
  tournament: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(["featured", "compact", "horizontal"]),
  isAdmin: PropTypes.bool,
  onDelete: PropTypes.func,
  className: PropTypes.string
};

export default TournamentCard;
