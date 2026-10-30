import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPaymentById, processPayment } from "../../api/apiRoutes";
import { useAuth } from "../../hooks/useAuth";
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
        loadPayment();
    }, [id]);

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
            setError(err.message || "Failed to load payment");
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (!payment || payment.status === "paid") return;
        
        setError("");
        setSuccess("");
        setProcessing(true);

        try {
            const isTestMode = import.meta.env.DEV && paymentMethod === "test";
            
            if (isTestMode) {
                // Simulate payment processing
                await new Promise(resolve => setTimeout(resolve, 1500));
                await processPayment(id);
                setSuccess("Payment successful! Your team is now registered.");
                setTimeout(() => navigate("/dashboard"), 3000);
            } else {
                await processPayment(id, { paymentMethod });
                setSuccess("Payment processing initiated.");
                setTimeout(() => navigate("/dashboard"), 3000);
            }
        } catch (err) {
            setError(err.message || "Payment failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = () => {
        navigate("/dashboard");
    };

    if (loading) {
        return (
            <div className="payment-page loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (error && !payment) {
        return (
            <div className="payment-page error">
                <div className="error-card">
                    <h2>⚠️ Payment Not Found</h2>
                    <p>{error}</p>
                    <button onClick={handleCancel} className="btn btn-primary">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="payment-page error">
                <div className="error-card">
                    <h2>⚠️ Payment Not Found</h2>
                    <p>This payment no longer exists.</p>
                    <button onClick={handleCancel} className="btn btn-primary">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const isPaid = payment.status === "paid";
    const isPending = payment.status === "pending" || payment.status === "processing";

    return (
        <div className="payment-page">
            <header className="payment-header">
                <div className="header-content">
                    <div>
                        <h1>Payment</h1>
                        <p className="subtitle">Complete your tournament registration</p>
                    </div>
                    <span className={`status-badge ${payment.status}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                </div>
            </header>

            <main className="payment-main">
                <div className="payment-container">
                    <div className="payment-details">
                        <div className="detail-card">
                            <h2>📋 Payment Summary</h2>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Tournament</label>
                                    <span>{payment.tournamentId?.name || "Unknown"}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Team</label>
                                    <span>{payment.teamId?.teamName || "Unknown"}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Transaction ID</label>
                                    <span className="transaction-id">{payment.transactionId}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Payment Method</label>
                                    <span>{payment.paymentMethod?.toUpperCase() || "Test"}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Created</label>
                                    <span>{new Date(payment.createdAt).toLocaleString()}</span>
                                </div>
                                {payment.paidAt && (
                                    <div className="detail-item">
                                        <label>Completed</label>
                                        <span>{new Date(payment.paidAt).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="amount-card">
                            <div className="amount-label">Amount Due</div>
                            <div className="amount-value">${payment.amount}</div>
                            <div className="amount-currency">{payment.currency || "USD"}</div>
                        </div>
                    </div>

                    <div className="payment-action">
                        <div className="action-card">
                            {error && <div className="alert alert-error">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            {isPaid ? (
                                <div className="paid-state">
                                    <div className="paid-icon">✅</div>
                                    <h2>Payment Completed</h2>
                                    <p>Your registration is confirmed. Your team is now officially registered for the tournament.</p>
                                    <div className="paid-details">
                                        <p><strong>Transaction ID:</strong> {payment.transactionId}</p>
                                        <p><strong>Completed:</strong> {payment.paidAt ? new Date(payment.paidAt).toLocaleString() : "N/A"}</p>
                                    </div>
                                    <button onClick={handleCancel} className="btn btn-primary btn-block">
                                        Back to Dashboard
                                    </button>
                                </div>
                            ) : isPending ? (
                                <div className="pending-state">
                                    <div className="pending-icon">⏳</div>
                                    <h2>Payment Pending</h2>
                                    <p>Your payment is being processed. Please wait...</p>
                                    {payment.gatewayResponse?.test && (
                                        <div className="test-mode-notice">
                                            🧪 Test Mode: Click "Complete Payment" to simulate successful payment
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="payment-form">
                                    <h2>Complete Payment</h2>
                                    <p>Select your payment method and click below to proceed.</p>
                                    
                                    <div className="payment-methods">
                                        <label className={`payment-method ${paymentMethod === "test" ? "selected" : ""}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="test"
                                                checked={paymentMethod === "test"}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <div className="method-info">
                                                <span className="method-name">Test Payment (Development)</span>
                                                <span className="method-desc">Simulates successful payment for testing</span>
                                            </div>
                                            <span className="radio-custom"></span>
                                        </label>
                                        
                                        <label className={`payment-method ${paymentMethod === "stripe" ? "selected" : ""}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="stripe"
                                                checked={paymentMethod === "stripe"}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <div className="method-info">
                                                <span className="method-name">Stripe</span>
                                                <span className="method-desc">Credit/Debit Card, Apple Pay, Google Pay</span>
                                            </div>
                                            <span className="radio-custom"></span>
                                        </label>
                                        
                                        <label className={`payment-method ${paymentMethod === "razorpay" ? "selected" : ""}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="razorpay"
                                                checked={paymentMethod === "razorpay"}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <div className="method-info">
                                                <span className="method-name">Razorpay</span>
                                                <span className="method-desc">UPI, Cards, Net Banking, Wallets</span>
                                            </div>
                                            <span className="radio-custom"></span>
                                        </label>
                                    </div>

                                    <button
                                        onClick={handlePay}
                                        disabled={processing}
                                        className="btn btn-primary btn-block pay-btn"
                                    >
                                        {processing ? "Processing..." : `Pay $${payment.amount}`}
                                    </button>
                                </div>
                            )}

                            <button onClick={handleCancel} className="btn btn-outline btn-block cancel-btn">
                                Cancel & Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Payment;