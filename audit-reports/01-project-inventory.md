# Task 1 — Complete Project Inventory and Architecture Discovery

**Date:** 2026-10-19  
**Status:** PARTIAL  
**Scope:** Local working tree at `E:\project\esports platform`. This task was limited to inventory and architecture discovery. No application source file, dependency manifest, deployment configuration, or Git history was modified.

## Scope and evidence boundary

This report distinguishes source inspection from executed verification:

- **Source inspection:** directory/file inventory, route and import inspection, manifest/configuration review, environment-variable name search, and Git metadata inspection.
- **Runtime/tool verification:** `npm run build`, `npm run lint`, and `npm ls --depth=0` were executed locally.
- **Not verified:** MongoDB Atlas connectivity, authenticated API behavior, payment gateway behavior, Vercel deployment behavior, browser workflows, production environment configuration, and external GitHub state. No credentials were available or used.

## Files and components examined

### Root

- `package.json`, `package-lock.json` — root dependency manifest/lockfile.
- `README.md`, `CSS_ANALYSIS.md` — project and styling documentation.
- `deploy.sh` — shell deployment-preparation script.
- `vercel.json` — root Vercel build, environment, and rewrite configuration.
- `.gitignore` — repository exclusions.
- `api/index.js` — Vercel/serverless adapter exporting the Express app.
- `audit-reports/` — audit deliverables; `00-execution-rules.md` pre-existed from the audit setup and this report was added for Task 1.

### Frontend: `client/`

Purpose: React single-page application built with Vite.

- Entry/configuration: `index.html`, `vite.config.js`, `eslint.config.js`, `package.json`, `package-lock.json`, `vercel.json`, `README.md`.
- `src/main.jsx` — React DOM bootstrap and `StrictMode`.
- `src/App.jsx` — `AuthProvider`, `BrowserRouter`, global layout, route table, background video, navbar/footer.
- `src/api/axiosConfig.js` — Axios instance, `/api` base URL, JWT request interceptor, response/error handling.
- `src/api/apiRoutes.js` — client API wrapper functions for auth, tournaments, teams, registrations, players, matches, payments, notifications, leaderboard, admin, and contact.
- `src/context/AuthContext.js`, `src/context/AuthProvider.jsx`, `src/hooks/useAuth.js` — authentication state and localStorage session handling.
- `src/components/` — `Navbar`, `Footer`, `ProtectedRoute`, and `ConfirmModal`.
- `src/pages/` — public and authenticated features:
  - `Admin/`: dashboard, tournaments, teams, matches, payments, registrations, users.
  - `Auth/`: login and signup.
  - `Bracket/`, `Dashboard/`, `Leaderboard/`, `Matches/`, `Payment/`, `Results/`, `TeamManagement/`, `TournamentRegistration/`.
  - `Contact/`, `Home/`, `Players/`, `Register/`, `Registrations/`, `Reports/`, `Teams/`, `Tournaments/`, `Users/`, and `Unauthorized.jsx`.
- `src/styles/` — feature CSS including admin, bracket, dashboard, leaderboard, matches, payment, results, team management, tournament registration, shared theme, and older public-page styles.
- `public/` — favicon, Vite asset, and asset placeholder directories.

Inventory count from the local tree: **63 files under `client/src`**.

### Backend: `server/`

Purpose: Node.js CommonJS Express API and local server entry point.

- `server.js` — local HTTP server entry point; loads dotenv, imports `app`, listens on `PORT`, and registers process error/shutdown handlers.
- `app.js` — Express application factory/configuration used locally and by Vercel; JSON/urlencoded parsing, CORS, optional development Morgan logging, route mounting, root/health endpoints, 404 handling, and centralized error handling.
- `config/db.js` — Mongoose connection and connection event handlers.
- `constants/appConstants.js` — application constants.
- `controllers/` — 12 controllers for auth, users, registrations, teams, tournaments, players, contact, matches, payments, notifications, and leaderboard.
- `routes/` — 12 routers corresponding to those controller areas.
- `models/` — 10 Mongoose models: `User`, `Team`, `Player`, `Tournament`, `Registration`, `Match`, `MatchSchedule`, `Payment`, `Notification`, and `Contact`.
- `middleware/` — JWT authentication, role authorization, centralized error handling, and a second `errorMiddleware.js` implementation.
- `utils/` — token generation, response helpers, email helper, S3 upload helper, environment validation, and validators.
- `createAdmin.js` — standalone admin-seeding script.
- `.env.example` — environment-variable template. `server/.env` exists locally but is ignored and was not read or printed.
- `package.json`, `package-lock.json` — backend dependency manifest/lockfile.

