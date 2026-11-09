# Task 3 - Complete Backend and API Routing Audit

**Date:** 2026-10-19  
**Status:** PARTIAL

## Scope

This audit covers the Express/Mongoose backend under `server/`, its Vercel adapter under `api/`, all mounted routers, controllers, middleware, models, database configuration, and the frontend API wrapper used to compare request contracts.

The evidence boundary is:

- **Source-inspected:** all backend route files, controllers, models, middleware, `server/app.js`, `api/index.js`, database configuration, backend package scripts, and `client/src/api/apiRoutes.js`.
- **Executed locally:** Git status inspection, route/import searches, and `node --check` on all files changed for this task.
- **Not runtime-verified:** MongoDB Atlas connectivity, authenticated requests, payment gateway callbacks, Vercel execution, and browser-to-API workflows. No production data or credentials were used.

## Files and components examined

- Entry points: `server/app.js`, `server/server.js`, `api/index.js`
- Routes: all 12 files under `server/routes/`
- Controllers: all 12 files under `server/controllers/`
- Models: all 10 files under `server/models/`
- Middleware: `authMiddleware.js`, `adminMiddleware.js`, `centralizedErrorHandler.js`, and duplicate `errorMiddleware.js`
- Database/configuration: `server/config/db.js`, `server/.env.example`, backend `package.json`
- Client contract: `client/src/api/apiRoutes.js`, `client/src/api/axiosConfig.js`
- Prior audit inputs: `audit-reports/01-project-inventory.md` and `audit-reports/02-frontend-audit.md`

## Architecture and request flow

`api/index.js` exports the Express app from `server/app.js`. The app loads dotenv, attempts a Mongoose connection, configures JSON and URL-encoded body parsing, CORS, optional Morgan logging, mounts `/api/*` routers, then installs a 404 handler and centralized error handler.

Successful controller responses use `successResponse`/`errorResponse` and `sendResponse`, producing `{ success, message, data? }`. The Axios response interceptor in the client unwraps `response.data.data` for successful wrapped responses. Authentication is JWT bearer authentication through `protect`; `adminOnly` permits only `admin`, and `staffOnly` permits `admin` or `organizer`.

There is no service layer: controllers perform validation and Mongoose operations directly. There is no separate request-schema validation package.

## Complete endpoint inventory

Status means source-contract assessment, not proof of live operation. `DB` identifies the principal model dependency.

### Authentication, public resources, and registration

| Method | Path | Purpose | Authorization | DB | Test performed | Status |
|---|---|---|---|---|---|---|
| POST | `/api/auth/register` | Create player/organizer account and JWT | Public | User | Source trace; syntax check | PASS |
| POST | `/api/auth/login` | Authenticate by email or username | Public | User | Source trace; syntax check | PASS |
| GET | `/api/auth/me` | Return authenticated profile | JWT | User | Source trace; syntax check | PASS |
| POST | `/api/contact` | Store contact message | Public | Contact | Source trace; syntax check | PARTIAL |
| GET | `/api/tournaments` | List non-deleted tournaments | Public | Tournament, Team | Source trace; syntax check | PASS |
| GET | `/api/tournaments/open-registrations` | List tournaments open by date/status | Public | Tournament, Team | Source trace; syntax check | PASS (fixed) |
| GET | `/api/tournaments/:id` | Get tournament details | Public | Tournament, Team | Source trace; syntax check | PASS |
| POST | `/api/tournaments` | Create tournament | Staff | Tournament | Source trace; syntax check | PASS |
| PUT | `/api/tournaments/:id` | Update tournament | Staff | Tournament | Source trace; syntax check | PASS |
| DELETE | `/api/tournaments/:id` | Soft-delete tournament | Staff | Tournament | Source trace; syntax check | PASS |
| GET | `/api/teams` | List non-deleted teams | Public | Team, Tournament, User | Source trace; syntax check | PASS |
| GET | `/api/teams/my-teams` | List current user’s teams | JWT | Team, Tournament | Source trace; syntax check | PASS (fixed) |
| GET | `/api/teams/:id` | Get team and players | Public | Team, Player | Source trace; syntax check | PASS |
| POST | `/api/teams` | Create team for current captain | JWT | Team, Tournament | Source trace; syntax check | PARTIAL |
| PUT | `/api/teams/:id` | Update captain-owned/admin team | JWT plus controller ownership | Team | Source trace; syntax check | PASS |
| DELETE | `/api/teams/:id` | Soft-delete captain-owned/admin team | JWT plus controller ownership | Team, Tournament | Source trace; syntax check | PASS |
| GET | `/api/players` | List non-deleted players | Public | Player, Team | Source trace; syntax check | PASS |
| GET | `/api/players/team/:teamId` | List players for a team | Public | Player | Source trace; syntax check | PASS (fixed) |
| GET | `/api/players/:id` | Get player | Public | Player, Team | Source trace; syntax check | PASS |
| POST | `/api/players/add` | Add player record | Public | Player | Source trace; syntax check | PARTIAL |
| DELETE | `/api/players/:id` | Soft-delete player | Staff | Player | Source trace; syntax check | PASS |
| POST | `/api/registrations/team` | Register owned team to tournament | JWT plus captain check | Registration, Team, Tournament | Source trace; syntax check | PASS (fixed) |
| GET | `/api/registrations/my-registrations` | List current user registrations | JWT | Team, Registration | Source trace; syntax check | PASS |
| GET | `/api/registrations/my-registrations/:id` | Get owned registration | JWT plus controller ownership | Registration, Team | Source trace; syntax check | PASS |
| DELETE | `/api/registrations/my-registrations/:id` | Cancel owned unpaid registration | JWT plus controller ownership | Registration, Payment, Tournament | Source trace; syntax check | PARTIAL |
| GET | `/api/registrations` | List registrations | Staff | Registration, Team, Tournament | Source trace; syntax check | PASS |

