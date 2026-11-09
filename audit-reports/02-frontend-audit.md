# Task 2 — Frontend Quality and Functionality Audit

**Date:** 2026-10-19  
**Status:** PARTIAL  
**Scope:** React/Vite frontend under `client/`, including route declarations, shared components, authentication state, API clients, feature pages, forms, styling/assets, and safe local build/lint verification.

## Scope and verification boundary

This audit used source inspection and local commands. No browser session was available for this task, so browser-console, responsive-layout, keyboard/screen-reader, and end-to-end API behavior are **NOT TESTED** rather than inferred from source.

- **Source-inspected:** all frontend source directories and page/component/API files, route declarations, navigation targets, form handlers, API calls, auth state, public assets, and CSS/configuration.
- **Executed:** `npm run build`, `npm run lint`, targeted searches for routes/API calls/assets, and Git status inspection.
- **Not executed:** type checking (no type-check script/config), automated tests (no test script/files), browser testing, live backend calls, MongoDB/payment testing, and deployment testing.

## Frontend inventory examined

- `client/src/App.jsx`, `main.jsx`
- `client/src/api/axiosConfig.js`, `apiRoutes.js`
- `client/src/context/AuthContext.js`, `AuthProvider.jsx`, `hooks/useAuth.js`
- `client/src/components/`: `Navbar`, `Footer`, `ProtectedRoute`, `ConfirmModal`
- `client/src/pages/`: public pages, auth, user dashboard, teams/team management, tournaments/registration/bracket, players, matches/results/leaderboard, payment, reports, contact, and admin pages
- `client/src/styles/`: all 25 CSS files
- `client/index.html`, `vite.config.js`, `eslint.config.js`, `client/vercel.json`, `client/package.json`
- `client/public/`: favicon, Vite icon, and asset placeholder directories

## Route and navigation map

### Declared routes in `App.jsx`

| Area | Routes | Access |
|---|---|---|
| Public | `/`, `/login`, `/signup`, `/tournaments`, `/tournaments/:id`, `/teams`, `/teams/:id`, `/players`, `/players/:id`, `/contact`, `/register`, `/unauthorized`, `/users`, `/reports` | Public at router level |
| Registration | `/tournaments/:id/register`, `/register-team` | Public declaration; page logic may require auth |
| Tournament | `/tournaments/:id/bracket` | Public declaration; page logic requires auth |
| User | `/dashboard`, `/dashboard/teams`, `/dashboard/teams/:id/manage`, `/payment/:id`, `/matches`, `/results`, `/leaderboard` | `ProtectedRoute` |
| Staff | `/admin`, `/admin/tournaments`, `/admin/teams`, `/admin/matches`, `/admin/registrations`, `/admin/payments` | Admin or organizer |
| Admin only | `/admin/users` | Admin |

### Navigation findings

- Main navbar links resolve to declared public routes.
- The dashboard had confirmed links to nonexistent `/notifications`, `/payments`, `/teams/create`, and singular `/dashboard/team/:id/manage`. The create/manage team links were corrected to the declared `/dashboard/teams` and `/dashboard/teams/:id/manage` routes. Nonexistent notification/payment “view all” links were removed rather than redirected to an unrelated page.
- `App.jsx` has no catch-all route. Unknown client paths render the shared layout with no route content; Vercel SPA rewriting may still serve the shell, but browser behavior was not tested.
- `/users` and `/reports` are public at the router level even though they appear admin-oriented. Their page-level behavior was inspected but not treated as a secure authorization boundary; backend authorization must be the source of truth.

## Authentication and protected-page audit

### Findings

1. `useAuth.js` is the hook used throughout the application and reads localStorage independently of `AuthContext/AuthProvider`.
2. `AuthProvider.jsx` is wrapped around the app but no frontend component consumes its context. This is a duplicate auth implementation and creates drift risk.
3. The old `ProtectedRoute` read `localStorage.userRole`, while the active auth hook derives role from the stored user object. Login allowed a user to select any role and stored the selected role instead of the server-returned role. This could show incorrect role-based UI and send a player toward staff routes.
4. `ProtectedRoute` could redirect before `useAuth` restored localStorage because it did not wait for the hook’s loading state.
5. `UserDashboard` called `logout` from `useAuth`, but the hook did not return a logout function. Clicking logout therefore caused a runtime failure.
6. `AdminDashboard` was routed for admin and organizer but checked only `isAdmin`, so organizers were rejected by the page.

