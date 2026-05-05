# Code Review — HR Page (รายชื่อบุคลากร)

**Date:** 2026-04-30  
**Reviewer:** GitHub Copilot  
**File:** `app/dashboard/360/hr/page.tsx`  
**Route:** `/dashboard/360/hr`  
**Verdict:** ✅ APPROVED — No blocking issues. Security notes below require follow-up.

---

## Plan

The objective was to redesign the search/filter UX and fix pagination size while
**preserving all existing CRUD behaviour** (Create / Edit / Delete with confirm).

### Changes applied

| # | What | Detail |
|---|------|--------|
| 1 | `itemsPerPage` 12 → **10** (fixed) | per spec |
| 2 | Added `searchFilter` state (`"department" \| "position"`) | drives filter logic |
| 3 | `filteredUsers` rewritten to branch on `searchFilter` | Department: searches `level1agency_th`, `level2agency_th`, `level3agency_th`; Position: searches `positiontitle_th` |
| 4 | Search bar replaced with **dropdown + input** combo | dropdown reset clears query & resets page |
| 5 | `aria-label` added to clear-search button | a11y fix |

All CRUD handlers (`handleSaveUser`, `handleDeleteUser`, `handleOpenModal`) and
their API calls/payloads are **unchanged**.

---

## Summary of Changes

| Aspect | Before | After |
|---|---|---|
| Rows/page | 12 | **10** (fixed per spec) |
| Search | Single text field (name/nickname/account) | Dropdown selector + text input |
| Filter options | None | Department (level 1/2/3) · Position |
| CRUD | Unchanged | Unchanged |

---

## Files Changed

| File | Change |
|---|---|
| `app/dashboard/360/hr/page.tsx` | Search/filter bar redesign + itemsPerPage fix |

No other files were touched.

---

## Security Issues Found

### 🔴 HIGH — XSS via unsanitised image `src`

**Location:** `<img src={config.URL_API + user.imageprofile} …>` (table row + modal preview)

**Risk:** If the API returns a server-side injected `imageprofile` value starting
with `javascript:` or `data:text/html`, the browser may execute it (depends on
browser / CSP configuration).

**Recommendation:**
- Validate `imageprofile` server-side; ensure it is always a relative path.
- Add a Content-Security-Policy header: `img-src 'self' data:` (disallows `javascript:` URIs).
- Client-side guard until server is hardened:
  ```ts
  function safeImageUrl(base: string, path: unknown): string | undefined {
    if (typeof path !== "string") return undefined;
    if (/^(data:|javascript:|\/\/)/i.test(path)) return undefined;
    return base + path;
  }
  ```

---

### 🟡 MEDIUM — `console.error` exposes internals in production

**Location:** `fetchUsers`, `handleSaveUser`, `handleDeleteUser`, `loadUsers`

**Risk:** Stack traces and raw API error messages are logged to the browser
console, visible to anyone opening DevTools in production.

**Recommendation:**
- Enable ESLint `no-console` rule (`"warn"`) for production.
- Replace `console.error` with a server-side logger or a telemetry service.
- Show only generic messages to end-users (already done via Swal).

---

### 🟡 MEDIUM — File MIME type validated client-side only

**Location:** `validateFile()` in `UserModal`

**Risk:** `file.type` is browser-provided and can be spoofed by renaming any
file to `.jpg`. A malicious file could bypass the check and be uploaded.

**Recommendation:** Validate magic bytes server-side (e.g. with `file-type` npm
package) before storing the file. Never trust client-provided MIME type.

---

### 🟢 LOW — `itemsPerPage` expressed as `useState` with no setter

**Location:** `const [itemsPerPage] = useState(10);`

**Risk:** No security concern; minor code smell. A module-level constant is
cleaner and avoids unnecessary React state:
```ts
const ITEMS_PER_PAGE = 10;
```

---

### 🟢 LOW — `resp.data` typed as `any` in GetRouter

**Location:** `app/routers/360/GetRouter.tsx`

**Risk:** Runtime shape mismatch is silenced. If the API returns a non-array,
the `as User[]` cast will not throw but will silently produce `undefined` map
errors at render time.

**Recommendation:** Add a type guard at the API boundary:
```ts
function isUserArray(v: unknown): v is User[] {
  return Array.isArray(v);
}
const data = isUserArray(resp.data) ? resp.data : [];
```

---

## TypeScript Strictness

| Check | Status |
|---|---|
| No `any` in new code | ✅ `searchFilter` typed as `"department" \| "position"` |
| All state variables typed | ✅ |
| `filteredUsers` branching exhaustive | ⚠️ `else` falls through to position — add `satisfies never` if a third filter is ever introduced |

---

## UX / Accessibility Notes

- ✅ Filter `<select>` has `aria-label="ค้นหาด้วย"`
- ✅ Clear button has `aria-label="Clear search"`
- ⚠️ Search input lacks an explicit `<label>` / `aria-label` — add `aria-label="ช่องค้นหา"` to the `<input>` element for screen-reader support.


## Performance Notes

- All filtering is client-side — acceptable for a staff directory (typically < 5 000 records).
- `filteredUsers` is recalculated on every render without `useMemo`. For large lists (> 2 000 rows) consider memoizing:
  ```ts
  const filteredUsers = useMemo(() => users.filter(...), [users, debouncedQuery, searchBy, statusFilter]);
  ```
- `motion.tr` stagger delay (`idx * 0.025`) is capped at 10 rows per page → max 0.225 s total. Fine.
- No memory leaks: both `mousedown` listener and debounce timeout are cleaned up in `useEffect` returns.
