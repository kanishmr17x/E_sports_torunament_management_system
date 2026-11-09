# Task 5 - Database Schema, MongoDB Atlas, and Data Consistency Audit

**Date:** 2026-10-19  
**Status:** PARTIAL

## Scope

This audit covers the Mongoose models, database connection management, database-related controller queries and writes, seed tooling, validation configuration, relationship assumptions, indexes, and frontend/backend field-name agreement.

The evidence boundary is explicit:

- **Source inspection:** all 10 model files, `server/config/db.js`, `server/app.js`, `server/server.js`, `api/index.js`, `server/createAdmin.js`, `server/utils/validateEnv.js`, relevant controllers, manifests, environment templates, and prior audit reports.
- **Static verification:** `node --check` on every changed backend file and `git diff --check`.
- **Not runtime verified:** MongoDB Atlas connectivity, collection/index state, CRUD behavior, transaction behavior, query plans, Atlas Network Access, payment gateway callbacks, and production data.
- No `.env` contents, credentials, connection strings, production data, database writes, migrations, collection drops, or Atlas configuration changes were accessed.

## Files and components examined

### Database and configuration

- `server/config/db.js` - Mongoose connection function and connection caching.
- `server/app.js` - application import-time connection initiation and model/router setup.
- `server/server.js` - local HTTP process entry point.
- `api/index.js` - Vercel adapter exporting the Express application.
- `server/utils/validateEnv.js` - environment validation utility.
- `server/.env.example` - variable names only.
- `vercel.json`, `client/vite.config.js`, `server/package.json`, and `server/package-lock.json`.

### Models

- `server/models/User.js`
- `server/models/Team.js`
- `server/models/Player.js`
- `server/models/Tournament.js`
- `server/models/Registration.js`
- `server/models/Match.js`
- `server/models/MatchSchedule.js`
- `server/models/Payment.js`
- `server/models/Notification.js`
- `server/models/Contact.js`

### Query and write paths

- `server/controllers/authController.js`
- `server/controllers/teamController.js`
- `server/controllers/playerController.js`
- `server/controllers/tournamentController.js`
- `server/controllers/registrationController.js`
- `server/controllers/paymentController.js`
- `server/controllers/adminUserController.js`
- `server/controllers/adminRegistrationController.js`
- `server/controllers/matchController.js`
- `server/controllers/leaderboardController.js`
- `server/controllers/notificationController.js`
- `server/controllers/contactController.js`
- Relevant frontend API wrappers and prior reports `01` through `04`.

## Actual database architecture

The application uses MongoDB through Mongoose 8. Models use the default collection naming convention:

| Model | Expected collection | Primary purpose |
|---|---|---|
| `User` | `users` | Accounts, roles, password hashes, account state |
| `Team` | `teams` | Team identity, captain, tournament association |
| `Player` | `players` | Roster/player records |
| `Tournament` | `tournaments` | Tournament configuration and denormalized team/count fields |
| `Registration` | `registrations` | Team-to-tournament registration relation |
| `Match` | `matches` | Tournament match schedule and results |
| `MatchSchedule` | `matchschedules` | Alternate schedule representation |
| `Payment` | `payments` | Registration payment lifecycle |
| `Notification` | `notifications` | User notifications and read state |
| `Contact` | `contacts` | Public contact messages |

There is no repository or service layer. Controllers directly perform Mongoose reads and writes. There are no migration files or project-owned seed fixtures; `createAdmin.js` is a one-off admin creation script.

## Model schema and relationship inventory

