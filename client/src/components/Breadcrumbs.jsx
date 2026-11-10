import PropTypes from "prop-types";
import { Link } from "react-router-dom";

/**
 * Breadcrumbs — Tactical Esports Navigation Trail
 * items: Array of { label: string, to?: string }
 */
const Breadcrumbs = ({ items = [], className = "" }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`breadcrumbs-nav ${className}`} aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link home-link">
            ⚡ Arena
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className={`breadcrumb-item ${isLast ? "active" : ""}`}>
              <span className="breadcrumb-separator">/</span>
              {isLast || !item.to ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="breadcrumb-link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string
    })
  ).isRequired,
  className: PropTypes.string
};

export default Breadcrumbs;
