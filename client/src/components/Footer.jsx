import "../styles/theme.css";

const Footer = () => {
  return (
    <footer className="footer-root">
      <div className="container footer-grid">
        <div>
          <div className="brand" style={{ display: "inline-block", marginBottom: 8 }}>
            <span className="brand-accent">E</span>-Sports
          </div>
          <p className="footer-sub">Compete. Win. Repeat.</p>
        </div>
        <div>
          <p className="footer-sub">© 2026 E-Sports Tournament Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
