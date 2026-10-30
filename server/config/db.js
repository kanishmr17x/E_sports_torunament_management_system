const mongoose = require("mongoose");
const dns = require("dns");

// Ensure reliable SRV DNS resolution for MongoDB Atlas across environments
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
    // Fall back to system DNS
}

let connectionPromise;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
        dbName: "esportsdb"
    })
        .then(() => {
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err.message);
            });
            return mongoose.connection;
        })
        .catch((error) => {
            connectionPromise = undefined;
            throw error;
        });

    try {
        return await connectionPromise;
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;