| Model | Important fields and constraints | Relationships and observations |
|---|---|---|
| `User` | Required trimmed username, unique username; required lowercased unique email with regex; password minimum length; role enum `player/organizer/admin`; `isActive` default `true`; timestamps | Referenced by `Team.captain`, `Payment.userId`, and `Notification.userId`. Password is selected out of auth/admin reads. |
| `Team` | Required name/game/tournament/captain; game enum; status enum; member count; soft-delete flag; timestamps | References `Tournament` and `User`. Unique compound index on `{ tournament: 1, teamName: 1 }`. Team creation also mutates `Tournament.teams`. |
| `Player` | Required name/game ID/age/contact; role enum; optional `teamId`; soft-delete flag; timestamps | References `Team`, but the add-player route is publicly writable and does not enforce captain ownership. |
| `Tournament` | Required name/game/maxTeams/start/end dates; type and format enums; entry/prize/count defaults; status enum; registration dates; soft-delete flag; timestamps | Contains an array of `Team` ObjectIds and denormalized `registeredTeams`. The array has no uniqueness constraint. |
| `Registration` | Required `teamId` and `tournamentId`; `registeredAt` default | References `Team` and `Tournament`. No status, payment state, owner/user field, or unique compound index. |
| `Match` | Required tournament, round, match number, two teams, scheduled date; status/result enums; score defaults; optional winner; timestamps | References `Tournament` and `Team`. No validation that both teams belong to the tournament or are different. |
| `MatchSchedule` | Required tournament, match name/time; optional team array; timestamps | Alternate schedule model has no controller/route usage found in source inspection. It appears unused and duplicates part of `Match`. |
| `Payment` | Required user/team/tournament/amount; optional registration; status and payment-method enums; sparse unique transaction ID; gateway response; paid/refund timestamps | References `User`, `Team`, `Tournament`, and `Registration`. No unique team+tournament payment/idempotency key. |
| `Notification` | Required user/type/title/message; related entity type/id; read state; timestamps | References `User`; indexes support user/time and unread queries. Related entity IDs are not polymorphically validated. |
| `Contact` | Required name/email/message; timestamps | Standalone public message collection; field length and email validation are not present in the schema. |

## Index inventory

Confirmed from source:

- `User`: unique indexes generated by `unique: true` for `username` and `email`.
- `Team`: unique `{ tournament: 1, teamName: 1 }`.
- `Tournament`: `{ status: 1, startDate: 1 }` and `{ game: 1, status: 1 }`.
- `Match`: `{ tournamentId: 1, round: 1, matchNumber: 1 }`, `{ scheduledAt: 1 }`, and `{ status: 1 }`.
- `Payment`: `{ userId: 1, createdAt: -1 }`, `{ tournamentId: 1, status: 1 }`, `{ transactionId: 1 }`, and `{ status: 1 }`; `transactionId` is also declared sparse and unique.
- `Notification`: `{ userId: 1, createdAt: -1 }` and `{ userId: 1, isRead: 1 }`.
- `Registration`, `Player`, `Contact`, and `MatchSchedule`: no explicit indexes found.

The actual Atlas index state was **NOT TESTED**. Mongoose declarations do not prove that indexes have been built in the deployed database.

## Connection lifecycle and environment configuration

### Findings

1. **Connection variable:** the code uses `MONGO_URI`, consistently with `server/.env.example` and the root Vercel environment reference. `MONGODB_URI` is not the active variable.
2. **Connection reuse:** the prior implementation called `mongoose.connect` on every module initialization. `server/config/db.js` now reuses an in-flight connection promise and returns an already-open connection, which is appropriate for repeated serverless invocations.
3. **Failure propagation:** the connection helper no longer calls `process.exit(1)`. It rejects after logging a sanitized error message, allowing the caller/runtime to handle startup failure instead of terminating the process from a reusable module.
4. **Application startup ordering:** `server/app.js` starts the connection at import time and does not await it before registering/serving requests. The local server can begin listening while connection establishment is still pending. A live readiness test was not possible.
5. **Environment validation:** `validateEnv.js` exists but was not found wired into `server/app.js` or `server/server.js`. It requires `PORT`, `NODE_ENV`, `MONGO_URI`, and `JWT_SECRET`, while `PORT` has a code default and Vercel may provide it implicitly. Its actual deployment behavior is therefore unverified.
6. **Environment separation:** no isolated test database URI or test seed configuration is present in the manifests. The application has no repeatable integration-test database configuration.

**Status:** PARTIAL. Source-level reuse/error handling is improved; live Atlas/serverless readiness is **BLOCKED** by unavailable credentials, network access, and installed backend dependencies.

