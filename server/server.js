const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");
const { validateEnvironment } = require("./utils/validateEnv");

const PORT = process.env.PORT || 5000;

// Local development server entry point.
// On Vercel this file is not used — the app is exported from app.js and
// invoked as a serverless function via api/index.js.
const startServer = async () => {
    try {
        validateEnvironment();
        await connectDB();
        const server = app.listen(PORT, () => {
            console.log(`🚀 E-Sports API running on http://localhost:${PORT}`);
            console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`👉 Database: Connected to ${mongoose.connection.name || 'database'}`);
        });

        // Graceful shutdown
        const shutdown = () => {
            server.close(async () => {
                try {
                    await mongoose.connection.close(false);
                } catch (e) {
                    // ignore
                }
                process.exit(0);
            });
            setTimeout(() => process.exit(1), 10000).unref();
        };

        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);

        return server;
    } catch (err) {
        console.error("❌ Failed to start server due to startup error:", err.message);
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
