# Task 8 - DevOps, CI/CD, Git, and Vercel Deployment Audit

**Date:** 2026-10-19  
**Status:** FAIL

## Scope

This audit covers the local checkout at `E:\project\esports platform`, the referenced GitHub repository, and the publicly reachable Vercel URL. It evaluates Git state, sensitive-file handling, manifests and lockfiles, build/start/runtime configuration, CI/CD, Vercel routing, serverless compatibility, environment-variable names, deployment evidence, and rollback/release practices.

The evidence boundary is explicit:

- **Local source/config inspection:** current working tree, manifests, lockfiles, `.gitignore`, `vercel.json`, `api/index.js`, Vite configuration, deployment script, and server entry points.
- **GitHub read-only inspection:** repository branches, commits, root tree, remote package/configuration files, and GitHub Actions workflow inventory.
- **Public deployment read-only inspection:** Vercel project page and public frontend/API URLs.
- **Not accessed:** Vercel dashboard settings, deployment logs, project environment values, MongoDB credentials/data, GitHub secret values, or any production configuration mutation.

Task 7 was not present in the supplied sequence, so no `audit-reports/07-security-performance-audit.md` was available to read. This report does not infer security findings beyond the DevOps evidence documented here.

## Files and components examined

### Local checkout

- `.gitignore`
- `package.json`, `package-lock.json`
- `client/package.json`, `client/package-lock.json`, `client/.gitignore`
- `server/package.json`, `server/package-lock.json`
- `vercel.json`, `client/vercel.json`
- `client/vite.config.js`
- `api/index.js`
- `server/app.js`, `server/server.js`, `server/config/db.js`
- `server/.env.example`
- `deploy.sh`
- Previous audit reports `01` through `06`

### Hosted GitHub repository

Read-only metadata and tree inspection for `kanishmr17x/E_sports_torunament_management_system`:

- Branches and recent commits
- Root tree
- `client/.gitignore`
- Root `package.json`
- `client/` and `server/` tree listings
- GitHub Actions workflow listing

### Public deployment

- `https://vercel.com/kanishmr17xs-projects/e-sportz`
- `https://e-sportz.vercel.app/`
- `https://e-sportz.vercel.app/api/health`
- `https://e-sportz.vercel.app/api`
- `https://e-sportz.vercel.app/health`

## Executive result

The deployment is **not production-ready based on available evidence**.

The primary blocker is not merely a local configuration defect; it is a source-of-truth divergence:

1. The local checkout contains a newer uncommitted full-stack/serverless architecture with `vercel.json` and `api/index.js`.
2. The referenced GitHub `main` branch contains a different, older tree with no root `vercel.json` or `api/index.js` in its root listing.
3. The GitHub `main` branch contains tracked `client/.env` and `server/.env` files. Values were not read or printed.
4. The public Vercel frontend responds at `/`, but `/api/health` and `/api` return 404.
5. There are no GitHub Actions workflows and no local Vercel CLI installation.

Until the intended source branch is established, secrets are removed/rotated, and the deployed commit is verified to contain the API adapter/configuration, the frontend and backend cannot be considered a single deployable release.

## Git status, branches, remotes, and history

### Local checkout evidence

The local checkout is on branch `main`, but:

- `git status --short --branch` reported no commits yet on local `main`.
- No local remotes were configured.
- No local commit history was available.
- The worktree contained extensive staged, modified, and untracked files from the preceding audit work. These were preserved.
- No reset, clean, checkout, force-push, or history rewrite was performed.

This means local Git metadata cannot establish the deployed commit, release provenance, or rollback point.

### GitHub repository evidence

The referenced GitHub repository is independently accessible and reports:

- Branches: `main`, `vercel/install-vercel-speed-insights-fgh2y8`, and `vercel/vercel-web-analytics-to-projec-ta98td`.
- `main` is not protected according to the branch listing.
- Recent history includes commit `7f49d2a...` (`E-sports`) and the earlier initial commit.
- No GitHub Actions workflows were returned.

The local checkout and GitHub repository are therefore not demonstrably synchronized. The hosted deployment’s exact commit could not be verified without Vercel dashboard access.

## Sensitive files and `.gitignore`

### Local configuration

The local root `.gitignore` excludes:

- `.env` and `.env.*`, while retaining `.env.example`;
- `node_modules/`;
- build outputs such as `/dist`, `/build`, and `/out`;
- `.vercel/`;
- logs, caches, coverage, editor files, and temporary files.

Local checks confirmed that `.env`, `server/.env`, `client/dist`, `node_modules`, and `.vercel` are ignored. No locally tracked secret-named files were found by the targeted name scan.

### Hosted GitHub configuration

The GitHub `main` tree listing confirmed these tracked files:

- `client/.env`
- `server/.env`