## Data consistency and concurrency findings

### Confirmed defects

| ID | Severity | Finding | Evidence | Status |
|---|---|---|---|---|
| DB-01 | HIGH | `Registration` permits duplicate team+tournament rows | Schema has no unique compound index; registration/payment paths use `findOne` then `create`, which is race-prone | FAIL |
| DB-02 | HIGH | Registration, payment, and tournament count/team-array writes are not transactional | Controllers independently create/update multiple documents; a later failure can leave partial state | FAIL |
| DB-03 | HIGH | Payment callbacks and completion paths can double-count `Tournament.registeredTeams` | Both paths update denormalized count after finding/creating a registration; repeated callbacks were not idempotent | PARTIAL after fix |
| DB-04 | MEDIUM | `Tournament.teams` can contain duplicate ObjectIds | Array has no schema uniqueness and prior code used strict `includes` with ObjectId instances | PARTIAL after fix |
| DB-05 | HIGH | Admin user detail queries referenced nonexistent `Registration.userId` | `Registration` contains only `teamId` and `tournamentId`; admin summaries returned no registrations for users | PASS after fix |
| DB-06 | HIGH | Payment amount was accepted from the client | Initiation parsed request `amount` instead of using `Tournament.entryFee` | PASS after fix |
| DB-07 | MEDIUM | Payment lacks a team+tournament idempotency constraint | Only `transactionId` is unique; concurrent initiation can create multiple pending payments | FAIL |
| DB-08 | MEDIUM | Admin registration payment filtering occurs after pagination | Controller pages registrations, then filters the page in memory by payment status | FAIL |
| DB-09 | MEDIUM | Free/paid registration workflows have inconsistent approval/count semantics | Direct registration increments count; payment completion also creates registration and increments count; admin approval increments again | FAIL |
| DB-10 | MEDIUM | Match schema does not enforce team membership or distinct teams | `team1`, `team2`, and tournament references are individually required but cross-document consistency is controller-only | PARTIAL |
| DB-11 | LOW | `MatchSchedule` appears unused and duplicates scheduling concepts | No route/controller usage found; live collection usage is unknown | NOT TESTED |

### Fixes applied in this task

- `server/controllers/adminUserController.js`
  - Derives registrations through the user’s captain-owned team IDs rather than querying the nonexistent `Registration.userId`.
- `server/controllers/paymentController.js`
  - Verifies that the selected team belongs to the selected tournament.
  - Uses the stored `Tournament.entryFee` rather than trusting a client amount.
  - In test and callback completion paths, increments `registeredTeams` only when a new registration is created.
  - Uses ObjectId string comparison before appending to `Tournament.teams`.
- `server/config/db.js`
  - Caches the in-flight Mongoose connection for serverless reuse.
  - Rejects configuration/connection failures without terminating the process from the connection module.
- `server/createAdmin.js`
  - Removes the hardcoded local fallback URI and demo admin credentials.
  - Requires `MONGO_URI`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from the environment and no longer prints a password.

These fixes do not repair existing duplicate rows or reconcile denormalized counts. No production data was changed.

### Recommended data-model corrections requiring approval/migration planning

These were not applied because they may fail against existing data or change workflow semantics:

1. Audit and remove/merge duplicate `{ teamId, tournamentId }` registrations in an isolated copy, then add a unique compound index.
2. Add a registration status model only after deciding whether payment completion or admin approval is authoritative.
3. Use MongoDB transactions for registration/payment/tournament updates when deployed on a replica set, with retry handling.
4. Replace denormalized `registeredTeams` and `Tournament.teams` updates with an authoritative registration query or carefully maintained atomic updates.
5. Add an idempotency key/unique constraint for one active payment per team+tournament.
6. Move payment status filtering into a database query/aggregation before pagination.

## Capacity, deadline, and payment consistency

Source inspection found registration deadline/status/capacity checks in registration and payment initiation paths, but they are ordinary read-then-write checks. Concurrent requests can both observe capacity and exceed `maxTeams`. Payment callbacks are public and signature validation remains a backend audit defect from Task 3; without trusted callbacks, payment-to-registration consistency cannot be considered production-ready.