### Fixes applied

- `ProtectedRoute` now waits for auth restoration and authorizes against `user.role`.
- Login no longer asks the user to self-select a role for authentication; it sends the backend contract `{ emailOrUsername, password }`, persists the server-returned role, dispatches the existing `userUpdated` event, and redirects based on the returned role.
- `useAuth` now exposes a working logout that clears token, user, and legacy role state.
- `AdminDashboard` accepts both admin and organizer roles, consistent with its route declaration.

These changes correct client-side behavior only. Backend authorization remains required and was not tested in this task.

## Feature-level source audit

### Login, registration, logout, persistence

- Login form has required inputs, loading disablement, error/success messages, and backend-aligned `emailOrUsername`.
- Signup validates username, email, password length, confirmation, and allowed self-registration roles; it posts to `/auth/register`.
- Login and signup persist data in localStorage. The active `useAuth` hook now reacts to the custom `userUpdated` event.
- Logout is now wired in the active hook.
- Auth state is still duplicated between `AuthProvider` and `useAuth`; this is a maintainability risk and should be consolidated in a later task.
- Actual credential verification and persistence across a real reload were not browser-tested.

### Tournament listing and details

- `TournamentList` loads via `getTournaments`, supports loading/error/empty rendering, and has create/delete flows.
- Confirmed defect: successful tournament creation called `fetchData`, which only existed inside a `useEffect` scope. The success path would throw before refreshing the list. A component-level `loadTournaments` helper was added and used by both initial load and create success.
- `TournamentDetails` loads by ID, provides not-found/error states, and links to registration/team details.
- Response handling in details pages contains compatibility branches for wrapped/unwrapped responses even though the Axios interceptor already unwraps successful `{success,data}` responses. This is harmless in common cases but indicates contract drift.
- No live tournament API behavior was tested.

### Team management and players

- Team list/details and `TeamManagement` contain CRUD/player-management handlers and loading/error/empty states.
- Team management links now match declared routes.
- Public list delete controls are displayed based on `isAdmin`; backend authorization was not tested.
- Team/player image and logo behavior depends on returned URLs; no local image assets were available to validate.

### Matches, results, bracket, leaderboard

- `Matches`, `Results`, `Bracket`, and `Leaderboard` use centralized API wrappers and include loading/error/empty rendering in source.
- Admin match creation/edit/result/delete handlers are present.
- ESLint reports unused match/leaderboard imports and variables, indicating dead or incomplete branches.
- Match/result/leaderboard API behavior, authorization, and rendering with real data were not tested.

### Registration and payment

- `TournamentRegistration` loads tournament/team data, checks registration window/capacity/status, posts registration, and initiates payment for nonzero entry fees.
- `Payment` loads payment details and processes the test-mode flow.
- Confirmed defect: `Payment.jsx` referenced Node’s `process.env.NODE_ENV` in browser code. This can throw `process is not defined` in a Vite browser bundle when the handler executes. It now uses Vite’s `import.meta.env.DEV`.
- Confirmed defect: `RegisterTeam.jsx` used `/api/teams`, `/api/tournaments`, and `/api/registrations/team` with an Axios base URL already set to `/api`, producing `/api/api/...`. These calls now use relative paths without the duplicate prefix.
- Confirmed defect: `RegisterTeam.jsx` expected `response.data`/wrapper fields after the interceptor had already unwrapped successful responses; its three submit handlers now use the shared request helper and treat resolved responses as success.
- Live gateway behavior is not implemented/verified; the UI explicitly falls back to test-mode processing.

### Admin pages

- Admin/organizer pages contain role checks, loading states, error messages, forms, and API calls.
- `AdminUsers` has a defined but unused deactivation handler; this is a lint/dead-code finding, not evidence that the backend operation is safe.
- `AdminDashboard` route/page role behavior was corrected as described above.
- Admin API behavior and role enforcement were not runtime-tested.

