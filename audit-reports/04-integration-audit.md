# Task 4 - End-to-End Frontend, Backend, and API Communication Audit

**Date:** 2026-10-19  
**Status:** PARTIAL

## Scope

This audit traced the implemented frontend-to-backend communication for authentication, teams, tournaments, registrations, matches, results, leaderboards, payments, notifications, and administration.

The trace followed:

`frontend event -> API wrapper or request -> HTTP route -> middleware -> controller -> Mongoose model -> response helper -> Axios interceptor -> component state/UI`

The audit included source inspection and local build/lint checks. A live isolated MongoDB/API test environment was not available, so runtime claims are explicitly marked **BLOCKED** or **NOT TESTED**.

## Files and components examined

- Prior reports: `audit-reports/00-execution-rules.md` through `audit-reports/03-backend-api-audit.md`
- Client transport: `client/src/api/axiosConfig.js`, `client/src/api/apiRoutes.js`
- Application routing/auth: `client/src/App.jsx`, `client/src/hooks/useAuth.js`, `client/src/components/ProtectedRoute.jsx`
- User workflows: `client/src/pages/Auth/Login.jsx`, `Signup.jsx`, `Dashboard/UserDashboard.jsx`, `TeamManagement/TeamManagement.jsx`, `TournamentRegistration/TournamentRegistration.jsx`, `Payment/Payment.jsx`, `Matches/Matches.jsx`, `Results/Results.jsx`, `Leaderboard/Leaderboard.jsx`, `Bracket/Bracket.jsx`
- Admin workflows: `Admin/AdminDashboard.jsx`, `Admin/AdminMatches.jsx`, `Admin/AdminPayments.jsx`, `Admin/AdminRegistrations.jsx`, `Admin/AdminUsers.jsx`, `Admin/AdminTeams.jsx`, `Admin/AdminTournaments.jsx`
- Other callers: `Home/Home.jsx`, `Register/Register.jsx`, `Register/TeamRegister.jsx`, `Players/PlayerList.jsx`, `Players/PlayerDetails.jsx`, `Teams/TeamList.jsx`, `Teams/TeamDetails.jsx`, `Tournaments/TournamentList.jsx`, `Contact/Contact.jsx`
- Backend transport and entry points: `server/app.js`, `api/index.js`, `server/config/db.js`, `server/middleware/authMiddleware.js`, `server/middleware/adminMiddleware.js`, `server/middleware/centralizedErrorHandler.js`
- Backend routes/controllers/models: all files under `server/routes/`, `server/controllers/`, and `server/models/`
- Deployment/dev configuration: `vercel.json`, `client/vercel.json`, `client/vite.config.js`, `server/.env.example`

## API base URL, headers, and deployment behavior

| Environment | Configuration | Assessment |
|---|---|---|
| Local frontend development | Axios `baseURL: "/api"` and Vite proxy to `http://localhost:5000` | PASS by source; live server test BLOCKED |
| Production frontend/API | Same-origin `/api`; root `vercel.json` rewrites `/api/*` to the serverless path and exports `api/index.js` | PARTIAL; Vercel execution NOT TESTED |
| Separate frontend/backend deployment | Backend CORS allows `FRONTEND_URL` plus localhost origins | PARTIAL; actual origin/preflight NOT TESTED |
| Test environment | No separate API base URL, Vite mode, test config, or test database configuration found | FAIL for repeatable isolated integration testing |

The client sends JSON with `Content-Type: application/json`. The Axios request interceptor attaches the local JWT as a bearer token. Successful backend responses are wrapped as `{ success, message, data }`; the Axios response interceptor returns `data` directly. Error messages are extracted from `{ message }`.

## End-to-end contract matrix

The matrix records the actual caller and backend route. `Source` means the complete contract was traced in code; it is not a live pass.

### Authentication and session

| Caller/event | Exact request | Backend flow | Expected response/state | Actual evidence | Defect | Status |
|---|---|---|---|---|---|---|
| `Login.handleLogin` submit | `POST /api/auth/login`, `{ emailOrUsername, password }` | `authRoutes -> loginUser -> User.findOne/matchPassword` | Token/user stored; redirect by server role | Payload matches controller; Axios unwraps `data` | Credential/runtime test unavailable | PARTIAL |
| `Signup.handleSubmit` | `POST /api/auth/register`, username/email/password/role | `authRoutes -> registerUser -> User.create` | Token/user stored | Payload and response fields match source | Runtime unavailable | PARTIAL |
| `useAuth` restoration | No request; localStorage token/user | `ProtectedRoute` waits for hook loading | Protected UI rendered only with user | Source trace | JWT validity is not rechecked on reload | PARTIAL |
| Axios 401 response | Any protected request | Axios removes token/user and dispatches `userUpdated` | Auth state clears and UI can redirect | Fixed in this task | Live expiry test unavailable | PARTIAL |