Refund/rejection/cancellation paths update payment, registration, tournament count, and tournament team array in separate operations. A failure between operations can leave orphaned or contradictory state. The schema has no registration status to represent pending, approved, rejected, or cancelled state.

## Sensitive data and exposure

- `User.password` is hashed in a Mongoose pre-save hook and excluded in the inspected auth/admin reads.
- Payment `gatewayResponse` is stored as unrestricted `Mixed` data. Gateway responses should be minimized/redacted before persistence and never returned to unauthorized users.
- Contact messages and player contact values are stored as ordinary strings without field-length or format constraints.
- The centralized error handler was previously observed to log request bodies; this can expose passwords, payment payloads, or contact data and needs review in the security task.
- No credentials or connection-string values were printed during this audit.

## Commands and tests executed

| Command/test | Result |
|---|---|
| `node --check` on changed `server/config/db.js`, `server/createAdmin.js`, `server/controllers/adminUserController.js`, and `server/controllers/paymentController.js` | PASS |
| `git diff --check` on changed database-audit files | PASS |
| Source search for model queries, registration writes, connection calls, and environment references | PASS |
| Attempted model metadata load with Node/Mongoose | BLOCKED: `mongoose` is not installed/resolvable in the current checkout |
| MongoDB Atlas connection, collection/index inspection, CRUD tests, transaction tests | BLOCKED: no authorized isolated test URI/credentials/network access |
| Production database writes, migrations, drops, or destructive tests | NOT TESTED by policy |

No dependency was installed because the requested audit did not require changing manifests, and no isolated database credentials were available.

## Files changed during Task 5

Created:

- `audit-reports/05-database-audit.md`

Modified:

- `server/config/db.js`
- `server/createAdmin.js`
- `server/controllers/adminUserController.js`
- `server/controllers/paymentController.js`

No files were deleted. The working tree already contained extensive staged, modified, and untracked changes; those changes were preserved. The four modified paths were already represented as staged/modified or untracked in the pre-existing working tree status, and no reset/clean/checkout operation was used.

## Remaining defects, blockers, and unverified items

- Duplicate registration prevention is not enforced at the database level.
- Multi-document registration/payment/count operations are not transactional.
- Payment callback authentication/signature validation and idempotency remain unresolved.
- Capacity checks remain race-prone.
- Atlas connection, actual indexes, query plans, CRUD, and serverless cold/warm behavior are unverified.
- Backend dependencies are absent from the current checkout, preventing model metadata execution.
- No isolated test database or test credentials are configured.
- `MatchSchedule` collection usage is unknown and requires Atlas/schema inventory before removal is considered.
- Existing production data may already contain duplicate registrations/count drift; no reconciliation was attempted.

## Exact manual verification required

Using a separate test database/credentials (never production):

1. Set `MONGO_URI` to the isolated database and verify Atlas Network Access permits only the test runner.
2. Run the backend dependency installation from the committed `server/package-lock.json` in the approved test environment.
3. Start the API with `NODE_ENV=test` and a test JWT secret; verify startup waits/handles connection failure correctly.
4. Inspect `listCollections()` and `listIndexes()` for all collections, especially `registrations`, `payments`, `teams`, and `tournaments`.
5. Create two test requests concurrently for the same team+tournament and confirm duplicate prevention/count behavior.
6. Repeat payment completion/callback delivery and confirm it is idempotent and does not double-count.
7. Explain/resolve existing duplicate registrations before creating a unique index.
8. Run `explain("executionStats")` for tournament listing, registration lookup, payment lookup, and notification lookup queries.
9. Verify unauthorized users cannot read another user’s payment or registration data.
10. Verify Vercel warm invocation connection reuse and cold-start failure behavior from deployment logs.

## Next task prerequisites

Task 6 (testing audit) should begin with this report and the prior reports. It should first inventory the absence of backend tests, define an isolated test database strategy, and avoid using production credentials/data. The security/performance task should specifically review public payment callbacks, logged request bodies, unrestricted gateway responses, input validation, and query/race risks identified here.

