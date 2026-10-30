# Task 13 - Security Exposure and Git Hygiene Audit

**Date:** 2026-10-19  
**Status:** **BLOCKED — Remediation or owner approval required**  
**Mode:** Read-only inspection and reporting  
**Repository:** `https://github.com/kanishmr17x/E_sports_torunament_management_system`  
**Remote branch:** `main`

## 1. Executive Summary

The local candidate is protected from accidental `.env` tracking by the root
ignore rules, and no suspicious secret-bearing filename is tracked locally.
However, the public GitHub `main` tree tracks both `client/.env` and
`server/.env`, and both paths occur in the reachable history examined. Their
contents were deliberately not retrieved, so active credential compromise is
**not verified**. The tracking and historical presence are confirmed security
risks requiring owner-approved remediation and credential rotation if the
values were ever real.

Remote repository hygiene is also poor: the tree contains **2,585 tracked
`node_modules` files**, debug/response JSON artifacts, and other generated-like
paths. The local repository has no commit baseline or configured remote, so
there is no safe way to approve a release baseline from the current Git state.

Final disposition: **BLOCKED — Remediation or owner approval required**.
Do not create a release baseline, push, delete remote files, rotate
credentials, rewrite history, or deploy until the owner approves the
remediation scope.

## 2. Scope and Safety Boundaries

Inspected:

- Local Git status, branch, repository identity, remotes, history availability,
  index filenames, ignore behavior, and tracked-path hygiene.
- GitHub repository tree and branch metadata for the exact public `main`
  reference.
- Reachable commit metadata for `client/.env` and `server/.env`.
- Local ignore/template metadata and redacted filename/pattern scans.

Not performed:

- No `.env` or other secret-bearing file contents were read, printed, copied,
  logged, or included in this report.
- No `git add`, commit, push, pull, merge, rebase, reset, clean, branch
  creation, history rewrite, remote configuration, deployment, package
  installation, or source/configuration modification.
- No credential rotation, remote deletion, or GitHub history cleanup.
- No claim was made that a tracked environment file contains active
  credentials.

## 3. Commands and Read-Only Checks Performed

### Local Git baseline

```text
git status --short --branch
git rev-parse --show-toplevel
git rev-parse --is-inside-work-tree
git remote -v
git log --oneline -5
git ls-files
git check-ignore -v --no-index client/.env server/.env
```

Results:

- Root: `E:/project/esports platform`.
- Worktree: valid.
- Branch: `main`.
- Local commits: none; Git reports an unborn branch.
- Local remotes: none configured.
- Existing staged, modified, and untracked files remain preserved.
- `client/.env` and `server/.env` exist locally, are not tracked, and are
  ignored by the root `.gitignore` rule `.env`.

### Remote metadata

```text
git ls-remote --heads https://github.com/kanishmr17x/E_sports_torunament_management_system.git
GET /repos/kanishmr17x/E_sports_torunament_management_system/git/trees/main?recursive=1
GET /repos/.../commits?path=client/.env
GET /repos/.../commits?path=server/.env
GET /repos/.../commits?per_page=10
```

Results:

- Remote `main`: `7f49d2a40e39a40cfc9bade131b6a5a10356a8d7`.
- Two reachable recent commits were returned:
  `7f49d2a...` and `0c86a7d...`.
- The remote tree was not truncated and contained 2,675 blobs total.
- Both environment paths have one reachable commit record, the current
  `main` tip `7f49d2a...`, dated 2026-04-01.

### Hygiene and secret-pattern checks

Checks were metadata/name-focused and excluded local `.env` contents,
dependency directories, Git internals, and build output where applicable.

- Local tracked suspicious filenames: **0**.
- Remote tracked environment files: **2**.
- Remote tracked `node_modules` files: **2,585**.
- Remote debug/response JSON paths: **14** when including dependency package
  metadata whose names contain `debug`; the top-level project artifacts
  `debug_response.json` and `team_response.json` are confirmed.
- Remote generated-like paths matching build/cache/log/key/certificate
  patterns: **83**, largely dependency metadata; this was not treated as
  proof that all are release artifacts.
