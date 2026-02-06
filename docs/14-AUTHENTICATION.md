# Lunaz — Authentication Integration

This document describes the current state of authentication, identified gaps, and the plan for a full-featured, robust auth system including OAuth, JWT + refresh tokens, session/device logging in MongoDB, and seamless client-side token refresh.

---

## 1. Current State Analysis

### 1.1 Backend

| Component                           | Status          | Notes                                                                                            |
| ----------------------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| **POST /auth/register**             | ✅ Implemented  | Email, password, name, phone; returns JWT only.                                                  |
| **POST /auth/login**                | ✅ Implemented  | Returns single JWT; no refresh token.                                                            |
| **GET /auth/me**                    | ✅ Implemented  | Protected; returns current user from JWT.                                                        |
| **POST /auth/forgot-password**      | ✅ Implemented  | Token-based reset flow.                                                                          |
| **POST /auth/reset-password**       | ✅ Implemented  | Consumes reset token.                                                                            |
| **POST /auth/validate-reset-token** | ✅ Implemented  | Validates without consuming.                                                                     |
| **POST /auth/oauth/google**         | ❌ **Missing**  | Frontend calls it; backend has no route → 404.                                                   |
| **POST /auth/oauth/facebook**       | ❌ **Missing**  | Same as Google.                                                                                  |
| **POST /auth/refresh**              | ❌ **Missing**  | No refresh token flow; users rely on single long-lived JWT.                                      |
| **JWT**                             | ✅ Single token | `lib/jwt.ts`: sign/verify; expiry from `JWT_EXPIRES_IN` (e.g. 7d).                               |
| **Auth middleware**                 | ✅              | Verifies Bearer token; 401 on missing/invalid/expired.                                           |
| **User model**                      | ⚠️ Partial      | `passwordHash` required; no OAuth provider IDs; no session/schema for “sessions” or “auth logs”. |

**User model (current):**

- `email`, `passwordHash`, `name`, `phone`, `role`, `emailVerified`, `addresses`, `resetPasswordToken`, `resetPasswordExpires`, timestamps.
- **Gaps:** No `googleId` / `facebookId`; `passwordHash` is required (blocks OAuth-only users). No link to “sessions” or “auth events”.

**Config:**

- `JWT_SECRET`, `JWT_EXPIRES_IN` present. No `JWT_REFRESH_EXPIRES_IN`, no `GOOGLE_CLIENT_SECRET` / `FACEBOOK_APP_SECRET` in backend env schema (they exist in `.env.example` only).

### 1.2 Frontend (Web App)

| Component              | Status | Notes                                                                                                                                                               |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Login / Register**   | ✅     | Email/password; token and user stored in `localStorage`.                                                                                                            |
| **OAuth UI**           | ✅     | Google (One Tap / redirect) and Facebook buttons and flows.                                                                                                         |
| **OAuth backend call** | ⚠️     | Calls `/auth/oauth/{google,facebook}` with credential; backend does not implement these → fails.                                                                    |
| **Token storage**      | ✅     | `lunaz_token`, `lunaz_user` in localStorage.                                                                                                                        |
| **API client**         | ⚠️     | No interceptor. Each call that needs auth receives `token` explicitly (e.g. `api(path, { token })`). No automatic attachment of token, no 401 handling, no refresh. |
| **Token refresh**      | ❌     | Not implemented; when JWT expires user is logged out.                                                                                                               |

**AuthContext:** Provides `login`, `register`, `loginWithGoogle`, `loginWithFacebook`, `logout`, and state. OAuth handlers call non-existent backend routes.

### 1.3 Manage App

- Admin login only (email/password); same backend `/auth/login`. No OAuth. No refresh token.

### 1.4 Summary of Gaps

1. **OAuth not functional:** Backend routes and logic for Google/Facebook are missing; env for client secrets not validated.
2. **No refresh token:** Single JWT; when it expires, user is logged out. No “refresh” endpoint or rotation.
3. **No seamless refresh on 401:** API client does not intercept 401 and retry with a new token.
4. **OAuth users and phone:** Business requirement: even OAuth users must provide phone (e.g. for orders). No flow to collect phone after OAuth sign-in.
5. **No auth audit trail:** No MongoDB collections for sessions, devices, or login events (last login, IP, user agent, etc.) for security and “logged-in devices” UX.

---

## 2. Target Architecture

### 2.1 Token Strategy

