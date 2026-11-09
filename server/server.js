const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Local development server entry point.
// On Vercel this file is not used — the app is exported from app.js and
// invoked as a serverless function via api/index.js.
const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            console.log(`🚀 E-Sports API running on http://localhost:${PORT}`);
            console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`👉 Database: Connected to esports_db`);
        });

        // Graceful shutdown
        const shutdown = () => {
            server.close(() => process.exit(0));
            setTimeout(() => process.exit(1), 10000).unref();
        };

        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);

        return server;
    } catch (err) {
        console.error("❌ Failed to start server due to database connection error:", err.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

startServer();