- Local actual `.env` files: `client/.env` and `server/.env`; both ignored.
- Local `.env`-named files including the safe template: **3**.
- Local generated-looking named files outside dependency/build exclusions: **0**.
- Local scans found no AWS access-key pattern, private-key PEM header, or
  authenticated MongoDB URI in the scanned non-`.env` files.

The broad password/secret/token pattern scan matched documentation,
placeholder templates, and source code identifiers. It did not establish
credential exposure and no matching values were copied into this report.

## 4. Local and Remote Tracking Findings

| Finding | Local candidate | Remote `main` | Assessment |
|---|---|---|---|
| `client/.env` tracked | No; exists and ignored | Yes | Confirmed remote tracking risk |
| `server/.env` tracked | No; exists and ignored | Yes | Confirmed remote tracking risk |
| Safe environment template | `server/.env.example` exists | Not relied upon | Local template requires owner review before release |
| `.env` ignore rule | Root `.gitignore` covers `.env` and allows examples | Remote tree has tracked files despite hygiene policy | Local protection passes; remote remediation required |
| `node_modules` tracked | No suspicious tracked path found locally | 2,585 files | Confirmed remote hygiene defect |
| Debug response artifacts | Not tracked locally | `debug_response.json`, `team_response.json` | Confirmed remote hygiene defect |
| Build/log/key artifacts | None found in local tracked filenames | Pattern category includes generated/dependency paths | Requires file-by-file remote review |

The local `client/.gitignore` does not independently add a `.env` rule, but
the root ignore rule applies to the repository and correctly ignores both
local environment files. This is not a reason to weaken or replace the root
rule.

## 5. Environment-File and Credential Exposure Assessment

### Confirmed

1. `client/.env` is tracked in public GitHub `main`.
2. `server/.env` is tracked in public GitHub `main`.
3. Both paths occur in the current reachable remote `main` history.
4. Local copies exist but are not tracked and are ignored.

### Not verified

- No `.env` values were retrieved.
- It is unknown whether the files contain real, expired, test, or placeholder
  values.
- No provider-side credential status was checked.
- No GitHub secret-scanning result was obtained in this read-only audit.

Therefore this report does **not** claim verified credential compromise. It
does classify the remote tracking/history as a high-priority exposure risk:
any value that was real must be rotated, and future removal alone is
insufficient because reachable history retains prior blobs.

### Template assessment

`server/.env.example` was inspected only for metadata and placeholder markers.
It contains placeholder-style configuration markers and is not evidence of
live credentials. It should remain a safe template and must be checked
manually by the owner before any release baseline.

## 6. Git History Assessment and Limitations

- Local history is unavailable because the local `main` branch has no commits.
- Remote `main` has at least two reachable commits in the inspected API
  history.
- Both remote environment paths are associated with the current tip commit.
- A future deletion commit would not remove those paths from earlier reachable
  history.
- Full historical secret exposure cannot be conclusively classified without
  owner-authorized history review and provider-side credential verification.
- The remote tree also contains tracked dependency files, so remote commit
  statistics and broad file counts include generated content.

## 7. Generated-File and Ignore-Rule Findings

### High-priority remote hygiene defects

- Tracked `node_modules` content creates a large, non-reproducible release
  surface and can obscure source review.
- Tracked top-level debug response artifacts may contain user or API data; their
  contents were not retrieved.
- Tracked `.env` files create a secret-management and historical-exposure
  risk.

### Local hygiene

- Root `.gitignore` excludes `.env`, `.env.*`, dependencies, build outputs,
  `.vercel`, logs, caches, and common temporary files while allowing
  `.env.example`.
- Local tracked filename scan found no environment, private-key, certificate,
  dependency, build, coverage, or log artifact.
- The local worktree still contains many untracked audit/application files;
  this is a release-boundary risk because broad future staging could include
  unintended content.

## 8. Prioritized Remediation Table

