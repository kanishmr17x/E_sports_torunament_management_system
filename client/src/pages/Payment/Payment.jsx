import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPaymentById, processPayment } from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
import Breadcrumbs from "../../components/Breadcrumbs";
import { formatINR } from "../../utils/formatters";
import "../../styles/theme.css";
import "../../styles/payment.css";

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("test");

  useEffect(() => {
    const loadPayment = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const res = await getPaymentById(id);
        setPayment(res);
      } catch (err) {
        setError(err.message || "Failed to load payment invoice");
      } finally {
        setLoading(false);
      }
    };
    loadPayment();
  }, [id, user, navigate]);

  const handlePay = async () => {
    if (!payment || payment.status === "paid") return;
    
    setError("");
    setSuccess("");
    setProcessing(true);

    try {
      const isTestMode = import.meta.env.DEV && paymentMethod === "test";
      
      if (isTestMode) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        await processPayment(id);
        setSuccess("Payment verified! Your squad is confirmed in the championship bracket.");
        setTimeout(() => navigate("/dashboard"), 2500);
      } else {
        await processPayment(id, { paymentMethod });
        setSuccess("Payment processing initiated with payment gateway.");
        setTimeout(() => navigate("/dashboard"), 2500);
      }
    } catch (err) {
      setError(err.message || "Payment transaction could not be completed.");
    } finally {
      setProcessing(false);
    }
  };

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Invoice Checkout" },
  ];

  if (loading) {
    return (
      <div className="payment-page-cyber">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div className="admin-spinner" style={{ margin: "0 auto 1.5rem" }} />
          <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Initializing Secure Payment Terminal...</h3>
          <p style={{ color: "var(--text-secondary)" }}>Accessing tournament entry invoice and ledger state.</p>
        </div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="payment-page-cyber">
        <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>Invoice Not Found</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            {error || `Payment invoice with ID [${id}] does not exist.`}
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = payment?.status === "paid";
  const amount = payment?.amount || 0;
  const tournamentName = payment?.tournamentId?.name || "Competitive Esports Tournament";
  const game = payment?.tournamentId?.game || "BGMI";
  const teamName = payment?.teamId?.name || payment?.teamName || "Registered Squad";

  return (
    <div className="payment-page-cyber">
      <div className="container">
        <Breadcrumbs items={breadcrumbs} />

        {/* Terminal Header */}
        <header className="payment-banner-cyber">
          <div className="payment-badge-row">
            <span className="payment-secure-badge">🔒 256-BIT ENCRYPTED</span>
            <span className={`payment-status-pill ${payment?.status || "pending"}`}>
              STATUS: {payment?.status?.toUpperCase() || "PENDING INVOICE"}
            </span>
          </div>
          <h1 className="payment-hero-title">Tournament Entry Fee Settlement</h1>
          <p className="payment-hero-subtitle">
            Confirm your squad slot reservation by settling the certified entry fee.
          </p>
        </header>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
            ✅ {success}
          </div>
        )}

        {/* 2-Column Asymmetric Checkout Grid */}
        <div className="payment-terminal-grid">
          {/* Left Column: Order Invoice & Roster Dossier */}
          <section className="payment-invoice-card">
            <div className="payment-card-header">
              <span className="payment-card-icon">📄</span>
              <div>
                <h3 className="payment-section-heading">Circuit Entry Invoice</h3>
                <span className="payment-invoice-ref">REF: {id}</span>
              </div>
            </div>

            <div className="invoice-specs-block">
              <div className="invoice-spec-item">
                <span className="invoice-lbl">Tournament Title</span>
                <span className="invoice-val">{tournamentName}</span>
              </div>
              <div className="invoice-spec-item">
                <span className="invoice-lbl">Game Discipline</span>
                <span className="invoice-val">🎮 {game}</span>
              </div>
              <div className="invoice-spec-item">
                <span className="invoice-lbl">Fielded Squad</span>
                <span className="invoice-val highlight-squad">🛡️ {teamName}</span>
              </div>
              <div className="invoice-spec-item">
                <span className="invoice-lbl">Registered Athlete</span>
                <span className="invoice-val">👤 {user?.username}</span>
              </div>
            </div>

            <div className="invoice-breakdown-list">
              <div className="invoice-row">
                <span>Base Tournament Entry Fee</span>
                <span className="invoice-num">{formatINR(amount)}</span>
              </div>
              <div className="invoice-row">
                <span>Automated Referee Telemetry</span>
                <span className="invoice-num-free">INCLUDED</span>
              </div>
              <div className="invoice-row">
                <span>Anti-Cheat Forensics Monitoring</span>
                <span className="invoice-num-free">INCLUDED</span>
              </div>
              <div className="invoice-total-row">
                <span>Total Due Now</span>
                <span className="invoice-total-amount">{formatINR(amount)}</span>
              </div>
            </div>
          </section>

          {/* Right Column: Payment Method & Execution Terminal */}
          <aside className="payment-processor-card">
            <h3 className="payment-processor-heading">Select Settlement Method</h3>

            {isPaid ? (
              <div className="payment-settled-box">
                <span className="settled-icon">✅</span>
                <h4>Invoice Settled</h4>
                <p>This tournament entry invoice has already been verified and confirmed.</p>
                <Link to="/dashboard" className="btn btn-primary btn-full" style={{ marginTop: "1rem" }}>
                  Go to Player Dashboard →
                </Link>
              </div>
            ) : (
              <div className="payment-action-flow">
                <div className="payment-methods-stack">
                  <label className={`method-tile ${paymentMethod === "test" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="method"
                      value="test"
                      checked={paymentMethod === "test"}
                      onChange={() => setPaymentMethod("test")}
                    />
                    <div className="method-tile-content">
                      <div className="method-name">⚡ Developer Instant Sandbox</div>
                      <div className="method-sub">Instant zero-risk settlement for test tournaments</div>
                    </div>
                  </label>

                  <label className={`method-tile ${paymentMethod === "card" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="method"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                    />
                    <div className="method-tile-content">
                      <div className="method-name">💳 Credit / Debit Card</div>
                      <div className="method-sub">RuPay, Visa, MasterCard</div>
                    </div>
                  </label>

                  <label className={`method-tile ${paymentMethod === "upi" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="method"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                    />
                    <div className="method-tile-content">
                      <div className="method-name">📱 UPI / Instant Transfer</div>
                      <div className="method-sub">Google Pay, PhonePe, Paytm, BHIM UPI QR</div>
                    </div>
                  </label>
                </div>

                <div className="payment-cta-block">
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={processing}
                    className="btn btn-primary btn-full btn-lg"
                  >
                    {processing ? "Authorizing Settlement..." : `⚡ Pay ${formatINR(amount)} (INR)`}
                  </button>
                  <Link to="/dashboard" className="btn btn-outline btn-full btn-sm" style={{ marginTop: "0.5rem" }}>
                    Cancel & Return to Dashboard
                  </Link>
                </div>

                <div className="payment-security-footer">
                  <span>🔒 PCI-DSS Certified &bull; SSL Secured</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Payment;