### Matches and leaderboard

| Method | Path | Purpose | Authorization | DB | Test performed | Status |
|---|---|---|---|---|---|---|
| GET | `/api/matches/upcoming` | List upcoming/live matches | Public | Match, Team, Tournament | Source trace; syntax check | PASS |
| GET | `/api/matches/completed` | List completed matches | Public | Match, Team, Tournament | Source trace; syntax check | PASS |
| GET | `/api/matches/tournament/:tournamentId` | List tournament matches | Public | Match, Team | Source trace; syntax check | PASS |
| GET | `/api/matches` | List/filter matches | Public | Match, Team, Tournament | Source trace; syntax check | PASS |
| GET | `/api/matches/:id` | Get match | Public | Match, Team, Tournament | Source trace; syntax check | PASS |
| POST | `/api/matches` | Schedule match | Staff | Match, Tournament, Team | Source trace; syntax check | PASS |
| PUT | `/api/matches/:id` | Update schedule/details | Staff | Match | Source trace; syntax check | PARTIAL |
| PUT | `/api/matches/:id/result` | Record result | Staff | Match | Source trace; syntax check | PARTIAL |
| DELETE | `/api/matches/:id` | Cancel incomplete match | Staff | Match | Source trace; syntax check | PASS |
| GET | `/api/leaderboard` | Build one tournament leaderboard | JWT | Tournament, Match, Team | Source trace; syntax check | PASS |
| GET | `/api/leaderboard/all` | Build all live/completed leaderboards | JWT | Tournament, Match, Team | Source trace; syntax check | PASS (fixed) |

### Payments

| Method | Path | Purpose | Authorization | DB | Test performed | Status |
|---|---|---|---|---|---|---|
| POST | `/api/payments/initiate` | Create pending registration payment | JWT; team captain/admin checked | Payment, Team, Tournament, Registration | Source trace; syntax check | PASS (fixed) |
| POST | `/api/payments/:paymentId/process` | Process test/gateway payment | JWT; payment owner/admin checked | Payment, Registration, Tournament | Source trace; syntax check | PASS (fixed) |
| POST | `/api/payments/callback` | Apply gateway callback | Public | Payment, Registration, Tournament | Source trace; syntax check | FAIL |
| GET | `/api/payments/my-payments` | List current user payments | JWT | Payment, Team, Tournament | Source trace; syntax check | PASS |
| GET | `/api/payments` | List/filter all payments | Staff | Payment | Source trace; syntax check | PASS |
| GET | `/api/payments/stats` | Aggregate payment statistics | Staff | Payment | Source trace; syntax check | PASS (fixed) |
| GET | `/api/payments/:id` | Get payment detail | JWT plus owner/admin check | Payment | Source trace; syntax check | PASS |
| POST | `/api/payments/:id/refund` | Refund paid payment | Staff | Payment, Tournament, Registration | Source trace; syntax check | PARTIAL |

### Notifications and administration

