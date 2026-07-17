# Security Review: CMUVC GetRouter.tsx

**File**: `app/routers/cmuvc/GetRouter.tsx`  
**Type**: Client-side API layer (Next.js)  
**Date**: 2026-07-16  
**Severity**: Medium-High  
**Status**: ✅ Fixed (scoped to this file) — 2026-07-16

## Implementation Notes

- **1.1 localStorage token**: NOT changed. This is a repo-wide pattern used in 80+ call sites across 20+ files (see `.agents/01_PROJECT_FACTS.md`). Migrating to HttpOnly cookies requires backend session middleware + app-wide refactor — out of scope for a single-file fix. Needs separate approval/ticket.
- **1.2 Client-side encryption**: Skipped per user confirmation — the AES step is only used to serialize/transport data as a string for the backend to parse; the key is not a real secret. Left unchanged.
- **1.3 Error handling**: ✅ Fixed. Added `safeErrorResponse()` helper — logs full error via `console.error` for debugging, but only returns a safe backend `message` string (or generic fallback) to callers. Removed all raw `error.response.data` passthroughs and the buggy unguarded `error.response.data.message` access.
- **2.1 Input validation**: ✅ Fixed (lightweight, no new dependency per repo "no new deps" rule). Added `isValidDate()` and `sanitizeText()` (trims + caps length) helpers, applied to all `date`, `visitorId`, and `title` parameters.
- **2.2 Rate limiting / 2.3 Null safety / Phase 3 (CORS/CSP)**: Not implemented — these are cross-cutting/backend concerns beyond this file's scope. Return types for `getFoods`/`getAdstractType` (`undefined` on failure) were kept unchanged to avoid breaking existing callers.
- Reduced duplication with `getAuthHeaders()` helper (still reads from `localStorage`, consistent with the rest of the app until Phase 1.1 is addressed separately).

---

## Executive Summary

The `GetRouter.tsx` module handles sensitive API communication (user data, participant lists, payment data) with **6 critical security gaps** that require remediation before production use:

1. ❌ Token stored in insecure `localStorage`
2. ❌ Secret key exposed to client-side (NEXT_PUBLIC_* anti-pattern)
3. ❌ Inconsistent error handling & information leakage
4. ❌ Missing input validation
5. ❌ No rate limiting protection
6. ❌ Unhandled null/undefined edge cases

---

## Vulnerability Analysis

### 🔴 CRITICAL: Token Storage in localStorage

**Location**: Lines 9, 40, 53, 71, 85, 99, 115, 128, 147, 165, 185

```typescript
Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
```

**Risk**:
- `localStorage` is vulnerable to XSS attacks
- Token visible to any script on the page
- No expiration enforcement
- No HttpOnly flag available in browser storage

**Impact**: Complete account compromise if XSS vulnerability exists

**Recommended Action**: 
- Migrate to **HttpOnly + Secure cookies** (server-set)
- Use middleware to validate session server-side
- Never store tokens in `localStorage`

**Priority**: ⚠️ CRITICAL

---

### 🔴 CRITICAL: Exposed Secret Key (NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND)

**Location**: Lines 18, 51, 120, 136, 155, 167, 186

```typescript
const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
```

**Risk**:
- `NEXT_PUBLIC_*` variables are embedded in client bundle
- Secret key visible in browser devtools, network requests, source map
- Defeats purpose of encryption (client can decrypt; attacker can too)
- Key rotation requires app redeployment

**Impact**: Encryption provides false security; sensitive data (year, title, user IDs) can be decrypted by anyone

**Recommended Action**:
- Remove client-side encryption entirely
- Use **HTTPS + TLS** for transport security
- Move encryption to backend if needed
- If encryption required: implement server-side with non-exposed keys
- Use `process.env.NEXT_SERVER_CRYPTO_KEY` (server-only) if server-side processing needed

**Priority**: ⚠️ CRITICAL

---

### 🟠 HIGH: Inconsistent Error Handling & Information Leakage

**Location**: Lines 44-50 (and repeated in other functions)

```typescript
} catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }
    console.log(error.response.data.message);  // 🚨 Can log undefined + exposes error details
    return {
      success: false,
      message: error.response.data,  // 🚨 Sends raw error to client
    };
  }
```

**Issues**:
1. Raw error objects returned to frontend (line 48)
2. Inconsistent error handling across functions
3. Backend error details exposed to client
4. `console.log` on line 46 may log undefined
5. No structured error logging for debugging

**Impact**: Information leakage; easier for attackers to identify vulnerabilities

**Recommended Action**:
- Standardize error handling with **safe error messages**
- Use error mapping: Backend error → Generic client message
- Centralize logging (use dedicated service)
- Implement structured error response type

**Priority**: ⚠️ HIGH

---

### 🟠 HIGH: Missing Input Validation

**Location**: Multiple function parameters

```typescript
// Functions accept parameters without validation
export const GetPackage = async (visitorId: string, title?: string)
export const GetParticipantList_Main = async (date: Date, visitorId: string, title?: string)
```

**Issues**:
1. `visitorId` - no format/length validation
2. `title` - no length/type validation (can inject special chars)
3. `date` - assumed valid Date, not checked if invalid
4. No XSS prevention for string parameters

**Impact**: API parameter injection; potential backend errors; unpredictable behavior