- **Access token (JWT):** Short-lived (e.g. 15m–1h). Sent on every API request; used by auth middleware.
- **Refresh token:** Long-lived (e.g. 7d–30d), stored in DB (or in a dedicated `RefreshToken`/session document), associated with a “session” and device metadata. Returned only on login/register/OAuth (and optionally on refresh with rotation).
- **Flow:** Client stores both; uses access token in `Authorization`. On 401 (expired/invalid), client calls `POST /auth/refresh` with refresh token; backend returns new access token (and optionally new refresh token). Client retries the original request. No user-visible logout until refresh fails or is revoked.

### 2.2 OAuth Integration

- **Backend:** Add `POST /auth/oauth/google` and `POST /auth/oauth/facebook`. Verify ID token (Google) or access token (Facebook) using server-side client secrets. Find or create user by provider + provider ID; if new user, require `phone` (and optionally name/email from provider). Return same login response as password login (access + refresh token, user summary).
- **User model:** Add optional `googleId`, `facebookId`; make `passwordHash` optional when at least one OAuth ID is set. Keep `phone` required for all users (enforced at first login or in “complete profile” step for OAuth).

### 2.3 Auth Sessions and Logs (MongoDB)

- **Sessions (e.g. `auth_sessions` or `refresh_tokens`):** One document per “login session”: user, refresh token hash, device fingerprint, user agent, IP, last used, created at. Used to validate refresh tokens and to list “logged-in devices” and revoke sessions.
- **Auth logs (e.g. `auth_logs`):** Append-only log of events: login (method: password/google/facebook), logout, refresh, failure (wrong password, invalid token). Fields: user (optional), event type, timestamp, IP, user agent, success/failure, optional reason. Enables “last login”, security audit, and debugging.

### 2.4 API Client (Web)

- **Centralized API client** that:
  - Reads access token from a single source (e.g. AuthContext/store or a getter).
  - Attaches `Authorization: Bearer <access_token>` when token is present.
  - On 401 response: call `POST /auth/refresh` with refresh token; on success, update stored tokens and retry the original request once; on failure, clear tokens and redirect to login (or trigger logout).
- **AuthContext** continues to own token state but stores both access and refresh token (or only refresh and fetches access on init if we prefer). Alternatively, the client can get token from context so all `api()` calls automatically use the latest token and refresh when needed.

### 2.5 Phone for OAuth Users

- If user signs in with OAuth and has no `phone` (or we introduce “profile incomplete”): after first OAuth callback, return a response that indicates “phone required” (e.g. `requiresPhone: true` with user and tokens). Frontend shows a small form to collect phone; then `PATCH /users/me` or `POST /auth/complete-profile` with phone. Backend updates user and clears “requires phone” for that session.

---

## 3. Data Models (MongoDB)

### 3.1 User (Updates)

- Add optional: `googleId` (string, unique, sparse), `facebookId` (string, unique, sparse).
- Change `passwordHash` to optional (required only when neither `googleId` nor `facebookId` is set).
- Ensure `phone` remains required for all users; for OAuth-first sign-up, set a placeholder or require it before first “successful” login response (e.g. in complete-profile step).

### 3.2 Auth Session (New)

- **Collection:** `auth_sessions` (or `refresh_tokens`).
- **Fields (example):** `userId` (ObjectId), `refreshTokenHash` (string), `userAgent` (string), `ip` (string), `deviceLabel` (string, optional), `lastUsedAt` (Date), `createdAt` (Date), `revokedAt` (Date, optional). Index on `refreshTokenHash`, on `userId`, and on `userId + revokedAt` for listing active sessions.

### 3.3 Auth Log (New)

- **Collection:** `auth_logs`.
- **Fields (example):** `userId` (ObjectId, optional), `event` (enum: `login`, `logout`, `refresh`, `login_failed`, `refresh_failed`), `method` (enum: `password`, `google`, `facebook`), `ip` (string), `userAgent` (string), `success` (boolean), `reason` (string, optional), `createdAt` (Date). Index on `userId`, on `createdAt`, and compound for “last login” per user.

---

## 4. API Specification (New/Updated)

### 4.1 Auth Endpoints