| Method | Path | Purpose | Authorization | DB | Test performed | Status |
|---|---|---|---|---|---|---|
| GET | `/api/notifications` | List current user notifications | JWT | Notification | Source trace; syntax check | PASS |
| GET | `/api/notifications/unread-count` | Count unread notifications | JWT | Notification | Source trace; syntax check | PASS |
| PUT | `/api/notifications/read-all` | Mark all current notifications read | JWT | Notification | Source trace; syntax check | PASS |
| PUT | `/api/notifications/:id/read` | Mark one notification read | JWT plus user ownership | Notification | Source trace; syntax check | PASS |
| DELETE | `/api/notifications/:id` | Delete one owned notification | JWT plus user ownership | Notification | Source trace; syntax check | PASS |
| POST | `/api/notifications` | Create notification | Admin | Notification | Source trace; syntax check | PASS |
| POST | `/api/notifications/broadcast` | Broadcast notifications | Admin | Notification | Source trace; syntax check | PASS |
| GET | `/api/admin/users/stats` | User role statistics | Admin | User | Source trace; syntax check | PARTIAL |
| GET | `/api/admin/users` | Paginated users and related counts | Admin | User, Team, Registration, Payment | Source trace; syntax check | PARTIAL |
| GET | `/api/admin/users/:id` | User details and related records | Admin | User, Team, Registration, Payment | Source trace; syntax check | PARTIAL |
| PUT | `/api/admin/users/:id/role` | Change user role | Admin | User | Source trace; syntax check | PASS |
| PUT | `/api/admin/users/:id/deactivate` | Deactivate user | Admin | User | Source trace; syntax check | PASS (fixed) |
| PUT | `/api/admin/users/:id/activate` | Activate user | Admin | User | Source trace; syntax check | PASS (fixed) |
| GET | `/api/admin/registrations/stats` | Registration statistics | Staff | Registration, Tournament | Source trace; syntax check | PASS |
| GET | `/api/admin/registrations` | Paginated registration administration | Staff | Registration, Payment, Team, Tournament | Source trace; syntax check | PARTIAL |
| GET | `/api/admin/registrations/:id` | Registration/payment detail | Staff | Registration, Payment, Team, Tournament | Source trace; syntax check | PASS |
| POST | `/api/admin/registrations/:id/approve` | Approve paid registration | Staff | Registration, Payment, Tournament, Team | Source trace; syntax check | PARTIAL |
| POST | `/api/admin/registrations/:id/reject` | Reject and possibly refund registration | Staff | Registration, Payment, Tournament | Source trace; syntax check | PARTIAL |

## Confirmed findings and fixes

### Fixed during Task 3

1. **Named GET routes were shadowed by `/:id` routes.** `GET /teams/my-teams`, `GET /players/team/:teamId`, `GET /payments/stats`, and `GET /leaderboard/all` could be routed to the generic ID handler because the parameterized route appeared first. The named routes now precede `/:id`.
2. **Frontend-referenced open-registration route was not registered.** `client/src/api/apiRoutes.js` calls `/tournaments/open-registrations`, but the router previously had only `/` and `/:id`; the request therefore reached `getTournamentById` and failed ObjectId validation. The controller is now imported and the route is registered before `/:id`.
3. **Registration accepted a team from a different tournament.** The controller checked captain ownership but did not compare `team.tournament` with `tournamentId`. A cross-tournament registration was possible. The controller now rejects that mismatch.
4. **Payment initiation did not verify team ownership.** An authenticated user could initiate a payment for another user’s team by supplying its ID. The controller now permits only the team captain or an admin.
5. **Payment processing did not verify payment ownership.** An authenticated user could process another user’s payment by ID. The controller now permits only the payment owner or an admin.
6. **User deactivation was not represented in the schema or enforced by authentication.** Admin controllers wrote `isActive`, but `User` did not define the field and `protect` did not reject inactive users. `User.isActive` now defaults to `true`, and `protect` returns 403 for inactive accounts.

### Confirmed defects remaining