Inventory count from the local tree: **12 controllers, 12 routes, 10 models, 4 middleware files, 2 config files, and 6 utility files**.

### Serverless/API adapter: `api/`

- `api/index.js` imports `../server/app` and exports it as the Vercel function handler.
- There is no separate API implementation in `api/`; the application is shared with the Express backend.

### Documentation

- `README.md`
- `CSS_ANALYSIS.md`
- `client/README.md`
- `docs/PROJECT_EXPLANATION.md`

The documentation describes a MERN application, but parts of `PROJECT_EXPLANATION.md` describe packages/features not present in the current manifests or source (see risks below).

## Actual technology stack

**Confirmed by manifests and source:**

- Frontend: React 19, React Router DOM 6, Axios, Vite 7, ESLint 9.
- Backend: Node.js CommonJS, Express 4, Mongoose 8, JSON Web Tokens, bcryptjs, CORS, Morgan, dotenv, uuid.
- Database layer: MongoDB accessed through Mongoose.
- Deployment adapter: Vercel-compatible `api/index.js` exporting the Express app; root Vercel configuration builds the Vite client.
- Authentication: JWT bearer tokens, bcrypt password hashing, role checks for `admin` and `organizer`.
- Payment domain: payment model/controller/routes and a client payment page. The configured implementation includes a `test` payment mode and enum values for Stripe, Razorpay, PayPal, and manual payments, but no Stripe/Razorpay/PayPal SDK dependency was found.
- External-service helpers: AWS/S3 and email utility files exist, but their files were empty in the inspected working tree and no corresponding SDK dependency was present in `server/package.json`.

## Frontend architecture and entry points

1. `client/index.html` provides the Vite HTML shell.
2. `client/src/main.jsx` mounts `App` at the root element.
3. `client/src/App.jsx` builds the route tree and global layout.
4. `AuthProvider` supplies session state; `ProtectedRoute` gates authenticated and role-specific pages.
5. `axiosConfig.js` sends API calls to same-origin `/api` and attaches localStorage JWTs.
6. `apiRoutes.js` centralizes most endpoint paths.

The route table exposes public tournament/team/player/contact pages, authenticated dashboard/match/result/leaderboard/payment pages, and admin/organizer pages. Source inspection confirms route declarations only; it does not prove each screen works in a browser.

## Backend architecture and API entry points

### Local entry points

- `server/server.js`: `node server.js` / `npm start`; listens on port 5000 unless `PORT` is set.
- `server/app.js`: reusable Express app.

### Vercel entry point

- `api/index.js` exports `server/app.js`.
- Root `vercel.json` uses `cd client && npm run build`, outputs `client/dist`, and declares `/api/*` and SPA rewrites.
- `client/vercel.json` contains a separate catch-all rewrite to `/`.

### Mounted API route groups

`server/app.js` mounts:

- `/api/auth`
- `/api/teams`
- `/api/players`
- `/api/tournaments`
- `/api/registrations`
- `/api/contact`
- `/api/matches`
- `/api/payments`
- `/api/notifications`
- `/api/leaderboard`
- `/api/admin/users`
- `/api/admin/registrations`

It also exposes `GET /`, `GET /api/health`, a JSON 404 response, and a centralized error handler.

## Database architecture

The database layer uses Mongoose and connects using `process.env.MONGO_URI`. Models and important relationships discovered by source inspection:

- `User`: username/email uniqueness, password hash, role enum.
- `Team`: tournament and captain references; unique tournament/team-name index.
- `Player`: optional team reference.
- `Tournament`: team references, status/type/format enums, date and registration fields, soft-delete flag, indexes.
- `Registration`: team and tournament references.
- `Match`: tournament/team references, rounds, scores, result/status.
- `MatchSchedule`: tournament and team references; appears to be a separate scheduling representation from `Match`.
- `Payment`: user/team/tournament/registration references, status/payment-method enums, transaction ID, gateway response.
- `Notification`: user reference, notification type, related entity.
- `Contact`: contact form records.

`connectDB()` is called during `app.js` import and catches connection failure by logging and calling `process.exit(1)`. Whether that behavior is safe/reliable in the Vercel serverless lifecycle is **not runtime verified**.