Their contents were deliberately not retrieved. This is a **confirmed sensitive-file tracking defect**, regardless of whether the values are placeholders or active credentials. The values should be considered exposed, removed from Git history, and rotated through the appropriate providers. Removal/history cleanup requires owner approval and must not be performed automatically during this audit.

The remote `client/.gitignore` excludes `*.local`, but it does not exclude the exact `.env` filename. The remote server ignore policy was not available as a safe complete file read because the tree itself already exposed the tracked file.

## Package manifests, lockfiles, and scripts

### Local manifests

| Package | Build/start/test/lint configuration | Assessment |
|---|---|---|
| Root | Only `mongodb` dependency; no application scripts | Inconsistent with the actual client/server split |
| Client | `dev`, `build`, `lint`, `lint:fix`, `preview` | Build exists; no test/type-check script |
| Server | `start: node server.js`, `dev: nodemon server.js` | Local start exists; no test/lint/type-check script |

The exact local Vercel build command is:

```text
cd client && npm run build
```

The local Vercel output directory is:

```text
client/dist
```

Read-only `npm ci --dry-run --ignore-scripts --no-audit --no-fund` checks passed for the root, client, and server lockfiles. This verifies manifest/lockfile resolution at the current local state; it does not verify deployment installation or runtime behavior.

### Runtime configuration

- Local runtime is Node.js `v24.16.0`, npm `12.2.0`.
- No `.nvmrc`, `engines` field, Dockerfile, or explicit Vercel Node runtime pin was found.
- Node 24 is newer than the versions commonly used by managed deployment environments; the project should pin and test a supported LTS version before release.
- `deploy.sh` installs server and client dependencies and builds the frontend, but its instructions describe a traditional local server and reference a `DEPLOYMENT.md` file that was not found.
- `deploy.sh` uses `npm install` rather than reproducible `npm ci` and contains mojibake in its output text. It is not a CI workflow.

## Vercel and serverless compatibility

### Local intended architecture

The local checkout contains:

- `api/index.js` exporting `server/app`;
- `server/app.js` configuring Express and mounting `/api/*` routers;
- `server/config/db.js` with cached Mongoose connection promise reuse;
- root `vercel.json` with Vite build/output configuration, API rewrite, SPA fallback, and environment-variable references.

The Express application is compatible in shape with a Vercel Node function because it exports the app rather than calling `listen()` from `api/index.js`. `server/server.js` is reserved for local long-running execution.

However, `server/app.js` starts `connectDB()` at module import and does not await readiness before requests. This is a serverless cold-start/readiness risk. It was not runtime-tested.

### Local rewrite configuration

The local root `vercel.json` contains:

- `buildCommand`: `cd client && npm run build`
- `outputDirectory`: `client/dist`
- `framework`: `vite`
- `/api/(.*)` rewrite to `/api/$1`
- catch-all rewrite to `/index.html`
- environment names `MONGO_URI`, `JWT_SECRET`, `NODE_ENV`, and `FRONTEND_URL`

The API rewrite is effectively a pass-through rather than an explicit mapping to a function. Whether Vercel’s function routing takes precedence for `/api/*` must be verified with a deployment built from this exact tree. The catch-all SPA rewrite must not intercept API requests; the public 404 evidence indicates the currently deployed project is not serving the expected API adapter.

`client/vercel.json` contains a second catch-all rewrite to `/`. Having both root and client Vercel configurations is a configuration-drift risk. The effective configuration depends on which directory Vercel treats as the project root.

### Hosted Vercel evidence

- The Vercel project page was accessible but showed the generic deploy prompt rather than deployment details available to this audit.
- `https://e-sportz.vercel.app/` returned the frontend title `E-Sports Platform`.
- `https://e-sportz.vercel.app/api/health` returned HTTP 404.
- `https://e-sportz.vercel.app/api` returned HTTP 404.
- `https://e-sportz.vercel.app/health` returned HTTP 404.

This confirms that the public frontend is reachable, but it does not confirm that the Express API/serverless function is deployed or routed. It also means frontend/API production communication is currently unverified and likely broken for the deployed project.

## CI/CD status

### Confirmed working

- Local client production build completed successfully in the previous QA task and the same build command is documented here.
- Client and server lockfiles resolve successfully in dry-run CI installation checks.
- `.gitignore` in the local checkout excludes common generated and secret files.

### Missing or misconfigured

- No GitHub Actions workflows exist in the hosted repository.
- No automated lint, test, type-check, or build gate protects `main`.
- No deployment workflow or documented release workflow was found.
- No branch protection was reported for GitHub `main`.
- No commit history exists in the local checkout, so the audited local state has no reproducible release identity.
- No rollback/release tagging practice was evidenced.
- Vercel CLI is not installed locally.
- Vercel deployment logs and project settings are unavailable without authenticated dashboard/CLI access.

## Required environment-variable names

Names found in the local server template/configuration, without reading values:

### Core runtime

- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `FRONTEND_URL`

