const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { centralizedErrorHandler } = require("./middleware/centralizedErrorHandler");

// Load environment variables
dotenv.config();

// Connect to MongoDB (non-blocking so the app can start for model registration)
connectDB().catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
});

// Initialize app
const app = express();

// Trust proxy (required behind Vercel / reverse proxies for correct req.ip & HTTPS)
app.set("trust proxy", 1);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS: allow the configured frontend origin(s). Same-origin requests on Vercel
// do not require CORS, but this keeps local dev and split deploys working.
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Allow requests with no origin (curl, same-origin, mobile apps)
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/players", require("./routes/playerRoutes"));
app.use("/api/tournaments", require("./routes/tournamentRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));
app.use("/api/admin/users", require("./routes/adminUserRoutes"));
app.use("/api/admin/registrations", require("./routes/adminRegistrationRoutes"));

// Root test route
app.get("/", (req, res) => {
    res.json({
        message: "E-Sports Tournament API is running...",
        version: "1.0.0",
        status: "healthy",
    });
});

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is healthy",
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
    });
});

// Centralized error handler (must be last)
app.use(centralizedErrorHandler);

module.exports = app;