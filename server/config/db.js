const mongoose = require("mongoose");
const dns = require("dns");

// Ensure reliable SRV DNS resolution for MongoDB Atlas across environments
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
    // Fall back to system DNS
}

let connectionPromise;

const connectDB = async (retries = 5, initialDelay = 1000) => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    let delay = initialDelay;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            connectionPromise = mongoose.connect(process.env.MONGO_URI, {
                dbName: process.env.DB_NAME || "esports_db",
                serverSelectionTimeoutMS: 5000,
                bufferCommands: false
            });

            const conn = await connectionPromise;
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err.message);
            });
            return conn;
        } catch (error) {
            connectionPromise = undefined;
            if (attempt === retries) {
                console.error(`❌ MongoDB connection failed after ${retries} attempts:`, error.message);
                throw error;
            }
            console.warn(`⚠️ MongoDB connection attempt ${attempt}/${retries} failed. Retrying in ${delay / 1000}s...`);
            await new Promise(res => setTimeout(res, delay));
            delay *= 1.5;
        }
    }
};

module.exports = connectDB;
