const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");
const { centralizedErrorHandler } = require("./middleware/centralizedErrorHandler");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().catch(err => {
  console.error("❌ Failed to connect to database:", err);
  process.exit(1);
});

// Initialize app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // body parser with increased limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // form data parser
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan("dev"));

// Request logging middleware (removed - redundant with morgan)

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/players", require("./routes/playerRoutes"));
app.use("/api/tournaments", require("./routes/tournamentRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

// Root test route
app.get("/", (req, res) => {
    res.json({ 
        message: "E-Sports Tournament API is running...",
        version: "1.0.0",
        status: "healthy"
    });
});

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is healthy"
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Error Handler (must be last)
app.use(centralizedErrorHandler);

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
