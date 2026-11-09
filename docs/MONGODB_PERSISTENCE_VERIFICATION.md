# MongoDB Database Persistence & Integrity Verification Report

**Target Database:** `esports_db`  
**Target Cluster:** `Cluster0` (`xlekpb0`)  
**Replica Set:** `atlas-12tzn2-shard-0`  
**Audit Date:** 08 November 2026  
**Auditor:** Senior Database Administrator & Backend Engineer  
**Status:** **PASS (Freshness & Persistence Fully Verified)**  

---

## 1. Executive Summary

This report documents the verification of the fresh MongoDB Atlas database **`esports_db`** hosted on cluster **`Cluster0`**. The database was audited for topology compliance, schema collection mapping, document count freshness, isolated end-to-end write and read persistence, and relational data integrity.

| Check Item | Result | Evidence |
| :--- | :---: | :--- |
| **Cluster Topology** | **PASS** | 3 replica shard nodes connected with SSL/TLS on port 27017. |
| **Target Database Selection** | **PASS** | Connected to `esports_db` without fallback to default `test`. |
| **Admin Ping Command** | **PASS** | MongoDB `db.admin().ping()` returned `{"ok": 1}`. |
| **Wire Compression** | **PASS** | `compressors=zlib` active across replica set connections. |
| **Old Cluster Protection** | **PASS** | Zero read/write commands sent to `cluster0.eq9hmt5.mongodb.net`. |
| **Collection Initialization** | **PASS** | All 9 core application collections initialized. |
| **Document Freshness** | **PASS** | All collections contain exactly 0 documents (unpolluted). |
| **E2E Document Persistence** | **PASS** | Tournament and Team documents written via API and verified in MongoDB. |
| **Relational Integrity** | **PASS** | Team ObjectId populated into `Tournament.teams` array. |
| **Safe Test Purge** | **PASS** | Audit test documents purged; database returned to 0 records. |

---

## 2. Cluster Topology & Connection Configuration

### 2.1 Replica Set Shard Hosts
```text
Node 00: ac-np75rqe-shard-00-00.xlekpb0.mongodb.net:27017 (TLS: Connected)
Node 01: ac-np75rqe-shard-00-01.xlekpb0.mongodb.net:27017 (TLS: Connected)
Node 02: ac-np75rqe-shard-00-02.xlekpb0.mongodb.net:27017 (TLS: Connected)
Replica Set Name: atlas-12tzn2-shard-0
Authentication Mechanism: SCRAM-SHA-1 / SCRAM-SHA-256 (authSource=admin)
```

### 2.2 Active Connection String Format in [`server/.env`](file:///e:/project/esports%20platform/server/.env)
```env
MONGO_URI=mongodb://kanishmr17:<MASKED>@ac-np75rqe-shard-00-00.xlekpb0.mongodb.net:27017,ac-np75rqe-shard-00-01.xlekpb0.mongodb.net:27017,ac-np75rqe-shard-00-02.xlekpb0.mongodb.net:27017/esports_db?ssl=true&replicaSet=atlas-12tzn2-shard-0&authSource=admin&retryWrites=true&w=majority&compressors=zlib
DB_NAME=esports_db
```

---

## 3. Collection Freshness & Document Audit

The database was inspected directly via the MongoDB driver to verify collection mapping and document counts:

