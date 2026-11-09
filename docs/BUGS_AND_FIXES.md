# Bugs Identified and Remediation Catalog
## Comprehensive QA Audit & Bug Fixing Log
**Project:** E-Sports Tournament Management System  
**Audit Period:** November 8, 2026  
**Auditor:** Senior Full-Stack Engineer & Software Architect  
**Head Commit:** `188cd5c461f9affefc7f8962b3306e7845703f2b`  
**Database:** MongoDB Atlas Cluster0 (`xlekpb0`), `esports_db`  
**Test Suite:** Automated E2E Suite (`27/27 PASSED`, `100%`)

---

## 1. Summary of Defects

| Bug ID | Component | Severity | Description | Status |
|---|---|:---:|---|:---:|
| **BUG-01** | Backend DB Connection | Critical | Windows default DNS fails resolving `_mongodb._tcp.*` SRV records | **RESOLVED** |
| **BUG-02** | Frontend Routing (`App.jsx`) | High | Missing `/bracket` root route caused 404 when clicking navbar link | **RESOLVED** |
| **BUG-03** | Route Protection (`App.jsx`) | High | Public pages (`/matches`, `/results`) wrapped in `ProtectedRoute` | **RESOLVED** |
| **BUG-04** | Hook Race (`Leaderboard.jsx`) | Medium | Premature redirect to `/login` before `useAuth` finishes loading | **RESOLVED** |
| **BUG-05** | Hook Race (`UserDashboard.jsx`) | Medium | Premature redirect to `/login` before `useAuth` hydration completes | **RESOLVED** |
| **BUG-06** | Data Fetch (`Matches.jsx`) | Medium | Public upcoming match fixtures blocked by unauthenticated guard | **RESOLVED** |
| **BUG-07** | Data Fetch (`Results.jsx`) | Medium | Public completed match results blocked by unauthenticated guard | **RESOLVED** |
| **BUG-08** | Code Quality (ESLint) | Low | 5 unused variable warnings in modified components | **RESOLVED** |
| **BUG-09** | Build Performance (`vite.config.js`) | Medium | Vite production bundle exceeded 500 kB chunk threshold (512.88 kB) | **RESOLVED** |
| **BUG-10** | DB Connection (`db.js`) | High | Lack of reconnection retry logic & buffered commands on disconnected states | **RESOLVED** |
| **BUG-11** | Server Startup (`server.js`) | High | Express server listened on port 5000 before DB connection was verified | **RESOLVED** |
| **BUG-12** | Registration (`registrationController.js`) | Critical | Unsafe array filter on unpopulated field during cancellation causing runtime crash | **RESOLVED** |
| **BUG-13** | Matches (`matchController.js`) | Critical | Null dereference crashes on missing match ID in update and result entry | **RESOLVED** |
| **BUG-14** | Roster Sync (`playerController.js`) | High | Missing atomic increment/decrement on `Team.totalMembers` on player add/delete | **RESOLVED** |
| **BUG-15** | Auth Contract (`authController.js`) | High | Login endpoint failed to accept standard `emailOrUsername` payload | **RESOLVED** |
| **BUG-16** | Player Authorization (`playerRoutes.js`) | High | Route `staffOnly` blocked captains while controller blocked staff on player delete | **RESOLVED** |
| **BUG-17** | Tournament Status (`tournamentController.js`) | Medium | Tournament creation hardcoded `status: "draft"`, ignoring initial status | **RESOLVED** |

---

## 2. In-Depth Bug Analysis & Code Resolutions

### BUG-01: Windows SRV DNS Resolution Failure on MongoDB Atlas
- **Symptom:** Backend failed to start with error: `querySrv ECONNREFUSED _mongodb._tcp.esportsdb.eq9hmt5.mongodb.net`.
- **Root Cause:** Windows default ISP DNS resolvers frequently refuse or fail to unpack DNS SRV (`_mongodb._tcp`) records for MongoDB Atlas clusters.
- **Remediation:** Switched to standard standard seedlist replica set connection string specifying all 3 shard hosts (`ac-np75rqe-shard-00-*.xlekpb0.mongodb.net:27017`) directly with `ssl=true&replicaSet=atlas-12tzn2-shard-0&authSource=admin&compressors=zlib`.
- **Verification:** Database connected cleanly; health check `GET /api/health` returned `200 OK` with `"database": "connected"`.

---

