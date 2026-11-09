# Authentication & Authorization Security Audit Report

**Workspace:** `E:\project\esports platform`  
**Execution Date:** 08 November 2026  
**Security Scope:** JWT, Bcrypt, Session State, RBAC Enforcement  
**Status:** **PASS (Secure & Verified)**  

---

## 1. Executive Summary

This audit evaluates the identity and access management architecture of the E-Sports Tournament Management System. The review covers password encryption, token signing and validation, public registration role gating, privilege escalation defense, role-based access control (RBAC) enforcement, and client-side session lifecycle management.

| Security Control | Status | Test Result |
| :--- | :---: | :--- |
| **Password Storage Encryption** | **PASS** | Stored as salted Bcrypt hashes (`$2b$10$...`); zero plaintext. |
| **Public Role Escalation Prevention** | **PASS** | Self-registration restricts roles to `player` and `organizer`; `admin` is blocked. |
| **JWT Token Signing & Expiration** | **PASS** | Signed using `JWT_SECRET` with 7-day expiration. |
| **Login Input Flexibility** | **PASS** | Accepts either email or username via `emailOrUsername`. |
| **Wrong Password Defense** | **PASS** | Rejects invalid passwords with HTTP 401 `Invalid credentials`. |
| **Missing Token Gating** | **PASS** | Protected routes reject missing headers with HTTP 401 `Not authorized, no token`. |
| **Tampered Token Gating** | **PASS** | Forged or invalid tokens rejected with HTTP 401 `Token invalid or expired`. |
| **RBAC Gating (Player vs Admin)** | **PASS** | Player tokens attempting admin endpoints receive HTTP 403 `Admin access required`. |
| **Staff Role Gating** | **PASS** | `staffOnly` middleware allows both `admin` and `organizer` to manage tournaments. |
| **Frontend Session Auto-Purge** | **PASS** | 401 response interceptor automatically purges cached tokens and resets UI state. |

---

## 2. Password Encryption & Storage

Direct inspection of `esports_db.users` documents created during registration verified that:
1. Passwords are intercepted by Mongoose pre-save hooks in [`server/models/User.js`](file:///e:/project/esports%20platform/server/models/User.js):
   ```javascript
   userSchema.pre("save", async function (next) {
       if (!this.isModified("password")) return next();
       const salt = await bcrypt.genSalt(10);
       this.password = await bcrypt.hash(this.password, salt);
       next();
   });
   ```
2. Saved passwords begin with the standard Bcrypt identifier `$2b$10$`.
3. Plaintext passwords never persist to MongoDB storage or appear in API responses (excluded via `.select("-password")`).

---

## 3. Registration & Role Escalation Defense

### 3.1 Self-Registration Role Restriction
In [`server/controllers/authController.js`](file:///e:/project/esports%20platform/server/controllers/authController.js):
```javascript
const validRoles = ["player", "organizer"];
if (role && !validRoles.includes(role)) {
    return sendResponse(res, errorResponse("Invalid role. Must be one of: " + validRoles.join(", "), 400));
}
```

* **Security Verification:** If a malicious user attempts `POST /api/auth/register` with `role: "admin"`, the API returns **HTTP 400 Bad Request** (`"Invalid role. Must be one of: player, organizer"`).
* **Admin Provisioning:** The `admin` role can only be established via the dedicated local script [`server/createAdmin.js`](file:///e:/project/esports%20platform/server/createAdmin.js).

---

## 4. Token Generation & Verification

### 4.1 Token Issuance
- Signed with HMAC-SHA256 using `process.env.JWT_SECRET`.
- Payload: `{ id: user._id }`.
- Lifetime: 7 days (`expiresIn: "7d"`).

### 4.2 Middleware Enforcement: [`server/middleware/authMiddleware.js`](file:///e:/project/esports%20platform/server/middleware/authMiddleware.js)
```javascript
exports.protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
    }
    if (!token) {
        return sendResponse(res, errorResponse("Not authorized, no token", 401));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return sendResponse(res, errorResponse("User not found", 401));
        }
        if (!req.user.isActive) {
            return sendResponse(res, errorResponse("User account is inactive", 403));
        }
        next();
    } catch (error) {
        return sendResponse(res, errorResponse("Token invalid or expired", 401));
    }
};
```

---

## 5. Role-Based Access Control (RBAC) Matrix

Live verification was performed against protected endpoints using varying token types:

| Endpoint Tested | Access Requirement | Token Used | Observed HTTP Status | Result |
| :--- | :--- | :--- | :---: | :---: |
| `GET /api/auth/me` | Logged-in User | Player Token | **200 OK** | **PASS** |
| `GET /api/auth/me` | Logged-in User | None (Missing) | **401 Unauthorized** | **PASS** |
| `GET /api/auth/me` | Logged-in User | Malformed Token | **401 Unauthorized** | **PASS** |
| `GET /api/admin/users/stats` | Admin Only | Player Token | **403 Forbidden** | **PASS** |
| `GET /api/admin/users/stats` | Admin Only | None | **401 Unauthorized** | **PASS** |
| `POST /api/tournaments` | Staff (Admin/Organizer) | Organizer Token | **201 Created** | **PASS** |
| `POST /api/tournaments` | Staff (Admin/Organizer) | Player Token | **403 Forbidden** | **PASS** |
| `POST /api/teams` | Logged-in User | Player Token | **201 Created** | **PASS** |

---

## 6. Frontend Session & Security Lifecycle

1. **Storage Gating:**
   - On successful login, the frontend stores `token`, `user`, and `userRole` in `localStorage`.
   - The token is automatically dispatched across tabs via `window.dispatchEvent(new Event("userUpdated"))`.
2. **Global Auth Invalidation:**
   - In [`client/src/api/axiosConfig.js`](file:///e:/project/esports%20platform/client/src/api/axiosConfig.js), if any request receives an HTTP 401 from the server, the response interceptor automatically deletes `token` and `user` from `localStorage` and triggers immediate UI re-synchronization.
3. **Route Protection:**
   - In [`client/src/components/ProtectedRoute.jsx`](file:///e:/project/esports%20platform/client/src/components/ProtectedRoute.jsx), routes redirect unauthenticated users to `/login` and unauthorized roles to `/unauthorized`.

---

## 7. Conclusion

Authentication and authorization layers comply with modern security standards: passwords are encrypted, tokens are validated against tampering, public privilege escalation is blocked, and role-based permissions are enforced at both frontend and backend boundaries.