| Collection Name | Associated Mongoose Model | Document Count | Freshness Status |
| :--- | :--- | :---: | :---: |
| `contacts` | [`server/models/Contact.js`](file:///e:/project/esports%20platform/server/models/Contact.js) | 0 | Fresh / Clean |
| `tournaments` | [`server/models/Tournament.js`](file:///e:/project/esports%20platform/server/models/Tournament.js) | 0 | Fresh / Clean |
| `players` | [`server/models/Player.js`](file:///e:/project/esports%20platform/server/models/Player.js) | 0 | Fresh / Clean |
| `matches` | [`server/models/Match.js`](file:///e:/project/esports%20platform/server/models/Match.js) | 0 | Fresh / Clean |
| `users` | [`server/models/User.js`](file:///e:/project/esports%20platform/server/models/User.js) | 0 | Fresh / Clean |
| `notifications`| [`server/models/Notification.js`](file:///e:/project/esports%20platform/server/models/Notification.js) | 0 | Fresh / Clean |
| `teams` | [`server/models/Team.js`](file:///e:/project/esports%20platform/server/models/Team.js) | 0 | Fresh / Clean |
| `payments` | [`server/models/Payment.js`](file:///e:/project/esports%20platform/server/models/Payment.js) | 0 | Fresh / Clean |
| `registrations`| [`server/models/Registration.js`](file:///e:/project/esports%20platform/server/models/Registration.js)| 0 | Fresh / Clean |

---

## 4. End-to-End Write, Read, & Cleanup Lifecycle

An isolated write test was executed through the application API layer to verify that Mongoose models write to their intended MongoDB collections without schema mismatches:

### Step 1: Create Tournament via API
- **Route:** `POST /api/tournaments`
- **Payload:**
  ```json
  {
    "name": "Championship_Audit_1794145211913",
    "game": "Valorant",
    "type": "team",
    "format": "single_elimination",
    "startDate": "2026-11-09T13:40:11.913Z",
    "endDate": "2026-11-11T13:40:11.913Z",
    "maxTeams": 8,
    "prizePool": 50000,
    "entryFee": 500
  }
  ```
- **Response:** HTTP 201 Created (`_id: 6af07bc0b65ae39a3db31965`).
- **MongoDB Verification:** Queried `esports_db.tournaments.findOne({ _id: ObjectId("6af07bc0b65ae39a3db31965") })`. Document found with exact matching properties.

### Step 2: Create Team via API
- **Route:** `POST /api/teams`
- **Payload:**
  ```json
  {
    "teamName": "AuditTeam_1794145211913",
    "game": "Valorant",
    "tournamentId": "6af07bc0b65ae39a3db31965"
  }
  ```
- **Response:** HTTP 201 Created (`_id: 6af07bc1b65ae39a3db3196a`).
- **MongoDB Verification:** Queried `esports_db.teams.findOne({ _id: ObjectId("6af07bc1b65ae39a3db3196a") })`. Document found.

### Step 3: Relational Integrity Check
- **Verification Query:** Checked `esports_db.tournaments.findOne({ _id: ObjectId("6af07bc0b65ae39a3db31965") })`.
- **Finding:** The `teams` array in the tournament document contained `ObjectId("6af07bc1b65ae39a3db3196a")`, proving two-way relational integrity between Tournament and Team models.

### Step 4: Public API Read Verification
- `GET /api/tournaments`: Returned array containing tournament `6af07bc0b65ae39a3db31965`.
- `GET /api/teams`: Returned array containing team `6af07bc1b65ae39a3db3196a`.

### Step 5: Safe Cleanup & Audit Purge
- Sent `DELETE /api/teams/6af07bc1b65ae39a3db3196a`.
- Sent `DELETE /api/tournaments/6af07bc0b65ae39a3db31965`.
- Purged temporary audit users from `users`.
- Queried all 9 collections in `esports_db` and confirmed document count returned to **0**.

---

## 5. Old Cluster Preservation Confirmation

| Audit Target | Result | Evidence |
| :--- | :---: | :--- |
| **Host `cluster0.eq9hmt5.mongodb.net`** | **UNTOUCHED** | 0 TCP connections initiated to old cluster during audit. |
| **Data Migration** | **NONE** | No records were exported, migrated, or transferred from the old database. |
| **Data Deletion** | **NONE** | No drop, delete, or schema modifications were sent to the old cluster. |

---

## 6. Summary & Conclusion

The MongoDB Atlas cluster `Cluster0` is fully operational, correctly provisioned, fresh, and properly bound to the application. Data persistence, schema validations, and relational mappings operate with zero errors. All persistence checks are marked **PASS**.
