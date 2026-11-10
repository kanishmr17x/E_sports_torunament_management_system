const mongoose = require("mongoose");
const dns = require("dns");

// Ensure reliable SRV DNS resolution for MongoDB Atlas across environments
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
    // Fall back to system DNS
}

// Extract database name from MongoDB URI path if present
const extractDbFromUri = (uri) => {
    try {
        const withoutQuery = (uri || "").split("?")[0];
        const lastSlash = withoutQuery.lastIndexOf("/");
        if (lastSlash !== -1) {
            const candidate = withoutQuery.substring(lastSlash + 1).trim();
            if (candidate && !candidate.includes("@") && !candidate.includes(":")) {
                return candidate;
            }
        }
    } catch (e) {
        // ignore
    }
    return null;
};

// Validate database target according to environment
const resolveTargetDatabase = (env, dbNameEnv, uri) => {
    const uriDb = extractDbFromUri(uri);
    const targetDb = dbNameEnv || uriDb || (env === "production" ? "esports_db_prod" : "esports_db");

    // URI vs DB_NAME conflict check
    if (dbNameEnv && uriDb && dbNameEnv !== uriDb) {
        throw new Error(`CRITICAL: Database conflict between DB_NAME ('${dbNameEnv}') and MONGO_URI path ('${uriDb}'). They must match.`);
    }

    if (env === "production") {
        if (targetDb === "esports_db") {
            throw new Error("CRITICAL: Production cannot use development database 'esports_db'. Please set DB_NAME=esports_db_prod.");
        }
        if (targetDb === "esports_db_test") {
            throw new Error("CRITICAL: Production cannot use test database 'esports_db_test'. Please set DB_NAME=esports_db_prod.");
        }
        if (targetDb !== "esports_db_prod") {
            throw new Error(`CRITICAL: Production database must be 'esports_db_prod', received '${targetDb}'.`);
        }
    } else if (env === "test") {
        if (targetDb === "esports_db_prod") {
            throw new Error("CRITICAL: Test environment must never target production database 'esports_db_prod'.");
        }
    }

    return targetDb;
};

let listenersAttached = false;
const attachListenersOnce = () => {
    if (listenersAttached) return;
    mongoose.connection.on("connected", () => {
        console.log(`✅ MongoDB connected successfully to [${mongoose.connection.name}]`);
    });
    mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err.message);
    });
    mongoose.connection.on("disconnected", () => {
        console.warn("⚠️ MongoDB connection disconnected.");
    });
    listenersAttached = true;
};

let connectionPromise = null;

const doConnect = async (retries, initialDelay) => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI is not configured");
    }

    const targetDbName = resolveTargetDatabase(
        process.env.NODE_ENV || "development",
        process.env.DB_NAME,
        uri
    );

    attachListenersOnce();

    let delay = initialDelay;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const conn = await mongoose.connect(uri, {
                dbName: targetDbName,
                serverSelectionTimeoutMS: 5000,
                bufferCommands: false
            });
            return conn;
        } catch (error) {
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

const connectDB = async (retries = 5, initialDelay = 1000) => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!connectionPromise) {
        connectionPromise = doConnect(retries, initialDelay)
            .then(conn => conn)
            .catch(err => {
                connectionPromise = null;
                throw err;
            });
    }

    return connectionPromise;
};

module.exports = connectDB;
module.exports.resolveTargetDatabase = resolveTargetDatabase;
module.exports.extractDbFromUri = extractDbFromUri;
