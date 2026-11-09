import PropTypes from "prop-types";

/**
 * StatCard — Premium Esports Telemetry Card
 * Displays a multi-level hierarchy: kicker label, large formatted number,
 * trend indicator, icon chip, and an optional visual progress bar.
 */
const StatCard = ({
  label,
  value,
  subtext,
  icon,
  trend,
  trendDirection = "up", // "up" | "down" | "neutral"
  accent = "violet", // "violet" | "cyan" | "gold" | "danger"
  progress = null, // number 0-100 or null
  onClick = null,
  className = ""
}) => {
  const accentClasses = {
    violet: "stat-accent-violet",
    cyan: "stat-accent-cyan",
    gold: "stat-accent-gold",
    danger: "stat-accent-danger"
  };

  return (
    <div
      className={`stat-card-pro ${accentClasses[accent] || "stat-accent-violet"} ${onClick ? "interactive" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="stat-card-top">
        <div className="stat-label-wrap">
          <span className="stat-kicker">{label}</span>
          <div className="stat-value-pro">{value}</div>
        </div>
        {icon && (
          <div className="stat-icon-pro">
            <span>{icon}</span>
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div className="stat-card-bottom">
          {trend && (
            <span className={`stat-trend-tag ${trendDirection}`}>
              {trendDirection === "up" && "▲"}
              {trendDirection === "down" && "▼"}
              {trendDirection === "neutral" && "•"} {trend}
            </span>
          )}
          {subtext && <span className="stat-subtext-pro">{subtext}</span>}
        </div>
      )}

      {progress !== null && (
        <div className="stat-progress-track">
          <div
            className="stat-progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtext: PropTypes.string,
  icon: PropTypes.node,
  trend: PropTypes.string,
  trendDirection: PropTypes.oneOf(["up", "down", "neutral"]),
  accent: PropTypes.oneOf(["violet", "cyan", "gold", "danger"]),
  progress: PropTypes.number,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default StatCard;
