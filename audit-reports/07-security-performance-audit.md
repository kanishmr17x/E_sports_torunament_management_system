# Task 7 — Security, Performance, and Reliability Audit

**Date:** 2026-10-19  
**Status:** Completed; stopped after Task 7 as requested.

## Scope

This audit reviewed the previous reports `00-execution-rules.md` through
`06-testing-audit.md`, then examined the Express/Mongoose API, React payment
flow, authentication and authorization middleware, data models, error handling,
dependency manifests/lockfiles, and relevant frontend request code.

The review covered secrets and environment handling, authentication,
authorization, injection and unsafe updates, payment callbacks, sensitive
logging, input validation, registration integrity, request volume/pagination,
database indexes, and dependency advisories. Checks were non-destructive; no
production database or deployment was accessed.

## Files and Components Examined

- `server/app.js`, `server/server.js`, `server/.env.example`,
  `server/utils/validateEnv.js`
- `server/middleware/authMiddleware.js`, `server/middleware/adminMiddleware.js`,
  `server/middleware/centralizedErrorHandler.js`
- Payment routes/controller/model and
  `client/src/pages/Payment/Payment.jsx`
- Player, team, tournament, and registration routes/controllers/models
- `server/package.json`, `server/package-lock.json`, client dependency manifests
- All prior audit reports in `audit-reports/00` through `audit-reports/06`

## Commands and Tests Actually Executed

- `npm audit --prefix server --omit=dev --json`
  - Initial audit: 5 moderate, 7 high, and 1 critical advisory.
- `npm install --prefix server mongoose@^8.20.5 --save`
  - Resolved to `mongoose@8.24.5`; lockfile updated.
- `npm audit --prefix server --omit=dev --json` after the update
  - Remaining dependency metadata: 5 moderate, 1 high, 1 critical.
- `node --check` on each modified server controller/middleware
  - Passed.
- `npm run lint --prefix client`
  - Failed on 39 pre-existing lint errors across unrelated files. The modified
    payment file is also affected by two existing unescaped-entity errors.
- No automated backend test script exists in `server/package.json`; no isolated
  MongoDB or payment-provider sandbox credentials were available.

## Findings and Severity

### Fixed during Task 7

| Severity | Finding and evidence | Remediation |
|---|---|---|
| Critical | The payment callback was public and trusted caller-supplied transaction status, allowing a caller to mark payments paid and create registrations. | Callback now requires a constant-time comparison of `x-payment-webhook-secret` against `PAYMENT_WEBHOOK_SECRET`, validates required fields, and treats already-paid callbacks as idempotent. A real provider signature scheme and amount/event verification remain required before production gateway launch. |
| High | `processPayment` accepted client-controlled `testMode`, allowing production payment completion without a gateway transaction. | The client flag is no longer trusted. Test completion is allowed only outside production and only for a payment whose server-created method is `test`; production initiation rejects `test`. |
| High | Error handling logged complete request bodies, which could include passwords, tokens, gateway data, or contact information. | Request bodies were removed from general error logs; parameter/query fields are allowlisted through sensitive-field redaction. |
| High | Raw `req.body` was passed to team and tournament `findOneAndUpdate`, exposing unintended fields and operator/prototype-sensitive update paths. | Updates now use explicit field allowlists. |
| High | Player creation was unauthenticated and accepted arbitrary `teamId` values. | The route now requires authentication; the controller validates the team and requires captain ownership or admin role, and requires a team for non-admin creation. |
| High | Registration creation used a check-then-insert sequence without a uniqueness constraint. | Added a unique compound `{ teamId, tournamentId }` index to prevent duplicate registrations at the database layer. Existing production duplicates must be reconciled before index creation. |
| High | Mongoose `^8.0.0` resolved to an advisory-affected version. | Updated the direct dependency and lockfile to Mongoose `8.24.5` within the existing major version. |

### Remaining confirmed or potentially exploitable findings

