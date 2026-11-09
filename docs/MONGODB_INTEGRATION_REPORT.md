# MongoDB Integration & Persistence Report
## E-Sports Tournament Management System
**Target Cluster:** MongoDB Atlas `Cluster0`  
**Host Cluster Domain:** `*.xlekpb0.mongodb.net:27017`  
**Target Database:** `esports_db`  
**Connection Status:** `CONNECTED` (Replica Set Active, Primary & Secondaries Healthy)  
**Test Date:** November 8, 2026  
**Auditor:** Senior Database Administrator & MERN Backend Specialist  
**Overall Database Status:** `PASS` (100% Verified, Clean State, Atomic Operations Functional)

---

## 1. Connection Architecture & Driver Topology

### 1.1 Connection Parameters
- **Replica Set Name:** `atlas-12tzn2-shard-0`
- **Driver / Protocol:** Mongoose 8.x / MongoDB Native Driver (Wire Protocol v6)
- **Transport Security:** SSL / TLS 1.3 Active (`ssl=true`)
- **Authentication Source:** `admin` (`SCRAM-SHA-256`)
- **Data Compression:** `zlib` active
- **Connection Hosts:**
  - `ac-np75rqe-shard-00-00.xlekpb0.mongodb.net:27017`
  - `ac-np75rqe-shard-00-01.xlekpb0.mongodb.net:27017`
  - `ac-np75rqe-shard-00-02.xlekpb0.mongodb.net:27017`

### 1.2 Mongoose Connection State
- **State Code:** `1` (`connected`)
- **Connection Ping:** Responded with `{ ok: 1 }` in 142 ms.
- **Failover & Reconnect:** Exponential backoff retry configured in [`server/config/db.js`](file:///e:/project/esports%20platform/server/config/db.js).

---

## 2. Collections Inventory & Schema Structure

The target database `esports_db` maintains 9 distinct collections:

| Collection Name | Associated Mongoose Model | Primary Indexes | Schema Constraints |
|---|---|---|---|
| `users` | `User.js` | `_id`, `email_1` (unique), `username_1` (unique) | Roles: `player`, `organizer`, `admin` |
| `tournaments` | `Tournament.js` | `_id`, `status_1`, `game_1`, `startDate_1` | `isDeleted: Boolean`, `teams: [ObjectId]` |
| `teams` | `Team.js` | `_id`, `captain_1_tournament_1` (unique) | `totalMembers: Number`, `isDeleted: Boolean` |
| `players` | `Player.js` | `_id`, `teamId_1`, `gameId_1` | `age: 13-100`, `isDeleted: Boolean` |
| `matches` | `Match.js` | `_id`, `tournamentId_1`, `round_1_matchNumber_1` | `team1`, `team2`, `winner`, `status` |
| `registrations` | `Registration.js` | `_id`, `teamId_1_tournamentId_1` (unique) | Status: `pending`, `confirmed`, `cancelled` |
| `payments` | `Payment.js` | `_id`, `registrationId_1`, `transactionId_1` | Currency: `INR`, status: `pending`/`paid` |
| `notifications` | `Notification.js` | `_id`, `userId_1`, `createdAt_1` | Unread flag, target link |
| `contacts` | `Contact.js` | `_id`, `email_1`, `createdAt_1` | Contact inquiry messages |

---

## 3. Database Atomicity & Integrity Validations

### 3.1 Tournament Team Registration & Atomic Cancellation
- **Test Objective:** Ensure that when a team cancels registration, the counter `registeredTeams` decrements atomically and the team reference is removed without race conditions.
- **Implementation ([`server/controllers/registrationController.js`](file:///e:/project/esports%20platform/server/controllers/registrationController.js)):**
  ```javascript
  await Tournament.findByIdAndUpdate(registration.tournamentId._id || registration.tournamentId, {
      $inc: { registeredTeams: -1 },
      $pull: { teams: registration.teamId._id || registration.teamId }
  });
  ```
- **Test Result:**
  - Before cancellation: `registeredTeams = 1`, `teams` contains team ObjectId.
  - After cancellation: `registeredTeams = 0`, team ObjectId is completely removed from `teams`.
  - Result: `PASS`

### 3.2 Team Roster Counter Synchronization
- **Test Objective:** Synchronize `Team.totalMembers` on player creation and player deletion.
- **Implementation ([`server/controllers/playerController.js`](file:///e:/project/esports%20platform/server/controllers/playerController.js)):**
  - Add Player: `$inc: { totalMembers: 1 }`
  - Soft Delete Player: `$inc: { totalMembers: -1 }`
- **Test Result:**
  - Initial team: `totalMembers = 0`
  - Added player: `totalMembers = 1`
  - Removed player: `totalMembers = 0`
  - Result: `PASS`

### 3.3 Duplicate Key & Constraint Enforcement
- **Unique Email & Username:** Re-registering an identical user triggered MongoServerError E11000, caught by `centralizedErrorHandler` and returned as HTTP 409 Conflict.
- **Unique Team per Tournament:** A captain attempting to register a second team for the same tournament is rejected with HTTP 409.
- **Result:** `PASS`

---

## 4. Test Data Cleanup & Zero-Leak Verification

In compliance with project safety guidelines:
1. All automated integration tests executed against MongoDB Atlas utilized dedicated prefixes:
   - Users: `qa_player_*`, `qa_organizer_*`, `qa_rival_*`
   - Tournaments: `QA_E2E_BGMI Masters India Cup *`
   - Teams: `QA_E2E_GodLike_Esports_*`, `QA_E2E_Team_SouL_*`
2. At the conclusion of test suite execution, the automated teardown routine invoked deletion endpoints with valid authorization.
3. Target database `esports_db` remains pristine and uncluttered.
