import { Link } from "react-router-dom";
import "../styles/theme.css";

const Unauthorized = () => {
  return (
    <div className="page-root">
      <main
        className="page-main"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "560px",
            width: "100%",
            padding: "0 1rem",
          }}
        >
          {/* Lock icon */}
          <div
            style={{
              width: "clamp(80px, 15vw, 120px)",
              height: "clamp(80px, 15vw, 120px)",
              margin: "0 auto clamp(1.5rem, 4vw, 2.5rem)",
              borderRadius: "50%",
              background: "rgba(255, 59, 59, 0.12)",
              border: "2px solid rgba(255, 59, 59, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              boxShadow: "0 0 40px rgba(255, 59, 59, 0.25)",
            }}
          >
            🔒
          </div>

          {/* Error label */}
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)",
              fontWeight: 700,
              color: "var(--danger)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "clamp(0.5rem, 1.5vw, 0.75rem)",
            }}
          >
            ERROR 403 — ACCESS DENIED
          </p>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
              fontWeight: 900,
              color: "var(--text-primary)",
              lineHeight: 1.1,
              marginBottom: "clamp(1rem, 3vw, 1.5rem)",
            }}
          >
            Admin Access Required
          </h1>

          <p
            style={{
              fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
              color: "var(--text-secondary)",
              lineHeight: 1.65,
              marginBottom: "clamp(2rem, 5vw, 3rem)",
            }}
          >
            This area is restricted to administrators only. If you believe this
            is an error, please contact the system administrator or sign in with
            an admin account.
          </p>

          {/* CTA row */}
          <div
            style={{
              display: "flex",
              gap: "clamp(0.75rem, 2vw, 1rem)",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/" className="btn btn-primary">
              🏠 Return Home
            </Link>
            <Link to="/login" className="btn btn-outline">
              🔑 Login Again
            </Link>
          </div>

          {/* Divider */}
          <div
            style={{
              margin: "clamp(2rem, 5vw, 3rem) auto 0",
              width: "100%",
              maxWidth: "320px",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, var(--glass-border), transparent)",
            }}
          />

          <p
            style={{
              marginTop: "clamp(1rem, 2.5vw, 1.5rem)",
              fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)",
              color: "var(--text-muted)",
            }}
          >
            Need access?{" "}
            <Link
              to="/contact"
              style={{ color: "var(--neon-cyan)", textDecoration: "none" }}
            >
              Contact support →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Unauthorized;