### BUG-02: Missing `/bracket` Route in `App.jsx`
- **Symptom:** Clicking the navbar link "Bracket" (`/bracket`) or visiting `http://localhost:5173/bracket` rendered a blank screen with React Router warning `No routes matched location "/bracket"`.
- **Root Cause:** The application only defined `<Route path="/tournaments/:id/bracket" element={<Bracket />} />`. The general bracket route `/bracket` was absent.
- **Code Change ([`App.jsx`](file:///e:/project/esports%20platform/client/src/App.jsx)):**
  ```jsx
  // Added root bracket route alongside parameterized route:
  <Route path="/tournaments/:id/bracket" element={<Bracket />} />
  <Route path="/bracket" element={<Bracket />} />
  ```
- **Verification:** Navigating to `/bracket` renders the bracket component tree without errors.

---

### BUG-03: Public Pages Wrapped in `ProtectedRoute` in `App.jsx`
- **Symptom:** Anonymous users clicking "Matches" or "Results" were forced to `/login`.
- **Root Cause:** In [`App.jsx`](file:///e:/project/esports%20platform/client/src/App.jsx), `/matches` and `/results` were wrapped in `<ProtectedRoute>`:
- **Code Change:** Moved `<Route path="/matches" element={<Matches />} />` and `<Route path="/results" element={<Results />} />` out of `<ProtectedRoute>`.
- **Verification:** Anonymous HTTP GET to `/matches` and `/results` loads the pages directly with HTTP 200.

---

### BUG-04 & BUG-05: Hook Race Condition in `Leaderboard.jsx` & `UserDashboard.jsx`
- **Symptom:** Direct browser refresh on protected or semi-protected pages triggered premature redirects to `/login`.
- **Root Cause:** Components checked `if (!user)` before `loading` state from `useAuth()` finished checking `localStorage`.
- **Code Change:**
  ```jsx
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  ```
- **Verification:** Direct page refresh maintains session without bouncing to `/login`.

---

### BUG-06 & BUG-07: Public Matches and Results Data Fetch Blocked
- **Symptom:** Unauthenticated users saw empty match and results listings with 401 console errors.
- **Root Cause:** Component `useEffect` fetched from authenticated endpoints instead of public ones.
- **Remediation:** Switched public fetch endpoints to `/api/matches/upcoming` and `/api/matches/completed` which do not require JWT authorization.
- **Verification:** Public match data returns HTTP 200 for anonymous callers.

---

### BUG-08: Code Quality (ESLint Warnings)
- **Symptom:** 5 unused variable warnings in frontend code.
- **Remediation:** Removed unused imports and variables; ran `npm run lint` with 0 errors.

---

### BUG-09: Production Bundle Size Warning in Vite
- **Symptom:** `npm run build` produced `(!) Some chunks are larger than 500 kB after minification (dist/assets/index-*.js: 512.88 kB)`.
- **Root Cause:** All vendor dependencies (`react`, `react-dom`, `react-router-dom`, `axios`) were bundled into a single monolithic bundle chunk.
- **Code Change ([`client/vite.config.js`](file:///e:/project/esports%20platform/client/vite.config.js)):**
  ```javascript
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          axios: ['axios']
        }
      }
    }
  }
  ```
- **Verification:** Production build generates chunks: `vendor` (34.24 kB), `axios` (36.28 kB), and `index` (441.96 kB), 0 chunks exceeding 500 kB, build completed in 922ms.

---

### BUG-10: MongoDB Connection Resiliency and Buffer Blocking
- **Symptom:** MongoDB Atlas transient network disconnects caused indefinite hung queries (`bufferCommands`) or unhandled connection drops without retries.
- **Root Cause:** `server/config/db.js` had no reconnection retry loop and relied on default `bufferCommands: true`, causing unbounded latency spikes on cold starts.
- **Code Change ([`server/config/db.js`](file:///e:/project/esports%20platform/server/config/db.js)):**
  ```javascript
  const mongooseOptions = {
      bufferCommands: false, // Fail fast rather than buffering indefinitely
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
  };
  // Exponential backoff retry loop (5 retries, 1s initial, 1.5x backoff)
  ```
- **Verification:** Safe automated reconnection with retry logging and fast failures on disconnected state.

---

### BUG-11: Express Startup Sequence Preceding Database Ready State
- **Symptom:** `server/server.js` called `app.listen(PORT)` synchronously before `connectDB()` finished establishing the connection. Early incoming HTTP requests hit uninitialized database models.
- **Root Cause:** Lack of `await connectDB()` in the server bootstrap sequence.
- **Code Change ([`server/server.js`](file:///e:/project/esports%20platform/server/server.js)):**
  ```javascript
  const startServer = async () => {
      try {
          await connectDB();
          const server = app.listen(PORT, () => {
              console.log(`🚀 E-Sports API running on http://localhost:${PORT}`);
          });
      } catch (err) {
          process.exit(1);
      }
  };
  startServer();
  ```
- **Verification:** Server only opens TCP port 5000 after MongoDB Atlas replica set handshake succeeds.

---

### BUG-12: Unsafe Array Filter During Tournament Registration Cancellation
- **Symptom:** Calling `DELETE /api/registrations/my-registrations/:id` crashed with `TypeError: Cannot read properties of undefined (reading 'filter')`.
- **Root Cause:** In [`server/controllers/registrationController.js`](file:///e:/project/esports%20platform/server/controllers/registrationController.js), the query populated `tournamentId` with only `"status registeredTeams"`:
  ```javascript
  const registration = await Registration.findById(...).populate("tournamentId", "status registeredTeams");
  // registration.tournamentId.teams was undefined!
  tournament.teams = tournament.teams.filter(...); // CRASH!
  ```
- **Code Change:** Replaced non-atomic in-memory filter with atomic MongoDB operation:
  ```javascript
  await Tournament.findByIdAndUpdate(registration.tournamentId._id || registration.tournamentId, {
      $inc: { registeredTeams: -1 },
      $pull: { teams: registration.teamId._id || registration.teamId }
  });
  ```
- **Verification:** Tested in automated suite test #21; registration cancelled, `registeredTeams` decremented to 0, and team ID pulled from array atomically.

---

### BUG-13: Null Dereference Crash on Missing Match ID
- **Symptom:** `PUT /api/matches/:id` and `PUT /api/matches/:id/result` crashed the server process if `:id` was not found in MongoDB.
- **Root Cause:** In [`server/controllers/matchController.js`](file:///e:/project/esports%20platform/server/controllers/matchController.js):
  ```javascript
  const currentMatch = await Match.findById(req.params.id);
  // Missing null check!
  const isTeam1 = currentMatch.team1.toString() === ...; // CRASH if null!
  ```
- **Code Change:** Added guard validation:
  ```javascript
  const currentMatch = await Match.findById(req.params.id);
  if (!currentMatch) {
      return sendResponse(res, errorResponse("Match not found", 404));
  }
  ```
- **Verification:** Tested in automated suite test #26 with non-existent ObjectId; returned clean HTTP 404 without crashing.

---

### BUG-14: Desynchronized `Team.totalMembers` Counter
- **Symptom:** Adding or deleting players never updated `totalMembers` on the parent `Team` document, corrupting team roster stats.
- **Root Cause:** [`server/controllers/playerController.js`](file:///e:/project/esports%20platform/server/controllers/playerController.js) created and deleted `Player` documents without updating the `Team` model.
- **Code Change:**
  - In `addPlayer`: added `await Team.findByIdAndUpdate(teamId, { $inc: { totalMembers: 1 } });`
  - In `deletePlayer`: added `await Team.findByIdAndUpdate(player.teamId, { $inc: { totalMembers: -1 } });`
- **Verification:** Tested in automated suite tests #19 and #22; adding player incremented `totalMembers` to 1, deleting player decremented `totalMembers` to 0.

---

### BUG-15: Authentication Login Contract Inconsistency
- **Symptom:** Clients sending `{ emailOrUsername, password }` received `400 Email is required`.
- **Root Cause:** [`server/controllers/authController.js`](file:///e:/project/esports%20platform/server/controllers/authController.js) only looked for `req.body.email`.
- **Code Change:**
  ```javascript
  const identifier = (req.body.emailOrUsername || req.body.email || req.body.username || "").toLowerCase().trim();
  ```
- **Verification:** Tested in automated suite test #8; login with `emailOrUsername` succeeded with HTTP 200 and valid JWT.

---

### BUG-16: Contradictory Player Deletion Authorization
- **Symptom:** Captains could not remove players from their own team (HTTP 403), and organizers could not moderate rosters (HTTP 403).
- **Root Cause:** Route had `staffOnly` middleware which blocked players (even if they were the team captain), while controller explicitly required `isAdmin = req.user.role === 'admin'`.
- **Code Change:**
  - In [`server/routes/playerRoutes.js`](file:///e:/project/esports%20platform/server/routes/playerRoutes.js): changed to `router.delete("/:id", protect, deletePlayer);`
  - In [`server/controllers/playerController.js`](file:///e:/project/esports%20platform/server/controllers/playerController.js):
    ```javascript
    const isCaptain = team.captain.toString() === req.user._id.toString();
    const isStaff = req.user.role === "admin" || req.user.role === "organizer";
    if (!isCaptain && !isStaff) {
        return sendResponse(res, errorResponse("Not authorized to remove this player", 403));
    }
    ```
- **Verification:** Tested in automated suite test #22; captain successfully removed player from their own roster with HTTP 200.

---

### BUG-17: Inability to Create Tournaments with Initial Open Registration
- **Symptom:** Newly created tournaments could not receive registrations because `createTournament` always forced `status: "draft"`.
- **Root Cause:** Hardcoded `status: "draft"` in [`server/controllers/tournamentController.js`](file:///e:/project/esports%20platform/server/controllers/tournamentController.js) line 100.
- **Code Change:**
  ```javascript
  status: req.body.status && VALID_STATUSES.includes(req.body.status.trim()) 
      ? req.body.status.trim() 
      : "draft"
  ```
- **Verification:** Tested in automated suite test #14; tournament created directly with `status: "registration_open"` and verified via GET request.