| Method | Path                      | Description                                                                                                                                                                  |
| ------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | /auth/register            | Unchanged; response to include `refreshToken` and optionally `expiresIn` for access.                                                                                         |
| POST   | /auth/login               | Unchanged; response to include `refreshToken` and session created; log event.                                                                                                |
| POST   | /auth/refresh             | **New.** Body: `{ refreshToken }`. Validates refresh token and session; returns new access token (and optionally new refresh token). Log event.                              |
| POST   | /auth/logout              | **New (optional).** Body: `{ refreshToken }` or use current access token to identify session. Revoke session; log event.                                                     |
| POST   | /auth/oauth/google        | **New.** Body: `{ credential }` (Google ID token). Verify; find/create user; require phone if new; create session; return tokens + user (or `requiresPhone` + partial user). |
| POST   | /auth/oauth/facebook      | **New.** Body: `{ accessToken }` (from Facebook SDK). Verify; find/create user; require phone if new; create session; return tokens + user (or `requiresPhone`).             |
| GET    | /auth/sessions            | **New.** Protected. List active sessions for current user (from auth_sessions); return lastUsedAt, userAgent, deviceLabel, session id for “revoke” UX.                       |
| POST   | /auth/sessions/:id/revoke | **New.** Protected. Revoke a session by id (and ensure it belongs to current user).                                                                                          |

**Last login:** Query `auth_logs` for the latest `event: 'login'`, `success: true`, `userId` to show "Last login" in UI. Optional: add `lastLoginAt` to `GET /auth/me` or a dedicated `GET /auth/me/last-login` that reads from `auth_logs`.

### 4.2 Response Shapes

- **Login/Register/OAuth success:** `{ user, token, refreshToken, expiresIn? }`. `token` = access token.
- **OAuth “phone required”:** `{ requiresPhone: true, user: partialUser, token, refreshToken }` and require `PATCH /users/me` with `phone` before allowing full access (or enforce in backend on first order).
- **Refresh:** `{ token, expiresIn? }` or `{ token, refreshToken, expiresIn? }` if rotating.

### 4.3 Config (Backend Env)