**Recommended Action**:
- Add input validation layer (use `zod` or `io-ts`)
- Validate before encryption/sending
- Sanitize string inputs
- Add type guards for Date objects

**Priority**: ⚠️ HIGH

---

### 🟡 MEDIUM: No Rate Limiting

**Location**: All fetch functions (lines 57, 120, 128, 147, 165, 185, 188)

**Risk**:
- No client-side throttling or debouncing
- Backend vulnerable to rapid repeated requests
- Can consume API quotas
- Possible DOS vector

**Recommended Action**:
- Implement request deduplication/debouncing
- Add client-side rate limiter (cache responses for 30-60s)
- Backend rate limiting (IP-based, per-user)

**Priority**: 🟡 MEDIUM

---

### 🟡 MEDIUM: Unhandled Null/Undefined Edge Cases

**Location**: Multiple locations

```typescript
// Line 38: Returns undefined, but calling code may not handle it
return undefined; // ❌ What if caller doesn't check?

// Line 47: Accessing error.response.data without checking existence
return error.response.data; // ❌ Could be undefined

// Line 9: localStorage.getItem() can return null
localStorage.getItem("authToken") || ""  // ✅ Fallback to empty string, but wrong use case
```

**Issues**:
1. Inconsistent return types (sometimes `undefined`, sometimes `null`)
2. No null coalescing in error paths
3. Empty auth token fallback is security smell

**Impact**: Runtime errors if not carefully handled by consumers

**Recommended Action**:
- Use consistent return types (never bare `undefined`)
- Add proper null checks in error handlers
- Document return contracts clearly
- Consider using `Result<T, E>` pattern

**Priority**: 🟡 MEDIUM

---

### 🟡 MEDIUM: No CORS/CSP Validation

**Location**: All axios requests

**Risk**:
- No explicit CORS validation
- No Content Security Policy headers verified
- Requests could be intercepted or redirected

**Recommended Action**:
- Add explicit CORS header validation
- Implement CSP headers on backend
- Add CSRF token if needed

**Priority**: 🟡 MEDIUM

---

## Remediation Plan

### Phase 1: Critical (Must Fix Before Production)

**1.1 Replace localStorage with Secure Cookies**
- [ ] Migrate auth token to HttpOnly cookie
- [ ] Implement session validation middleware
- [ ] Update all functions to remove `localStorage.getItem("authToken")`
- [ ] Set cookie flags: `HttpOnly`, `Secure`, `SameSite=Strict`

**1.2 Remove Client-Side Encryption** (ไม่ต้องแก้ไข ไม่ได้สำคัญ แค่ต้องการ แปลให้เป็น String ส่งไป แปลข้อมูล หลังบ้านเท่านั้น รหัสไม่ได้ลับอะไร)
- [ ] Delete `NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND` usage
- [ ] Replace with server-side encryption (if required)
- [ ] Use HTTPS for transport security
- [ ] Update `.env.example` to remove NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND

**1.3 Standardize Error Handling**
- [ ] Create centralized error handler function
- [ ] Map backend errors to safe client messages
- [ ] Remove raw error object returns
- [ ] Implement structured logging service

### Phase 2: High Priority (Complete Within Sprint)

**2.1 Add Input Validation**
- [ ] Install validation library (recommend `zod` or `io-ts`)
- [ ] Create validation schemas for:
  - [ ] `visitorId` (format, length)
  - [ ] `title` (length, XSS prevention)
  - [ ] `date` (valid Date, year range)
- [ ] Apply validation in each function before API call

**2.2 Implement Rate Limiting**
- [ ] Add response caching (30-60s TTL)
- [ ] Implement request deduplication
- [ ] Add request debouncing for UI interactions

**2.3 Add Null Safety**
- [ ] Use consistent return types
- [ ] Add proper null coalescing operators (`??`)
- [ ] Document function contracts

### Phase 3: Medium Priority (Next Sprint)

**3.1 Add CORS/CSP Validation**
- [ ] Implement origin validation
- [ ] Add CSP header checks

**3.2 Create API Response Types**
- [ ] Centralize `ApiResponse` type definition
- [ ] Add discriminated unions for different response types

---

## Code Example Fixes

### Before (Vulnerable):
```typescript
const headers = {
  Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
  "Content-Type": "application/json",
};
const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
const encryptedData = CryptoJS.AES.encrypt(
  JSON.stringify({ year: date.getFullYear() }),
  secretKey
).toString();
```

### After (Secure):
```typescript
// 1. Token from HttpOnly cookie (automatic with axios/fetch)
// 2. No client-side encryption needed (HTTPS handles transport security)
const headers = {
  "Content-Type": "application/json",
  // Cookie is automatically sent by browser
};

// Validation
import { z } from "zod";
const dateSchema = z.date();
const validatedDate = dateSchema.parse(date);
```

---

## Testing Recommendations

- [ ] Security audit tool scan (e.g., `npm audit`, Snyk)
- [ ] XSS vulnerability test (localStorage injection)
- [ ] OWASP Top 10 checklist
- [ ] Penetration test: token extraction attempt
- [ ] Rate limiting stress test

---

## References

- [OWASP: localStorage Risks](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [MDN: HttpOnly Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
- [Next.js: Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NIST: Cryptographic Key Management](https://csrc.nist.gov/publications/detail/sp/800-57/part-1/final)

---

**Next Step**: Review this report with security team and prioritize fixes before production deployment.