| Severity | Finding and evidence | Remediation / status |
|---|---|---|
| High | Payment success still performs payment, registration, payment-link, count, and team-array writes independently in both test completion and callback handling. | Use a MongoDB transaction where deployment topology supports it, enforce state transitions, and reconcile existing denormalized counts. Not changed because this needs a data/transaction rollout plan. |
| High | The payment callback has a shared-secret gate but no provider-specific signed payload, event type, amount, currency, or replay timestamp validation. | Integrate the selected gateway's official webhook verification and compare the stored payment amount/currency before enabling production callbacks. Unverified without provider details. |
| Medium | Registration cancellation deletes the registration before updating tournament count/team membership. A later failure can leave drift. | Use a transaction or an atomic update conditioned on a successful deletion; add reconciliation. Not changed because it is coupled to the payment/registration transaction design. |
| High | The post-update dependency audit still reports one high and one critical transitive advisory (including proxy/path-related packages). | Review the complete `npm audit` paths and upgrade compatible direct dependencies, then retest. No major upgrades were applied automatically. |
| Medium | `express.json` and `urlencoded` accept 10 MB bodies globally, and no rate limiting is present on authentication, payment, or callback endpoints. | Apply route-specific body limits and deployment/API-gateway rate limits. |
| Medium | Public list endpoints return unbounded collections in several controllers and some populate related documents. | Add bounded pagination and field projections, especially for admin registrations, players, and payments. |
| Low | CORS allows requests with no `Origin`, which is useful for non-browser clients but broadens the accepted surface. | Keep only if required by the API contract; otherwise require configured origins in production and keep credentials policy explicit. |

## Performance and Reliability Assessment

- Existing indexes cover common tournament status/game queries, payment status,
  user/time, and transaction lookup. The new registration uniqueness index also
  supplies the common team/tournament lookup prefix.
- The most important performance risks are unbounded list queries and large
  population payloads, not a confirmed frontend request loop.
- The payment and registration write sequences are the dominant reliability
  risk because denormalized tournament state can diverge after partial failure.
- No broad bundle rewrite or architectural change was justified by the
  available evidence.

## Fixes Applied

- Added payment webhook shared-secret verification and basic callback
  idempotency.
- Removed client-authoritative payment test-mode completion in production.
- Added `PAYMENT_WEBHOOK_SECRET` to `server/.env.example`.
- Removed request bodies from centralized error logs and redacted sensitive
  parameter/query values.
- Added player authentication, team existence checks, and ownership checks.
- Replaced raw team/tournament update documents with field allowlists.
- Added the registration compound unique index.
- Updated Mongoose within major version 8 and regenerated the server lockfile.

## Potentially Breaking Changes

1. Unauthenticated `POST /api/players/add` callers now receive `401`.
2. Production initiation of `test` payments now receives `400`; production
   deployments must provide a real gateway method and callback secret.
3. Unsigned payment callbacks now receive `401`; gateway configuration must send
   `x-payment-webhook-secret` until provider-specific signing is implemented.
4. The registration unique index can fail to build if duplicate documents
   already exist; reconcile duplicates before deploying the model change.
5. Team/tournament update requests silently lose fields outside the new
   allowlists only where those fields were previously being accepted
   unintentionally; supported schema fields remain available.

## Blockers and Unverified Items

- No payment-provider sandbox, webhook signing specification, isolated database,
  or production environment settings were available.
- Existing duplicate registrations and tournament count drift were not queried
  or modified.
- Dependency advisories remaining after the Mongoose update require compatible
  dependency upgrades and regression testing; no major versions were forced.
- Client lint is currently blocked by 39 existing errors, including unrelated
  files.

## Next Task Prerequisites

- Provide the selected payment gateway's webhook contract and a non-production
  signing secret/sandbox.
- Provide an isolated MongoDB test database for transaction, duplicate,
  cancellation, and webhook replay tests.
- Reconcile duplicate registrations before deploying the unique index.
- Task 8 may inspect deployment configuration, but should preserve the
  production payment restrictions and required webhook secret introduced here.
