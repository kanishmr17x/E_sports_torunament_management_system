import { useState } from "react";
import api from "../../api/axiosConfig";
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
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await api.post("/contact", form);
      setSuccess("Message sent successfully! We'll get back to you soon.");
      setForm({ fullName: "", email: "", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="contact-banner">
        <div className="contact-banner-overlay">
          <h1 className="contact-banner-title">📬 Contact</h1>
          <p className="contact-banner-subtitle">Questions or feedback? Send us a message and we&apos;ll get back soon.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-card">
          <form onSubmit={handleSubmit} className="contact-form">
            <h2 className="contact-form-title">Contact Support</h2>
            
            {error && <div className="contact-alert contact-error">{error}</div>}
            {success && <div className="contact-alert contact-success">{success}</div>}
            
            <div className="contact-field">
              <label htmlFor="fullName" className="contact-label">Full Name</label>
              <input
                id="fullName"
                className="contact-input"
                placeholder="John Doe"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
            
            <div className="contact-field">
              <label htmlFor="email" className="contact-label">Email</label>
              <input
                id="email"
                className="contact-input"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            
            <div className="contact-field">
              <label htmlFor="message" className="contact-label">Message</label>
              <textarea
                id="message"
                className="contact-textarea"
                placeholder="Your message here..."
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            
            <button type="submit" className={`contact-submit ${loading ? 'contact-loading' : ''}`} disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <div className="contact-info">
          <div className="contact-info-card">
            <div className="contact-info-icon">🎮</div>
            <h3 className="contact-info-title">Gaming Support</h3>
            <p className="contact-info-text">Get help with tournaments, teams, and matchmaking</p>
          </div>
          
          <div className="contact-info-card">
            <div className="contact-info-icon">💬</div>
            <h3 className="contact-info-title">Community</h3>
            <p className="contact-info-text">Join our Discord community for instant support</p>
          </div>
          
          <div className="contact-info-card">
            <div className="contact-info-icon">🚀</div>
            <h3 className="contact-info-title">Technical Help</h3>
            <p className="contact-info-text">Report bugs and technical issues</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
