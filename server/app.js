const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const { centralizedErrorHandler } = require("./middleware/centralizedErrorHandler");

// Load environment variables
dotenv.config();

// Connect to MongoDB (non-blocking for startup)
connectDB().catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
});

// Initialize app
const app = express();

// Trust proxy (required behind Vercel / reverse proxies for correct req.ip & HTTPS)
app.set("trust proxy", 1);

// HTTP security headers
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.removeHeader("X-Powered-By");
    next();
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS: allow configured frontend origins
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Allow requests with no origin (curl, same-origin, mobile apps) or Vercel deployments
            if (!origin || allowedOrigins.indexOf(origin) !== -1 || (typeof origin === "string" && origin.includes("vercel.app"))) {
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

// Health check handler (liveness probe)
const healthHandler = (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    res.status(isConnected ? 200 : 503).json({
        success: isConnected,
        message: isConnected ? "API is healthy" : "Database disconnected",
        timestamp: new Date().toISOString(),
        database: isConnected ? "connected" : "disconnected",
        dbName: mongoose.connection.name || null
    });
};
app.get("/api/health", healthHandler);
app.get("/health", healthHandler);

// Readiness probe (traffic readiness)
const readyHandler = (req, res) => {
    const isReady = mongoose.connection.readyState === 1;
    res.status(isReady ? 200 : 503).json({
        ready: isReady,
        database: isReady ? "connected" : "disconnected",
        dbName: mongoose.connection.name || null
    });
};
app.get("/api/ready", readyHandler);
app.get("/ready", readyHandler);

// Root info route
app.get("/", (req, res) => {
    res.json({
        message: "E-Sports Tournament API is running...",
        version: "1.0.0",
        status: "healthy",
    });
});

// Database connection assurance middleware: ensure database is ready before accepting API requests
app.use(async (req, res, next) => {
    // Health, readiness, and root info endpoints can report status without waiting
    if (
        req.path === "/api/health" || req.path === "/health" ||
        req.path === "/api/ready" || req.path === "/ready" ||
        req.path === "/"
    ) {
        return next();
    }

    if (mongoose.connection.readyState !== 1) {
        try {
            await connectDB();
        } catch (err) {
            return res.status(503).json({
                success: false,
                error: "Database connection unavailable. Please try again shortly."
            });
        }
    }
    next();
});

// API Routers
const apiRouter = express.Router();
apiRouter.use("/auth", require("./routes/authRoutes"));
apiRouter.use("/teams", require("./routes/teamRoutes"));
apiRouter.use("/players", require("./routes/playerRoutes"));
apiRouter.use("/tournaments", require("./routes/tournamentRoutes"));
apiRouter.use("/registrations", require("./routes/registrationRoutes"));
apiRouter.use("/contact", require("./routes/contactRoutes"));
apiRouter.use("/matches", require("./routes/matchRoutes"));
apiRouter.use("/payments", require("./routes/paymentRoutes"));
apiRouter.use("/notifications", require("./routes/notificationRoutes"));
apiRouter.use("/leaderboard", require("./routes/leaderboardRoutes"));
apiRouter.use("/admin/users", require("./routes/adminUserRoutes"));
apiRouter.use("/admin/registrations", require("./routes/adminRegistrationRoutes"));

// Mount at both /api and root to support standard and rewritten paths on Vercel
app.use("/api", apiRouter);
app.use("/", apiRouter);

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