### Tournaments and teams

| Caller/event | Exact request | Backend flow | Expected response/state | Actual evidence | Defect | Status |
|---|---|---|---|---|---|---|
| `TournamentList` load/filter | `GET /api/tournaments?status=&game=&limit=` | `tournamentRoutes -> getAllTournaments -> Tournament.find` | Array rendered | Query names match controller | Backend does not validate status/game/limit values | PARTIAL |
| `TournamentList` create | `POST /api/tournaments` | `protect + staffOnly -> createTournament -> Tournament.create` | Created tournament, list reload | Fixed earlier; build passes | Live role/API test unavailable | PARTIAL |
| `TournamentList` delete | `DELETE /api/tournaments/:id` | `protect + staffOnly -> soft delete` | List reload | Path/method match | Live test unavailable | PARTIAL |
| `TournamentDetails` load | `GET /api/tournaments/:id` | `getTournamentById -> Tournament.populate(teams)` | Detail state rendered | Field names match | Runtime unavailable | PARTIAL |
| `TeamManagement` list | `GET /api/teams/my-teams` | `protect -> getMyTeams` | Team list rendered | Route ordering was fixed in Task 3 | Runtime unavailable | PARTIAL |
| `TeamManagement` create/update | `POST /api/teams` or `PUT /api/teams/:id` | Auth/controller ownership -> Team/Tournament writes | Current team/list refreshed | Payload names match controller | Create navigation relies on returned `_id`; untested | PARTIAL |
| `TeamManagement` delete | `DELETE /api/teams/:id` | Auth/controller ownership -> soft delete | Navigate/list refresh | Wrapper contract matches | Runtime unavailable | PARTIAL |
| `TeamManagement` add player | `POST /api/players/add` | Public route -> `addPlayer -> Player.create` | Team reload | Payload matches controller | Backend route is publicly writable and does not enforce team ownership | FAIL |
| `TeamManagement` remove player | `DELETE /api/players/:id` | `protect + staffOnly -> deletePlayer` | Player removed | Replaced direct `fetch` with shared `deletePlayer` wrapper | UI allows captain-facing removal, but backend permits staff only; likely workflow mismatch | FAIL |

### Registration and payment

| Caller/event | Exact request | Backend flow | Expected response/state | Actual evidence | Defect | Status |
|---|---|---|---|---|---|---|
| `TournamentRegistration` load | `GET /api/tournaments/:id` and `GET /api/teams/my-teams` | Public tournament + JWT teams | Eligible teams rendered | Paths and fields match | Runtime unavailable | PARTIAL |
| Free registration submit | `POST /api/registrations/team`, `{ teamId, tournamentId }` | `protect -> ownership/status/deadline -> Registration.create + Tournament.save` | Success then dashboard | Payload matches; cross-tournament check fixed in Task 3 | Registration count mutation not transaction-safe | PARTIAL |
| Paid registration submit | `POST /api/payments/initiate`, team/tournament/amount/method | `protect -> ownership -> Payment.create` | Navigate to `/payment/:paymentId` | Fixed this task: paid flow no longer creates registration first | Live payment test unavailable | PARTIAL |
| Payment page load | `GET /api/payments/:id` | `protect -> owner/admin -> Payment.populate` | Payment summary rendered | Fields match payment model | Runtime unavailable | PARTIAL |
| Test payment submit | `POST /api/payments/:paymentId/process`, `{ testMode: true }` | `protect -> owner/admin -> Payment paid + Registration/Tournament writes` | Success/dashboard | Path and payload match | Backend increment can duplicate if prior registration exists; not fully fixed | FAIL |
| Admin refund | `POST /api/payments/:id/refund`, `{ reason }` | `protect + staffOnly -> refundPayment` | Refund and registration removal | Fixed this task: caller now sends object, not string | Payment runtime unavailable | PARTIAL |

