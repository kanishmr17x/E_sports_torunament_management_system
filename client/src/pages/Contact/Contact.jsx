import { useState } from "react";
import api from "../../api/axiosConfig";
import Breadcrumbs from "../../components/Breadcrumbs";
import "../../styles/theme.css";
import "../../styles/contact.css";

const Contact = () => {
  const [form, setForm] = useState({ fullName: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!form.fullName || !form.email || !form.message) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await api.post("/contact", form);
      setSuccess("Your dispatch transmission has been received. Our tournament desk will respond shortly.");
      setForm({ fullName: "", email: "", message: "" });
    } catch (err) {
      setError(err.message || "Failed to deliver message. Check network link.");
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Circuit Support & Dispatch" },
  ];

  return (
    <div className="contact-page-cyber">
      <div className="container">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Editorial Banner */}
        <header className="contact-banner-cyber">
          <div className="contact-banner-glow" />
          <div className="contact-badge-row">
            <span className="contact-circuit-tag">⚡ CIRCUIT DESK</span>
            <span className="contact-status-tag">
              <span className="contact-pulse" /> OPERATIONAL SUPPORT
            </span>
          </div>
          <h1 className="contact-hero-title">Esports Support & Match Inquiries</h1>
          <p className="contact-hero-subtitle">
            Need arbitration for a match dispute, INR prize disbursement verification, or custom Indian tournament licensing? Transmit your query directly to our operations referees (Operating in Indian Standard Time • Asia/Kolkata).
          </p>
        </header>

        {/* Editorial Split Grid */}
        <div className="contact-editorial-grid">
          {/* Left Column: Cyber Dispatch Form */}
          <section className="contact-form-section">
            <div className="contact-card-cyber">
              <div className="contact-card-top">
                <span className="contact-icon-large">📨</span>
                <div>
                  <h3 className="contact-form-heading">Transmit Support Ticket</h3>
                  <p className="contact-form-sub">Direct encrypted transmission to tournament referees.</p>
                </div>
              </div>

              {error && <div className="alert alert-danger" style={{ marginBottom: "1.25rem" }}>⚠️ {error}</div>}
              {success && <div className="alert alert-success" style={{ marginBottom: "1.25rem" }}>✅ {success}</div>}

              <form onSubmit={handleSubmit} className="contact-cyber-form">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">Full Name / Athlete IGN *</label>
                  <input
                    id="fullName"
                    className="form-input"
                    placeholder="e.g. Aarav 'Viper' Sharma (Bengaluru)"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Contact Email Address *</label>
                  <input
                    id="email"
                    className="form-input"
                    type="email"
                    placeholder="aarav.sharma@esports-india.in"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Dispatch Payload / Inquiry Details *</label>
                  <textarea
                    id="message"
                    className="form-textarea"
                    placeholder="Describe tournament ID (e.g. BGMI Invitational, Free Fire India Masters), match number, dispute evidence, or general inquiries in full detail..."
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading}
                >
                  {loading ? "Transmitting..." : "⚡ Transmit Dispatch Ticket"}
                </button>
              </form>
            </div>
          </section>

          {/* Right Column: Support Channels & Telemetry */}
          <aside className="contact-channels-sidebar">
            <div className="contact-channel-card">
              <span className="contact-channel-icon">🛡️</span>
              <div className="contact-channel-info">
                <h4>Match Arbitration & Anti-Cheat</h4>
                <p>Have replay timestamps or suspicious telemetry? Submit game server IDs for forensic analysis.</p>
                <span className="contact-sla-badge">Avg Response: &lt; 15 Mins</span>
              </div>
            </div>

            <div className="contact-channel-card">
              <span className="contact-channel-icon">🏆</span>
              <div className="contact-channel-info">
                <h4>Organizer & Tournament Verification</h4>
                <p>Verify your organization to unlock custom prize pool escrow and featured home banners.</p>
                <span className="contact-sla-badge highlight">Priority Routing</span>
              </div>
            </div>

            <div className="contact-channel-card">
              <span className="contact-channel-icon">💬</span>
              <div className="contact-channel-info">
                <h4>Realtime Voice & Discord Hub</h4>
                <p>Join the 24/7 Discord referee lounge for instant tournament match check-ins and captain briefings.</p>
                <span className="contact-sla-badge">Active Discord Community</span>
              </div>
            </div>

            <div className="contact-security-notice">
              <span className="notice-icon">🔒</span>
              <p>All transmitted inquiries are signed and logged to platform audit records for dispute integrity.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Contact;