## Authentication architecture

- Registration and login are implemented in `authController.js`.
- Passwords are hashed in the `User` Mongoose pre-save hook using bcryptjs.
- JWTs are signed with `process.env.JWT_SECRET` and expire after seven days.
- `authMiddleware.js` reads `Authorization: Bearer <token>`, verifies the token, loads the user, and excludes the password field.
- `adminMiddleware.js` composes `protect` with role checks for `admin` or `organizer`.
- The frontend persists JWT/user data in localStorage and attaches the token with Axios.

Source inspection identified a request-contract concern for later integration testing: the backend login controller expects `emailOrUsername`, while the frontend `AuthProvider.login` sends `{ email, password }`; individual login page code and actual API behavior must be traced in the frontend/integration tasks.

## Payment and external services

- Payment UI/API wrappers exist in `client/src/pages/Payment/Payment.jsx` and `client/src/api/apiRoutes.js`.
- Backend payment routes/controller/model exist.
- Payment methods include `test`, and the controller checks development/test mode.
- No live payment SDK package was found in the backend manifest.
- `server/config/awsConfig.js`, `server/utils/uploadToS3.js`, and `server/utils/sendEmail.js` are present but were empty when inspected; no AWS SDK or mail transport dependency was found.
- Therefore, live payment, email, and S3 integrations are **NOT TESTED** and should not be considered implemented solely from filenames or enum values.

## Environment-variable names

Names discovered from source/configuration, without reading secret values:

