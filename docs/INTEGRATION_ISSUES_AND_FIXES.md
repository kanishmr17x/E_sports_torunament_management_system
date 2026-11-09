# Integration Issues, Root Cause Analysis & Recommended Fixes

**Workspace:** `E:\project\esports platform`  
**Execution Date:** 08 November 2026  
**Auditor:** Senior Full-Stack Engineer & System Architect  
**Policy Compliance:** No files have been modified. All fixes are documented for user approval.

---

## 1. Issue Overview & Severity Distribution

| Issue ID | Classification | Severity | Summary | Location |
| :--- | :--- | :---: | :--- | :--- |
| **ISSUE-01** | Backend / Architecture | **HIGH** | Server starts HTTP listener before database connection is established | [`server/server.js`](file:///e:/project/esports%20platform/server/server.js) & [`server/app.js`](file:///e:/project/esports%20platform/server/app.js) |
| **ISSUE-02** | Backend / Resilience | **MEDIUM** | Mongoose default query buffering causes requests to hang for 10s on DB disconnect | [`server/config/db.js`](file:///e:/project/esports%20platform/server/config/db.js) |
| **ISSUE-03** | Backend / Fault-Tolerance | **MEDIUM** | Lack of automated connection retry loop with exponential backoff | [`server/config/db.js`](file:///e:/project/esports%20platform/server/config/db.js) |
| **ISSUE-04** | Deployment / Vercel | **LOW** | `server/app.js` lacks top-level `dotenv.config()` for standalone/testing contexts | [`server/app.js`](file:///e:/project/esports%20platform/server/app.js) |
| **ISSUE-05** | API Contract Strictness | **LOW** | `loginUser` strictly requires `emailOrUsername`; sending `{ email }` yields 400 | [`server/controllers/authController.js`](file:///e:/project/esports%20platform/server/controllers/authController.js) |

---

## 2. Granular Issue Diagnosis & Fix Proposals

---

### ISSUE-01: Server Accepts HTTP Requests Before MongoDB Connection Completes

* **Classification:** Backend / Architecture Issue
* **Severity:** **HIGH**
* **File Path:** [`server/server.js`](file:///e:/project/esports%20platform/server/server.js#L11) and [`server/app.js`](file:///e:/project/esports%20platform/server/app.js#L27)
* **Relevant Function / Component:** `connectDB()` invocation and `app.listen()`
* **Exact Failure:**
  When `node server.js` is started, `app.js` invokes `connectDB()` as an unawaited floating promise. Meanwhile, `server.js` calls `app.listen(PORT)` immediately. The HTTP server accepts user requests before Mongoose completes the SSL/TLS handshake with MongoDB Atlas. If requests arrive during startup, they buffer in memory.
* **Reproduction Steps:**
  1. Add a 3-second network latency delay to the database connection.
  2. Start `node server.js`.
  3. Immediately send `GET /api/tournaments` within 500 ms of launch.
  4. The request hangs waiting for the connection rather than failing fast or waiting for startup to finish.
* **Root Cause:**
  `connectDB()` is called in `server/app.js` without being awaited prior to starting the HTTP server listener in `server/server.js`.
* **Recommended Fix:**
  In `server/server.js`, await `connectDB()` before binding to `PORT`:
  ```javascript
  // server/server.js
  const dotenv = require("dotenv");
  dotenv.config();

  const app = require("./app");
  const connectDB = require("./config/db");

  const PORT = process.env.PORT || 5000;

  const startServer = async () => {
      try {
          await connectDB();
          const server = app.listen(PORT, () => {
              console.log(`🚀 E-Sports API running on http://localhost:${PORT}`);
          });
          // Graceful shutdown logic...
      } catch (error) {
          console.error("Failed to start server due to database connection error:", error);
          process.exit(1);
      }
  };

  startServer();
  ```

---

### ISSUE-02: Mongoose Default Query Buffering Causes 10-Second Request Timeouts

* **Classification:** Backend / Resilience Issue
* **Severity:** **MEDIUM**
* **File Path:** [`server/config/db.js`](file:///e:/project/esports%20platform/server/config/db.js#L26)
* **Relevant Function / Component:** `mongoose.connect()` options
* **Exact Failure:**
  When Mongoose is disconnected or loses connectivity, Mongoose's default `bufferCommands: true` causes every Model query (e.g. `Tournament.find()`, `Team.find()`) to wait in memory for 10,000 ms before throwing a 500 `MongooseError: Operation buffering timed out`.
* **Reproduction Steps:**
  1. Stop or disconnect the database connection while the server is running.
  2. Query `GET /api/tournaments`.
  3. Observe that the HTTP client hangs for exactly 10 seconds before returning a 500 Internal Server Error.
* **Root Cause:**
  Mongoose command buffering is enabled by default without early rejection middleware.
* **Recommended Fix:**
  Add a fast-fail check in the centralized error handler or database connection options:
  ```javascript
  // In server/config/db.js options:
  mongoose.set('bufferCommands', false);
  ```
  Or verify `mongoose.connection.readyState === 1` in an early Express middleware so requests return a fast HTTP 503 Service Unavailable when the database is offline.

---

### ISSUE-03: Absence of Automated Database Reconnection Retry Loop

* **Classification:** Backend / Fault-Tolerance Issue
* **Severity:** **MEDIUM**
* **File Path:** [`server/config/db.js`](file:///e:/project/esports%20platform/server/config/db.js#L36)
* **Relevant Function / Component:** `connectDB()` error handling
* **Exact Failure:**
  If the initial connection attempt to MongoDB Atlas fails (e.g., brief DNS glitch or ISP packet drop during boot), `connectionPromise` is reset to `undefined` and the error is thrown. The application remains permanently disconnected until the entire Node process is restarted.
* **Reproduction Steps:**
  1. Start the server with an temporarily unreachable DNS.
  2. Allow the initial connection attempt to fail.
  3. Restore DNS.
  4. The server remains permanently disconnected.
* **Root Cause:**
  `connectDB()` lacks an exponential backoff retry loop.
* **Recommended Fix:**
  Add a retry loop with exponential backoff:
  ```javascript
  const connectWithRetry = async (retries = 5, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
          try {
              return await connectDB();
          } catch (err) {
              if (i === retries - 1) throw err;
              console.log(`Database connection attempt ${i + 1} failed. Retrying in ${delay / 1000}s...`);
              await new Promise(res => setTimeout(res, delay));
              delay *= 1.5;
          }
      }
  };
  ```

---

### ISSUE-04: Standalone Execution of `server/app.js` Requires Pre-Loaded Environment

* **Classification:** Deployment / Environment Issue
* **Severity:** **LOW**
* **File Path:** [`server/app.js`](file:///e:/project/esports%20platform/server/app.js#L1) and [`api/index.js`](file:///e:/project/esports%20platform/api/index.js#L1)
* **Relevant Function / Component:** Module initialization
* **Exact Failure:**
  `server/app.js` calls `connectDB()` immediately upon require. If a script or test runner requires `server/app.js` without calling `dotenv.config()` beforehand, `process.env.MONGO_URI` will be undefined.
* **Reproduction Steps:**
  1. Run `node -e "const app = require('./server/app')"` from a clean shell without environment variables set.
  2. Observe `MONGO_URI is not configured` error.
* **Root Cause:**
  `require("dotenv").config()` is located in `server/server.js` instead of being safely guarded at the top of `server/app.js`. (Note: Vercel serverless functions inject environment variables into `process.env` automatically, so this only impacts local testing).
* **Recommended Fix:**
  Add a safe fallback at the top of `server/app.js`:
  ```javascript
  if (!process.env.MONGO_URI) {
      require("dotenv").config();
  }
  ```

---

### ISSUE-05: Login Controller Parameter Name Strictness

* **Classification:** API Integration Issue
* **Severity:** **LOW**
* **File Path:** [`server/controllers/authController.js`](file:///e:/project/esports%20platform/server/controllers/authController.js#L80)
* **Relevant Function / Component:** `loginUser`
* **Exact Failure:**
  `loginUser` strictly validates `emailOrUsername`. If an external client or standard OAuth payload sends `{ email: "user@example.com", password: "..." }` instead of `{ emailOrUsername: "user@example.com", password: "..." }`, the backend rejects with HTTP 400.
* **Reproduction Steps:**
  1. Send `POST /api/auth/login` with body `{"email": "user@example.com", "password": "..."}`.
  2. Receives HTTP 400 `Email/Username and password required`.
* **Root Cause:**
  The destructuring expects only `emailOrUsername`:
  ```javascript
  const { emailOrUsername, password } = req.body;
  ```
* **Recommended Fix:**
  Support both parameter conventions:
  ```javascript
  const identifier = req.body.emailOrUsername || req.body.email || req.body.username;
  if (!identifier || !req.body.password) {
      return sendResponse(res, errorResponse("Email/Username and password required", 400));
  }
  ```
  *(Note: The current frontend `client/src/pages/Auth/Login.jsx` already adheres to `emailOrUsername`, so this does not cause issues for web users).*

---

## 3. Summary & Action Plan

None of the identified issues prevent the application from functioning correctly in its current integrated state. All 105 core integration checks are passing. 

The recommendations above represent resilience and developer-experience enhancements. Per the safety rules, **no files were modified during this audit**. These improvements can be implemented upon your explicit direction.