| # | Severity | Finding | Evidence | Impact | Confidence | Owner action | Rotation/history action |
|---:|---|---|---|---|---:|---|---|
| 1 | High | Remote `client/.env` tracked | GitHub tree and reachable commit metadata | Potential frontend configuration/credential exposure | 10/10 | Approve removal from intended release branch | Review values through a secure owner process; rotate any real values; clean history if required |
| 2 | High | Remote `server/.env` tracked | GitHub tree and reachable commit metadata | Potential JWT/database/provider credential exposure | 10/10 | Approve removal from intended release branch | Rotate any real values and perform approved history remediation |
| 3 | High | Remote history retains environment paths | One reachable commit record for each path | Future deletion does not erase historical blobs | 10/10 | Decide whether history rewrite is acceptable | Coordinate GitHub/provider remediation; never force-push without explicit approval |
| 4 | Medium | Remote `node_modules` is tracked | 2,585 matching remote paths | Large supply-chain/review/reproducibility surface | 10/10 | Remove from future baseline and rely on lockfiles | No credential rotation unless later content review finds secrets |
| 5 | Medium | Remote debug artifacts are tracked | `debug_response.json`, `team_response.json` | Possible sensitive data or accidental internal output | 9/10 | Owner review before release; exclude unless justified | Inspect privately; remove from release/history if sensitive |
| 6 | Medium | Local release boundary is mixed | Unborn local branch, staged/modified/untracked files | Broad staging can capture unrelated or generated work | 10/10 | Approve explicit file manifest before baseline | None |
| 7 | Low | Client-specific ignore policy is incomplete alone | Root rule protects local files; client rule does not | Future subdirectory-only workflows may confuse contributors | 8/10 | Owner may align documentation/rules after review | None |
| 8 | Informational | Pattern scans found placeholder/docs matches | Filename-only and redacted pattern checks | False positives can distract from real findings | 10/10 | Use provider/GitHub secret scanning under owner controls | None |

No Critical finding is asserted because actual secret values were not retrieved
or verified. The High findings still block release-baseline approval.

## 9. Required Owner Approvals

Before any baseline or release action, the owner must approve:

1. Whether the audited local tree or a reconciled branch is the intended source
   of truth.
2. Removal of tracked remote environment files from the intended release path.
3. Secure review and rotation of any potentially real values from those files.
4. Whether history remediation is required and which approved process will be
   used; no history rewrite was performed here.
5. Exclusion/removal of remote `node_modules` and debug artifacts from the
   release baseline.
6. The exact explicit file list to stage.
7. A private provider/GitHub secret scan if credential exposure must be
   conclusively determined.

## 10. Security Gates Before Task 17

The following gates must pass before release-baseline work proceeds:

- No real `.env` files in the proposed release tree.
- Owner-approved handling of remote historical environment blobs.
- Credential rotation completed for any value determined to be real.
- No tracked dependencies, build outputs, logs, debug artifacts, private keys,
  or accidental local configuration in the proposed baseline.
- Exact release file manifest reviewed and staged explicitly.
- GitHub branch and Vercel source/deployed commit reconciled.
- Secret scanning completed through an authorized provider/tool if required.
- Existing production-readiness blockers from Tasks 10-12 remain addressed or
  explicitly accepted by the owner.

## 11. Explicit Go/No-Go Recommendation

**NO-GO for release-baseline creation.**

The verified remote environment-file tracking and history presence, tracked
dependency/debug artifacts, absent local baseline, and unresolved owner
decisions require remediation or approval first.

## Final Status

**BLOCKED — Remediation or owner approval required**

### Check outcome summary

- Local repository/root/branch/status: **PASS as inspection**; local branch is
  unborn and contains preserved pre-existing work.
- Local `.env` ignore behavior: **PASS**.
- Local suspicious tracked filename scan: **PASS**; zero matches.
- Remote branch/tree access: **PASS**.
- Remote environment-file tracking check: **FAIL**; two tracked paths.
- Remote environment-file history check: **FAIL**; each path has reachable
  history metadata.
- Remote dependency/generated-artifact hygiene: **FAIL**.
- Secret value verification: **UNVERIFIED by design**; values were not read.
- Provider-side credential validity/rotation status: **UNVERIFIED**.
- Vercel deployed source and settings: **UNVERIFIED**.
- Release approval/source-of-truth decision: **NOT APPROVED**.

Task 13 is complete. Do not begin Task 14 without explicit owner approval.
