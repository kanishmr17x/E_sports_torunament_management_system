# Authentication & Security Audit Report
## E-Sports Tournament Management System
**Security Scope:** Authentication, Authorization, Role Hierarchy, Token Lifecycle, API Boundary Protection  
**Test Date:** November 8, 2026  
**Auditor:** Application Security Specialist & Senior Backend Engineer  
**Overall Security Status:** `PASS` (0 High/Critical Vulnerabilities Detected)

---

## 1. Security Architecture & Threat Model

### 1.1 Password Cryptography
- **Algorithm:** Salted `bcryptjs` hashing.
- **Work Factor (Cost):** 10 salt rounds.
- **Storage Policy:** Plaintext passwords are never stored or logged. Schema hooks (`userSchema.pre("save")`) hash passwords automatically before database persistence.
- **Verification Method:** Constant-time comparison via `bcrypt.compare` to prevent timing attacks.

### 1.2 JWT Token Architecture
- **Algorithm:** HMAC-SHA256 (`HS256`).
- **Signature Secret:** `process.env.JWT_SECRET` loaded exclusively from server environment variables.
- **Token Payload:** Contains minimum necessary claims: `{ id: user._id }`.
- **Token Lifetime:** 7 days (`expiresIn: "7d"`).
- **Transport Header:** `Authorization: Bearer <JWT_TOKEN>`.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Resource & Operation | Anonymous Guest | Registered Player | Tournament Organizer | Platform Administrator |
|---|:---:|:---:|:---:|:---:|
| View Tournaments / Brackets | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` |
| View Matches & Results | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` |
| Register Player / Organizer | `ALLOW` | `N/A` | `N/A` | `N/A` |
| Register Admin User | `DENY (400)` | `DENY (400)` | `DENY (400)` | `DENY (400)` |
| Create Team & Manage Roster | `DENY (401)` | `ALLOW` | `ALLOW` | `ALLOW` |
| Register Team to Tournament | `DENY (401)` | `ALLOW (Captain)` | `ALLOW (Captain)` | `ALLOW` |
| Cancel Team Registration | `DENY (401)` | `ALLOW (Captain)` | `ALLOW (Captain)` | `ALLOW` |
| Create / Edit Tournament | `DENY (401)` | `DENY (403)` | `ALLOW` | `ALLOW` |
| Schedule Match & Enter Score | `DENY (401)` | `DENY (403)` | `ALLOW` | `ALLOW` |
| View Admin Telemetry | `DENY (401)` | `DENY (403)` | `ALLOW` | `ALLOW` |
| Manage User Roles & Bans | `DENY (401)` | `DENY (403)` | `DENY (403)` | `ALLOW` |

---

## 3. Negative Security Test Cases & Penetration Validations

| Test Identifier | Vulnerability Target | Attack Payload / Method | Expected Result | Actual Result | Status |
|---|---|---|---|---|:---:|
| **SEC-01** | Privilege Escalation | `POST /auth/register` with `role: "admin"` | HTTP 400 Bad Request | Rebuffed with `"Invalid role. Must be one of: player, organizer"` | `PASS` |
| **SEC-02** | Account Enumeration / Collision | Duplicate registration with existing email | HTTP 409 Conflict | Rebuffed with `"Email already registered"` | `PASS` |
| **SEC-03** | Brute Force / Bad Credentials | `POST /auth/login` with wrong password | HTTP 401 Unauthorized | Rebuffed with `"Invalid credentials"` | `PASS` |
| **SEC-04** | Missing Token | `GET /auth/me` without Authorization header | HTTP 401 Unauthorized | Rebuffed with `"Not authorized, no token"` | `PASS` |
| **SEC-05** | Token Forgery / Tampering | Request with forged HMAC signature | HTTP 401 Unauthorized | Rebuffed with `"Not authorized, token failed"` | `PASS` |
| **SEC-06** | Unauthorized Staff Action | Ordinary player calling `POST /tournaments` | HTTP 403 Forbidden | Rebuffed with `"Admin access required"` | `PASS` |
| **SEC-07** | Team Hijacking / Unauthorized Roster Edit | Non-captain attempting to delete player | HTTP 403 Forbidden | Rebuffed with `"Not authorized to remove this player"` | `PASS` |
| **SEC-08** | Registration Hijacking | Non-captain attempting to cancel registration | HTTP 403 Forbidden | Rebuffed with `"Not authorized to cancel this registration"` | `PASS` |
| **SEC-09** | NoSQL Injection / Malformed ID | Malformed Hex strings in `:id` parameters | HTTP 400 Bad Request | Rebuffed with `"Invalid ID format"` | `PASS` |
| **SEC-10** | Missing Match Crash Vector | Result update on non-existent match ID | HTTP 404 Not Found | Rebuffed with clean `"Match not found"` without crash | `PASS` |

---

## 4. Credential & Secret Protection Audit

1. **Client Distribution Audit:** Verified `client/dist/` build output contains zero database URIs, passwords, or JWT secrets.
2. **Terminal & Log Sanitization:** Server startup logs display only environment type and database name; all credentials remain strictly in `.env`.
3. **API Response Sanitization:** User objects returned by `/auth/register`, `/auth/login`, and `/auth/me` strip `password` hashes before serialization.