| Name | Referenced/declared by | Purpose |
|---|---|---|
| `PORT` | `server.js`, `validateEnv.js`, `.env.example` | HTTP port |
| `NODE_ENV` | `app.js`, error middleware, payment controller, `validateEnv.js`, Vercel config | Runtime mode |
| `MONGO_URI` | `config/db.js`, `createAdmin.js`, `validateEnv.js`, Vercel config | MongoDB connection |
| `JWT_SECRET` | auth controller, auth middleware, `validateEnv.js`, Vercel config | JWT signing/verification |
| `FRONTEND_URL` | `app.js`, `.env.example`, Vercel config | CORS origin |
| `JWT_EXPIRE` | `.env.example` only | Declared but not observed in token generation |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | `.env.example` only | Optional email settings |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` | `.env.example` only | Optional S3 settings |
| `MAX_FILE_SIZE`, `ALLOWED_IMAGE_TYPES` | `.env.example` only | Application upload settings |

The local `client/.env` and `server/.env` files exist but were intentionally not opened. The root `.gitignore` ignores `.env` and `.env.*` while allowing example files. The sensitive-file check found no tracked environment/secret-like files.

## Package manifests and lockfiles

| Location | Type | Key observation |
|---|---|---|
| `package.json` | Root manifest | Contains only `mongodb`; no root scripts |
| `package-lock.json` | Root lockfile | Present |
| `client/package.json` | Frontend manifest | Has `dev`, `build`, `lint`, `lint:fix`, `preview`; no test script |
| `client/package-lock.json` | Frontend lockfile | Present |
| `server/package.json` | Backend manifest | Has `start` and `dev`; no test/lint script |
| `server/package-lock.json` | Backend lockfile | Present |

Installed dependency inspection completed successfully for client and server with `npm ls --depth=0`; the installed versions satisfy the manifests but are newer patch/minor versions in places due to semver ranges.

## Tests, linting, formatting, and CI/CD

- No test files, test scripts, Jest/Vitest/Playwright/Cypress configuration, or coverage configuration were found in the non-generated project tree.
- No `.github/workflows`, Dockerfile, docker-compose file, Makefile, or other CI workflow file was found.
- Frontend ESLint is configured through `client/eslint.config.js`.
- No backend lint or formatter script/configuration was found.
- `client/npm run build`: **PASS**, Vite transformed 142 modules and emitted `client/dist`.
- `client/npm run lint`: **FAIL**, 51 ESLint errors across frontend files, including unused variables, unescaped JSX entities, undefined identifiers (`setData`, `fetchData`), and browser-side use of undefined `process`.
- Backend startup and API tests were not run because startup attempts to connect to the configured database and no isolated test database/credentials were provided.

## Generated and excluded content

The following were present locally and excluded from the source inventory:

- `client/node_modules/`
- `server/node_modules/`
- `client/dist/`
- `client/node_modules/.vite/`
- nested package distribution directories under `node_modules`
- `.git/`

These are generated/dependency/cache content, not missing application source. `client/dist` was produced/updated by the executed build and remains generated output. Existing `server/.env` and `client/.env` are local configuration files and were not inspected.

## Git status and pre-existing changes

Executed commands: `git status --short`, `git branch --show-current`, `git remote -v`, and `git log --oneline -5`.

- Current branch: `main`.
- Git reports no commits yet; `git log` returns `fatal: your current branch 'main' does not have any commits yet`.
- No remote URL was displayed by `git remote -v` in this checkout.
- The index already contains many staged additions (`A`) and staged-plus-working-tree modifications (`AM`).
- There are also many untracked files, including `api/`, `audit-reports/`, expanded admin/payment/match features, `docs/`, root deployment files, and additional server models/routes/controllers.
- These changes pre-date this Task 1 report. No application files were changed during this task.
- The only intended Task 1 output added is `audit-reports/01-project-inventory.md`; the audit directory/report setup was already present from the prior execution-rules step.

## Findings and severity

### Confirmed findings

1. **HIGH — Frontend lint gate fails.** `npm run lint` produced 51 errors, including two `no-undef` errors (`setData` and `fetchData`) and a browser-side `process` reference. This is a confirmed quality/build-pipeline defect even though the production bundle build passes.
2. **MEDIUM — No automated test suite or test command exists.** No test files or test script were found. Functional behavior cannot be regression-verified automatically from the repository.
3. **MEDIUM — No CI/CD workflow is present.** No GitHub Actions, Docker, or equivalent checked-in pipeline configuration was found.
4. **MEDIUM — Repository provenance is incomplete in this checkout.** The current branch has no commits and no configured remote output, so history, origin integrity, and upstream comparison cannot be verified locally.
5. **MEDIUM — Documentation/configuration drift.** Documentation claims Helmet, compression, rate limiting, AWS SDK, email tooling, and other capabilities that were not found in the current manifests/source.
6. **MEDIUM — Multiple deployment configurations require reconciliation.** Root `vercel.json`, `client/vercel.json`, and `api/index.js` describe different deployment scopes/rewrite behavior. Their deployed interaction was not verified.
7. **LOW — Duplicate/overlapping implementations exist.** `server/middleware/centralizedErrorHandler.js` and `server/middleware/errorMiddleware.js` both define error/response helper behavior; `server/models/Match.js` and `MatchSchedule.js` represent overlapping scheduling concepts. Whether both are intentionally used requires route-level tracing.
8. **LOW — Root dependency manifest is inconsistent with the application layout.** The root manifest contains only `mongodb`, while runtime dependencies are split into client/server manifests and the root has no scripts. This may be intentional for a monorepo but is not documented as an install/build contract.

### Suspected or unverified risks

- The login request field mismatch described in the authentication section is a **suspected integration defect** until the actual login page and API request are tested.
- Vercel serverless database connection reuse, startup failure handling, and rewrite correctness are **unverified**.
- Live payment gateway, AWS/S3 upload, email delivery, MongoDB Atlas connectivity, authorization boundaries, and production CORS are **unverified**.
- Local `.env` files exist; they are ignored and were not reported as tracked, but their contents and validity were intentionally not inspected.

## Files created or modified during Task 1

| Action | Path |
|---|---|
| Created | `audit-reports/01-project-inventory.md` |
| Modified | None |
| Deleted | None |

## Recommended task order

1. Frontend audit: route/page behavior, API contracts, state handling, and lint blockers.
2. Backend API audit: route coverage, validation, authorization, error behavior, and duplicate middleware usage.
3. Integration audit: frontend/backend request contracts using isolated credentials/data.
4. Database audit: schema/index consistency and safe isolated MongoDB verification.
5. Testing audit: establish the actual current test baseline and coverage gaps without adding unnecessary tooling.
6. Security/performance audit.
7. DevOps/deployment audit, including Vercel configuration reconciliation.
8. Regression verification after approved fixes.
9. Final production-readiness assessment.

## Next task prerequisites

Task 2 can begin from this checkout with no code changes required. For runtime integration and database claims, provide or configure an isolated test MongoDB database and non-production test credentials. Production/Vercel verification additionally requires authorized access to deployment logs and environment configuration; no production changes should be made without explicit approval.