### Matches, results, leaderboard

| Caller/event | Exact request | Backend flow | Expected response/state | Actual evidence | Defect | Status |
|---|---|---|---|---|---|---|
| `Matches` load | `GET /api/matches/upcoming`, `GET /api/matches/completed?limit=100` | Public match queries | Tabs render arrays | Paths match | Backend ignores `limit`; client filters locally | PARTIAL |
| `Results` load | `GET /api/matches/completed?limit=200` | Completed match query | Results list | Removed an unnecessary failing `GET /api/leaderboard` without tournament ID | Backend still ignores limit | PASS (source) |
| `Results` leaderboard tab | `GET /api/leaderboard?tournamentId=...` | JWT -> leaderboard aggregation | Selected leaderboard rendered | Query name matches controller | Runtime unavailable | PARTIAL |
| `Leaderboard` load | `GET /api/leaderboard/all` then `/api/leaderboard?tournamentId=...` | JWT -> aggregation | Tournament list/standings | Route ordering fixed in Task 3 | Runtime unavailable | PARTIAL |
| `Bracket` load | `GET /api/tournaments/:id` and `GET /api/matches/tournament/:tournamentId` | Public queries, client requires user | Bracket grouped by round | Paths/fields match | Route is declared public but component redirects unauthenticated users; policy inconsistency | PARTIAL |
| `AdminMatches` create/update/result/delete | `POST/PUT/DELETE /api/matches...` | `protect + staffOnly` controllers | Admin list refresh/state update | Methods and payload names traced | No live role test; scheduling writes are not transactional | PARTIAL |

### Administration and notifications

| Caller/event | Exact request | Backend flow | Expected response/state | Actual evidence | Defect | Status |
|---|---|---|---|---|---|---|
| `UserDashboard` notifications | `GET /api/notifications`, `/unread-count` | JWT user filters | Notifications/count render | Paths and response fields match | `Promise.allSettled` can silently show partial data without warning | PARTIAL |
| Dashboard mark all/one read | `PUT /api/notifications/read-all` or `PUT /api/notifications/:id/read` | JWT ownership update | Local notification state updates | Replaced direct `fetch` with shared wrappers | Runtime unavailable | PASS (source) |
| `AdminUsers` list/stats | `GET /api/admin/users`, `/stats` | Admin middleware/controllers | Pagination/stats render | Fixed frontend `byRole` mapping this task | Backend relationship queries use nonexistent `Registration.userId` | FAIL |
| `AdminUsers` role/status actions | `PUT /api/admin/users/:id/role`, `/deactivate`, `/activate` | Admin middleware -> User update | Row state updates | Methods/fields match | Runtime unavailable | PARTIAL |
| `AdminRegistrations` list/stats/actions | `GET /api/admin/registrations`, `/stats`; `POST /:id/approve|reject` | Staff middleware/controllers | Table/actions render | Contract paths match | Registration has no status field; payment-status filtering occurs after pagination | FAIL |
| `AdminPayments` list/stats/refund | `GET /api/payments`, `/stats`; `POST /:id/refund` | Staff middleware/controllers | Table/stats/refund refresh | Refund payload fixed | Backend list does not provide pagination/search despite UI controls | FAIL |
| `AdminTournaments` and `AdminTeams` | No API request | Local React state only | UI appears to create/delete data | Source inspection confirms mock data | Admin screens do not persist changes or reload backend data | FAIL |

## Confirmed integration defects and fixes applied

1. **Paid registration double-counting / duplicate workflow (HIGH).** The client previously called `registerTeam` before `initiatePayment`. The backend registration path increments `registeredTeams`; the payment completion path also increments it and creates/uses a registration. The paid client path now initiates payment first; only free tournaments call `registerTeam`.
2. **Direct notification/player requests bypassed shared transport (MEDIUM).** Dashboard notification actions and team player deletion used `fetch`, did not share Axios error normalization, and did not reliably throw on HTTP error responses. They now use the centralized API wrappers. `deletePlayer` was added to `apiRoutes.js`.
3. **Expired JWT did not notify active auth state (MEDIUM).** Axios removed localStorage values on 401 but did not dispatch the application’s `userUpdated` event. The interceptor now removes the legacy role and dispatches the event.
4. **Admin refund reason payload was malformed (MEDIUM).** `refundPayment` expects an object and the controller destructures `req.body.reason`; the UI passed a string. The UI now sends `{ reason }`.
5. **Admin user statistics response shape mismatch (MEDIUM).** Backend returns `byRole.players/organizers/admins`, while the UI read top-level fields. The UI now maps the nested response to its display model.
6. **Results page made an invalid unnecessary request (LOW).** It called `/api/leaderboard` without the required `tournamentId` and swallowed the 400 using `Promise.allSettled`. The request was removed; leaderboard loading remains tied to a selected tournament.