## API client and request-contract audit

- Axios uses same-origin `/api`, which is consistent with the root Vercel rewrite and Vite dev proxy.
- Request interceptor attaches the localStorage bearer token.
- Response interceptor unwraps successful `{ success: true, data }` responses and converts error messages into `error.message`.
- Most feature API calls use `apiRoutes.js`; several legacy pages use direct `api` calls.
- Confirmed duplicate `/api` prefixes in `Registrations/RegisterTeam.jsx` were fixed.
- Direct `fetch` calls remain in the dashboard notification handlers and bypass the centralized response parser, although they include the local token. They are a consistency risk and should be consolidated in a later task.
- `AuthProvider.login` still sends `{email,password}` rather than the backend’s `{emailOrUsername,password}` contract, but no active component consumes `AuthContext`; this is a confirmed duplicate/dead implementation risk, not an active path proven by browser execution.

## Forms, state, errors, and race-condition review

- Most pages have explicit loading/error/empty states and disable primary submit buttons during processing.
- Several forms use delayed `setTimeout` navigation/message clearing without cleanup on unmount. This can cause stale callbacks after navigation; no browser warning was observed because browser testing was not performed.
- `Promise.allSettled` in the user dashboard intentionally renders partial data, but it does not surface individual failed sections to the user.
- `App.jsx` globally calls `preventDefault()` on every unhandled promise rejection, which suppresses browser diagnostics instead of surfacing failures. This was not changed because the desired error-reporting UX requires a broader design decision.
- The frontend has no React error boundary. Render-time exceptions such as the previously found undefined `setData` path would reach the default runtime error behavior.

## Styling, accessibility, responsiveness, and assets

- CSS is split by feature and includes responsive rules in the inspected stylesheets.
- Forms generally use labels, `required`, `aria-busy`, and button disabled states.
- Accessibility was not browser-tested: keyboard order, focus management for modals, contrast, responsive breakpoints, screen-reader semantics, and console output remain unverified.
- `App.jsx` and `Home.jsx` reference `/assets/videos/hero.mp4`, but the local `client/public/assets/videos` directory contains only `.gitkeep`; the referenced video is absent in the working tree. This is a confirmed missing asset, though playback fallback behavior was not browser-tested.
- `TeamDetails` renders a dynamic `team.logo`; remote URL validity and alt-text behavior require runtime inspection.

## Commands and tests actually executed

| Command | Result |
|---|---|
| `npm run build` from `client` | **PASS** — Vite 7.3.0 transformed 142 modules and emitted `dist` |
| `npm run lint` from `client` before focused fixes | **FAIL** — 51 errors |
| `npm run lint` from `client` after focused fixes | **FAIL** — 43 remaining errors |
| `rg` route/API/asset searches | Completed; used as source evidence |
| `Get-ChildItem` public asset inventory | Completed; `hero.mp4` absent |

No type-check or automated test command exists in `client/package.json`.

## Findings table