- Add: `JWT_REFRESH_EXPIRES_IN` (e.g. `7d`), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`. Validate only when OAuth is used (optional if not configured).

---

## 5. Implementation Plan (Order of Work)

1. **Documentation** (this doc) — Done.
2. **Backend – JWT and refresh token**
   - Add `JWT_REFRESH_EXPIRES_IN`; in `lib/jwt.ts` add `signRefreshToken` / `verifyRefreshToken` (or reuse with different secret/expiry).
   - Create `auth_sessions` model (refresh token hash, userId, device metadata, lastUsedAt, createdAt).
   - On login/register: create session, store hashed refresh token, return access + refresh token.
   - Add `POST /auth/refresh`: verify refresh token, check session exists and not revoked, update lastUsedAt, issue new access token (and optionally rotate refresh token).
   - Auth middleware: unchanged (still only access token).
3. **Backend – Auth logs**
   - Create `auth_logs` model; helper to write log entry (userId, event, method, ip, userAgent, success, reason).
   - Call helper from login, register, refresh, logout, and OAuth handlers (and on failure where applicable).
4. **Backend – OAuth**
   - Add env vars for Google/Facebook (client ID + secret). Install Google auth library (e.g. `google-auth-library`) and use for ID token verification; for Facebook, use server-side graph API to validate access token and get user info.
   - Add `POST /auth/oauth/google` and `POST /auth/oauth/facebook`; find or create user; if create and phone missing, return `requiresPhone` and temporary tokens or require phone in same request (body: `{ credential, phone? }`).
   - Update User model: optional `passwordHash`; add `googleId`, `facebookId` (sparse unique). Enforce phone required at creation or in a follow-up “complete profile” step.
5. **Backend – Sessions API**
   - `GET /auth/sessions`: list non-revoked sessions for `req.user.id`. Return safe fields (id, lastUsedAt, userAgent, deviceLabel).
   - `POST /auth/sessions/:id/revoke`: set `revokedAt` for that session (and ensure ownership).
6. **Frontend – API client and refresh**
   - Refactor API client so it can get access (and refresh) token from a getter (e.g. from AuthContext). On 401, call refresh endpoint; on success update tokens and retry request; on failure clear storage and redirect to login.
   - Ensure AuthContext stores and exposes `refreshToken`; after login/register/OAuth, store both tokens. Optionally expose a method like `setTokens` so the client can update after refresh.
7. **Frontend – OAuth and phone**
   - Keep existing OAuth UI; backend will now respond. If response has `requiresPhone`, show modal/page to collect phone and call `PATCH /users/me` or `POST /auth/complete-profile`, then continue.
8. **Manage app**
   - Use same refresh flow if we add refresh token to admin login (recommended for consistency).

---

## 6. Security Considerations

- **Refresh token:** Store only hash in DB; issue opaque token to client. Validate hash on refresh; use secure comparison.
- **Logout:** Revoke session (set `revokedAt`) so refresh token cannot be reused.
- **Sessions list:** Allow user to revoke other sessions (e.g. “log out other devices”).
- **Rate limiting:** Keep/expand rate limits on `/auth/login`, `/auth/refresh`, and OAuth endpoints.
- **CORS and cookies:** If refresh token is ever moved to HttpOnly cookie, configure CORS and SameSite appropriately; for now, localStorage + interceptor is acceptable with short-lived access token.

---

## 7. Testing Checklist

- [ ] Register → receive access + refresh token; session and auth log created.
- [ ] Login → same; auth log has last login info.
- [ ] Request with expired access token and valid refresh token → 401 → client refreshes → retry succeeds.
- [ ] Request with invalid/expired refresh token → refresh fails → client clears storage and redirects to login.
- [ ] OAuth Google: new user → require phone → complete profile → tokens and user returned.
- [ ] OAuth Google: existing user with phone → tokens and user returned.
- [ ] OAuth Facebook: same as Google.
- [ ] GET /auth/sessions returns only current user’s sessions; revoke removes session and refresh no longer works for that token.
- [ ] Auth logs queryable for “last login” and “login history” (admin or user-facing “recent activity”).

---

## 8. References

- Backend auth module: `apps/backend/src/modules/auth/`
- Web AuthContext: `apps/web/src/context/AuthContext.tsx`
- API client: `apps/web/src/api/client.ts`
- Backend env: `packages/config/src/env.ts`, `.env.example`

---

## 9. OAuth Troubleshooting

### 400 Bad Request from backend (POST /auth/oauth/google)

If the callback page shows "Sign-in failed" or you see **400** in the Network tab for `POST .../auth/oauth/google`, open the response body (Preview or Response tab). The JSON `error.message` will tell you:

- **redirect_uri_mismatch** — Add the exact redirect URI from the message to Google Console (see below). Use the same host (localhost vs 127.0.0.1) and port as the page you opened.
- **"Either credential or (code + redirectUri) is required"** — The backend did not receive `code` and `redirectUri` (e.g. request body/query not sent or parsed). Ensure the callback sends a POST with JSON body `{ "code", "redirectUri" }` or the same as query params.

### Error 400: redirect_uri_mismatch (from Google)

Google returns this when the **redirect URI** your app sends is not listed in your OAuth client. You must add it in the **same** OAuth client whose Client ID you use in the app.

**Step-by-step (copy-paste the URI):**

1. Go to **[Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)**.
2. Under **OAuth 2.0 Client IDs**, click the client that matches your app’s Client ID (e.g. `605614152464-...apps.googleusercontent.com`). It must be type **Web application**.
3. Scroll to **Authorized redirect URIs**.
4. Click **+ ADD URI**.
5. Paste this **exactly** (no space, no trailing slash):
   ```text
   http://localhost:3000/auth/google/callback
   ```
6. Click **Save** at the bottom. Wait 1–2 minutes, then try signing in again.

**Important:** This is **not** the same as “Authorized JavaScript origins”. You need the redirect URI in **Authorized redirect URIs**. If your app runs on a different port, use that port (e.g. `http://localhost:5173/auth/google/callback`).

**localhost vs 127.0.0.1:** The redirect URI must **exactly** match the URL the user is on. If you open the app as `http://127.0.0.1:3000`, add `http://127.0.0.1:3000/auth/google/callback` as well. If you use both, add both URIs in Google Console.

### "Can't continue with google.com" / "Something went wrong"

This usually means the **JavaScript origin** is not allowed.

1. In the same OAuth client, under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (or your app’s origin and port).
2. Save and try again.

### CORS / "Server did not send the correct CORS headers" / 400 appears as CORS error

The backend allows both `http://localhost:3000` and `http://127.0.0.1:3000` (and the same for the manage app). If you open the app via `127.0.0.1`, the browser sends that as `Origin`; if it wasn’t allowed, the server wouldn’t send `Access-Control-Allow-Origin` and the browser would report a CORS error even when the real issue is 400. After the fix, 4xx responses still include CORS headers so you see the real error (e.g. validation) in the Network tab. Use the same origin in Google Cloud (e.g. if you use `localhost`, add `http://localhost:3000`; if you use `127.0.0.1`, add `http://127.0.0.1:3000`).