## Findings and severity

### HIGH / release-impacting

- Paid workflow still has backend-side duplicate-count risk on retries or pre-existing registrations. Payment completion and tournament membership need an atomic/idempotent operation.
- Payment callback remains unauthenticated and lacks signature verification, as documented in Task 3.
- Admin tournament and team screens are local mock implementations; UI actions do not reach the backend.

### MEDIUM

- No isolated test configuration or API base URL exists. The application cannot be reproducibly tested against a dedicated test database without manually replacing environment settings.
- Admin registration and payment pagination/filter controls do not match backend capabilities.
- Player removal UI and backend authorization disagree: the UI is available in team management, while the route is staff-only.
- Admin user detail relationship queries use schema fields that do not exist.
- `Promise.allSettled` in the dashboard can hide partial API failures and present an apparently healthy page with missing sections.

### LOW

- Backend ignores some client `limit` query parameters for completed/upcoming match endpoints.
- Results and some feature pages contain dead imports/unused variables; frontend lint remains failing.
- Bracket access policy differs between route declaration and component-level login redirect.

## Commands and tests actually executed

| Command/check | Result |
|---|---|
| Read reports 00, 01, 02, and 03 | PASS |
| Source trace of client callers, API wrappers, routes, controllers, middleware, and models | PASS |
| `npm run build` from `client` | PASS; Vite production build completed |
| `npm run lint` from `client` | FAIL; 39 pre-existing/remaining errors, including unused variables and JSX escaping issues |
| `node --check server/app.js` and changed backend controllers | PASS |
| Route and caller searches with ripgrep | PASS |
| Browser end-to-end tests | NOT TESTED |
| Live API requests | BLOCKED; no isolated backend/database credentials were available |
| MongoDB test database operations | BLOCKED; no isolated test database was supplied |
| Payment gateway sandbox/callback tests | BLOCKED; no gateway credentials or signature mechanism was configured |
| Vercel deployment/serverless execution | NOT TESTED |

No production endpoint was called, no database mutation was executed, and no dependency was added.

## Files modified during Task 4

- `client/src/api/apiRoutes.js`
- `client/src/api/axiosConfig.js`
- `client/src/pages/Dashboard/UserDashboard.jsx`
- `client/src/pages/TeamManagement/TeamManagement.jsx`
- `client/src/pages/TournamentRegistration/TournamentRegistration.jsx`
- `client/src/pages/Admin/AdminPayments.jsx`
- `client/src/pages/Admin/AdminUsers.jsx`
- `client/src/pages/Results/Results.jsx`
- `audit-reports/04-integration-audit.md`

Pre-existing changes in all other files were preserved. No files were deleted.

## Blockers and unverified items

To complete runtime integration verification, provide:

1. A dedicated MongoDB database/cluster or local MongoDB instance with a disposable database name.
2. Test accounts for player, organizer, and admin roles, or permission to create them in that isolated database.
3. A controlled `JWT_SECRET` and `FRONTEND_URL` for the test environment.
4. A payment sandbox or a documented mock callback signature.
5. A browser test runner or permission to use the local browser against a running test server.

Manual test procedure once available:

1. Set `MONGO_URI` to the isolated database and `FRONTEND_URL` to the test frontend origin.
2. Start `server/server.js` on a non-production port and verify `GET /api/health`.
3. Start Vite with its proxy and exercise each matrix row with player, organizer, and admin accounts.
4. Verify database counts before and after free registration, paid payment completion, retry, callback replay, refund, and rejection.
5. Capture HTTP status, request payload shape, response body shape, browser console output, and rendered state.
6. Remove or rotate all test credentials after the run.

## Next task prerequisites

Task 5 (database audit) should use the same isolated database and verify schema/index behavior, duplicate registration/payment handling, transactionality, population results, and count consistency. It should specifically test paid registration retry/idempotency and the missing `Registration.userId` relationship assumptions before any production release.