| File/component | Issue | Severity | Evidence | Fix | Verification status |
|---|---|---:|---|---|---|
| `ProtectedRoute.jsx`, `useAuth.js` | Authorization used legacy `userRole` localStorage key and could run before auth restoration | HIGH | Source inspection showed role read from a separate key and no loading guard | Use `user.role`; wait while auth hook loads | PASS by source/build; browser flow NOT TESTED |
| `Auth/Login.jsx` | User-selected role controlled redirect/legacy role state instead of server role | HIGH | Login posted a role field and stored `form.role`; backend contract returns actual role | Removed role from login payload/UI path; persist `data.user.role`; redirect from server role | PASS by source/build; credential flow NOT TESTED |
| `useAuth.js`, `UserDashboard.jsx` | Dashboard logout called undefined hook function | HIGH | Dashboard destructured `logout`; hook returned no logout | Added logout implementation and state event | PASS by source/build; click flow NOT TESTED |
| `AdminDashboard.jsx` | Organizer route allowed by router but rejected by page | HIGH | Route allowed `admin, organizer`; page checked only `isAdmin` | Added `isOrganizer` checks | PASS by source/build; role flow NOT TESTED |
| `Dashboard/UserDashboard.jsx` | Broken links to nonexistent routes and notification handler used out-of-scope `setData` | HIGH | `/notifications`, `/payments`, `/teams/create`, singular team path absent from `App`; lint reported `setData` undefined | Corrected team paths, removed nonexistent view-all links, passed setter to handler | PASS by build; browser navigation NOT TESTED |
| `Registrations/RegisterTeam.jsx` | API base path doubled and success parsing contradicted Axios interceptor | HIGH | Direct calls used `/api/...` with `baseURL: "/api"`; code read `response.data` after unwrapping | Use relative endpoints and shared request helper | PASS by build; API request NOT TESTED |
| `Tournaments/TournamentList.jsx` | Create success path called undefined `fetchData` | HIGH | `fetchData` existed only inside an effect scope; ESLint reported `no-undef` | Added component-level `loadTournaments` | PASS by build |
| `Payment/Payment.jsx` | Browser handler referenced `process.env` | HIGH | ESLint reported `process is not defined`; Vite browser code has no Node `process` | Use `import.meta.env.DEV` | PASS by build; payment click NOT TESTED |
| `client/src` broadly | ESLint gate fails with 43 errors | MEDIUM | Final `npm run lint` output listed unused variables, unescaped JSX entities, and dead code | Not fully fixed in this task; unrelated/pre-existing errors retained for surgical follow-up | FAIL |
| `client/public/assets/videos` | `hero.mp4` referenced but absent | MEDIUM | Asset inventory contains only `.gitkeep`; source references `/assets/videos/hero.mp4` | None; requires supplied asset or approved fallback | CONFIRMED missing; playback NOT TESTED |
| `AuthProvider.jsx` vs `useAuth.js` | Duplicate auth state implementations; provider is not consumed by active hook | MEDIUM | `App` wraps provider, but all consumers import `useAuth` from hook | Not changed; consolidate in a dedicated task | Source-confirmed risk |
| `App.jsx` | Global unhandled rejection suppression hides diagnostics | MEDIUM | Listener calls `event.preventDefault()` without reporting | Not changed; requires error UX decision | Source-confirmed risk |
| `UserDashboard.jsx` and other pages | Direct fetches and delayed timers bypass shared client/cleanup | LOW | Source search found direct notification fetches and multiple `setTimeout` calls | Not changed beyond traced handler fix | Source-confirmed maintainability risk |

## Files created or modified during Task 2

### Created

- `audit-reports/02-frontend-audit.md`

### Modified by this task

- `client/src/hooks/useAuth.js`
- `client/src/components/ProtectedRoute.jsx`
- `client/src/pages/Auth/Login.jsx`
- `client/src/pages/Auth/Signup.jsx`
- `client/src/pages/Admin/AdminDashboard.jsx`
- `client/src/pages/Dashboard/UserDashboard.jsx`
- `client/src/pages/Payment/Payment.jsx`
- `client/src/pages/Tournaments/TournamentList.jsx`
- `client/src/pages/Registrations/RegisterTeam.jsx`

These files already had staged or working-tree changes before Task 2. The listed files were read first and changes were applied without resetting or overwriting unrelated work.

### Deleted

None.

## Remaining defects and blockers

- Frontend lint remains FAIL with 43 errors.
- No frontend automated tests or type-check command exists.
- Browser behavior, console errors, accessibility, responsive layout, route navigation, real auth persistence, API responses, and payment flows remain unverified.
- Authentication still has duplicate context/hook implementations.
- Direct fetch calls and delayed timers remain.
- Missing `hero.mp4` remains unresolved.
- Backend authorization, API route availability, MongoDB, and deployment rewrites require later tasks.

## Next task prerequisites

Task 3 (backend/API audit) can begin from the current checkout. To verify frontend/backend communication in later integration work, use an isolated test database and non-production credentials. Browser-based claims should only be made after running an actual browser session against a running frontend/backend pair.