### Optional email

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

### Optional AWS/S3

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`

### Application limits

- `MAX_FILE_SIZE`
- `ALLOWED_IMAGE_TYPES`

### Admin seed script

The audited local `server/createAdmin.js` additionally expects:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- optional `ADMIN_USERNAME`

The Vercel environment names declared by local `vercel.json` are `MONGO_URI`, `JWT_SECRET`, `NODE_ENV`, and `FRONTEND_URL`. Their values were not read. The names alone do not prove that values exist in the Vercel project or are correctly scoped to Production/Preview/Development.

## Database deployment requirements

The API requires:

- a reachable MongoDB Atlas URI in `MONGO_URI`;
- Atlas Network Access allowing the Vercel runtime, preferably through a controlled policy;
- a sufficiently privileged application database user;
- indexes created/verified in the target database;
- connection reuse suitable for serverless warm invocations;
- a separate test database for QA.

No live connection, Atlas allowlist, collection/index state, or Vercel environment value was verified. Production database changes were not attempted.

## What works, what is blocked, and what requires account access

### Works or locally evidenced

1. Client production build command works locally.
2. Client/server lockfiles have resolvable dependency graphs locally.
3. Local Vercel configuration describes a Vite build and an Express serverless adapter.
4. Local ignore rules cover `.env`, dependencies, build output, and Vercel metadata.
5. Public Vercel frontend root is reachable.

### Misconfigured or deployment-blocking

1. GitHub `main` tracks `client/.env` and `server/.env`.
2. Local checkout has no commits/remotes and cannot be tied to the hosted deployment.
3. Hosted GitHub tree lacks the local `vercel.json`/`api/index.js` architecture in its root listing.
4. Public Vercel `/api/health` returns 404.
5. No CI/CD quality gates or deployment workflow exist.
6. No explicit Node runtime pin exists.
7. Duplicate root/client Vercel configuration creates project-root ambiguity.
8. Serverless API/database readiness is not runtime verified.

### Requires owner/account access

- Vercel project root, framework, build command, output directory, function routing, environment-variable scopes, and deployment commit.
- Vercel deployment/build/function logs.
- Vercel project domain and whether `e-sportz.vercel.app` is the intended current project.
- GitHub secret/file-removal and credential rotation actions.
- MongoDB Atlas Network Access, database user, index state, and connection logs.
- Whether the local checkout should replace GitHub `main` or whether GitHub `main` is the authoritative source.

## Safe verification commands

These commands are read-only or build-only and can be run after the source-of-truth decision:

```text
git status --short --branch
git remote -v
git log --oneline --decorate -10
npm ci --ignore-scripts --no-audit --no-fund
npm --prefix client ci --ignore-scripts --no-audit --no-fund
npm --prefix server ci --ignore-scripts --no-audit --no-fund
npm --prefix client run lint
npm --prefix client run build
node --check api/index.js
node --check server/app.js
node --check server/server.js
```

With authenticated Vercel CLI access, use read-only inspection first:

```text
vercel project ls
vercel inspect <deployment-url>
vercel logs <deployment-url>
```

Do not run `vercel deploy --prod` as part of this audit.

## Manual Vercel actions required

1. Decide whether GitHub `main` or the local audited checkout is authoritative.
2. Remove the tracked `.env` files from the repository and rotate any values they ever contained. History cleanup requires explicit approval.
3. Push the intended source to a committed branch without force-pushing.
4. Configure the Vercel project root to match the selected tree.
5. Set Production/Preview environment variables by name and scope, without placing secret values in `vercel.json`.
6. Confirm that `api/index.js` is included in the deployed source and that `/api/health` reaches Express.
7. Confirm that the SPA fallback does not intercept `/api/*`.
8. Verify build logs, function logs, database connectivity, and a read-only health request.
9. Add a rollback path using immutable deployment URLs and Git tags/releases.
10. Add CI checks for lockfile installation, frontend build, lint, backend syntax, and approved tests before merging/deploying.

## Fixes applied in Task 8

No application, deployment, Git, or production configuration was modified. This was intentional because the local/remote source mismatch and tracked remote environment files require owner decisions and credential rotation; automatic changes could deploy the wrong source or expose/alter production configuration.

## Files changed during Task 8

Created:

- `audit-reports/08-devops-deployment-audit.md`

Modified:

- None

Deleted:

- None

## Next task prerequisites

Before regression or final production-readiness assessment:

- establish the authoritative committed source branch;
- remove and rotate tracked environment-file credentials;
- obtain read-only Vercel project/deployment access;
- verify the deployed commit contains the API adapter and intended Vercel configuration;
- configure an isolated database/test environment;
- add at least build, lint, backend syntax, and API regression gates;
- resolve or explicitly accept the 39 frontend lint errors;
- verify `/api/health`, SPA deep links, authentication, and database connectivity on a non-production deployment.

