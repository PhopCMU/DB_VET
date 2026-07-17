# Authorization Rules Evidenced in Code

- `UserContext` verifies `authToken` through `verifyToken`; invalid/absent sessions clear user state and navigate to `/`.
- `isSuperAdmin` is true when the authenticated `userId` is included in IDs loaded by `SUPER_ADMIN_IDS()`.
- `usePermission(submenuId, projectId)` checks `UserPermission` entries for `create`, `edit`, `delete`, or `view`.
- A permission matches when `submenuId` matches and, when a project is supplied, `projectId` matches or is `null`.
- Super admins bypass those permission checks.
- The finance project database selector uses submenu ID `e432a5bf-eda0-4638-848d-26df9194f57e`; non-super-admin users see only projects whose `UserPermission` contains their user ID, this submenu ID, and `view === true`.
- A selected project must match both the `Project` query/localStorage value and the `Module` database value. Invalid selections are cleared and redirected to `/dashboard/finance/projectDatabase`.
- CMUVC module actions additionally use project ID `ee9ce62b-2e02-4682-9ecf-9f9b564ee5e3` with `canView`, `canCreate`, `canEdit`, and `canDelete` checks.

## Not found

- Source of the super-admin ID list, backend enforcement, role assignment workflow, and complete policy matrix: `ไม่พบข้อมูล`.
- These are client-observed checks and must not be treated as the sole security boundary.