1. **Payment callback has no gateway authentication or signature verification (FAIL).** `POST /api/payments/callback` is public and trusts `transactionId`, `status`, and `gatewayResponse` supplied by the caller. A caller who knows a transaction ID can mark a payment paid and create a registration. A real gateway signing secret/integration is not present in the inspected source. This must be fixed before real payments are enabled.
2. **Callback processing is not idempotent (FAIL/UNVERIFIED at runtime).** Repeated successful callbacks can increment `registeredTeams` repeatedly because the handler finds the existing registration but still increments the tournament count. This is confirmed by source tracing; it was not executed against a database.
3. **Admin user relationship queries use a missing `Registration.userId` field (PARTIAL).** `Registration` stores `teamId` and `tournamentId`, but admin user controllers query `Registration.find({ userId: ... })`; those registration counts/details will be empty or incorrect. The same area returns role counts under `byRole`, while frontend consumers were observed to read top-level role fields.
4. **Registration/payment state transitions can double-count tournament membership (PARTIAL).** Team creation adds the team to `Tournament.teams`; payment processing also adds it and increments `registeredTeams`; admin approval increments again. The exact intended workflow is not runtime-verified, but the source contains multiple independent mutation paths and needs an isolated integration test before production use.
5. **Public player creation lacks an authorization/ownership rule (PARTIAL).** `POST /api/players/add` is public and accepts an arbitrary `teamId`. This may be intentional for the public registration form, but it allows unauthenticated writes to team rosters and was not live-tested. Product intent must be confirmed before changing it.
6. **Contact endpoint bypasses centralized response/error handling (PARTIAL).** It accepts `req.body` directly, has no explicit validation, and returns a different response shape. It can still be reached, but it is inconsistent with the other API contracts.
7. **Database connection failure exits the process (PARTIAL).** `config/db.js` calls `process.exit(1)` on connection failure while `app.js` invokes `connectDB()` during module import. This is risky for serverless cold starts and prevents controlled error handling. Vercel behavior was not tested.
8. **Duplicate error middleware exists (PARTIAL).** `errorMiddleware.js` is not mounted; `centralizedErrorHandler.js` is active. The duplicate response shape is configuration drift.

## Middleware, validation, and error handling assessment

- JWT verification, user loading, role checks, ObjectId checks, required-field checks, and many domain-specific validations are present.
- `protect` now rejects inactive users, but it accepts any header beginning with `Bearer` rather than requiring the exact `Bearer <token>` form.
- Controllers generally use `asyncHandler`, but contact uses a separate try/catch and response format.
- Centralized error logging includes request bodies. This is a logging/privacy risk because authentication or payment payloads could be written to logs; no log output containing secrets was generated during this audit.
- Several update operations use `req.body` directly (notably team and tournament updates), relying on Mongoose strictness rather than an allowlist. This is a validation-hardening item, not runtime-verified.

## Commands and tests actually executed

| Command/check | Result |
|---|---|
| Read `audit-reports/01-project-inventory.md` and `audit-reports/02-frontend-audit.md` | PASS |
| Source inspection of all backend routes/controllers/models/middleware and client API wrappers | PASS |
| Route registration and import searches with ripgrep | PASS |
| `node --check` on all backend files changed in Task 3 | PASS |
| Backend package script inspection | No `test`, `lint`, or `typecheck` script exists |
| Backend automated tests | NOT TESTED; no project backend test suite was found |
| MongoDB/API integration tests | BLOCKED; no isolated test database credentials were available and production/unknown local data was not used |
| Payment gateway tests | BLOCKED; no gateway SDK/credentials/integration test environment was available |
| Browser tests | NOT TESTED; outside this backend task |

No dependencies were added. No destructive database operation was executed.

## Files modified during Task 3

The following application files were modified for confirmed defects:

- `server/routes/teamRoutes.js`
- `server/routes/playerRoutes.js`
- `server/routes/paymentRoutes.js`
- `server/routes/notificationRoutes.js`
- `server/routes/leaderboardRoutes.js`
- `server/routes/tournamentRoutes.js`
- `server/controllers/registrationController.js`
- `server/controllers/paymentController.js`
- `server/models/User.js`
- `server/middleware/authMiddleware.js`

No files were deleted. The working tree contained extensive pre-existing staged, modified, and untracked changes before this task; those changes were preserved and not reset or overwritten.

## Remaining defects, blockers, and unverified items

- Payment callback authentication/signature verification and idempotency remain release blockers for real payment processing.
- MongoDB connectivity, indexes, actual route dispatch, authorization responses, transactionality, and persistence were not runtime-verified.
- No isolated test database or test credentials were available.
- No backend test/lint/type-check infrastructure exists.
- Vercel serverless cold-start and connection-reuse behavior is unverified.
- Admin registration count behavior and admin user relationship reporting need an isolated workflow test.
- Public player creation authorization requires product-owner clarification.

## Next task prerequisites

Task 4 (integration audit) should provide isolated MongoDB test credentials/database and non-production JWT test users for player, organizer, and admin roles. It should exercise route dispatch for every named-vs-parameterized path, authentication/authorization failures, registration/payment state transitions, duplicate callbacks, and frontend response parsing. Payment gateway callbacks should be mocked or tested with a documented sandbox signature mechanism; production payment credentials must not be used.

