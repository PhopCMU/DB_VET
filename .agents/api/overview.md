# API Overview

## Transport

- Axios is the primary client (`app/routers/**`); some pages/hooks use native `fetch`.
- Base URL is `config.URL_API`, sourced from `NEXT_PUBLIC_API_URL` with a sandbox fallback.
- Most protected calls send `Authorization: Bearer ${localStorage.getItem("authToken") || ""}`.
- Several payloads are encrypted with `crypto-js` and sent as query parameters such as `encryptedData` or `studentData`.

## Client endpoint groups

- Auth: `/role/auth/exchange-code`, `/role/auth/verify-token`, `/role/user/add-account`.
- Roles/menus/projects: `/role/menu`, `/role/project`, `/role/add`, `/role/user/api/v1/list`, department and permission endpoints.
- Project database selection: `/role/project` returns project records used by `/dashboard/finance/projectDatabase`; the client filters records by `database` and `UserPermission` before rendering a module.
- 360: `/role/360/user`, `/role/360/hr`, `/role/360/hr/create`, `/role/360/hr/update`, `/role/360/hr/remove`.
- Anatomy: `/anatomy/student/all/user/role/staff`, student file/score/certificate/status endpoints. The finance project database uses this surface for student payment-slip and record operations.
- CMUVC: student, vet, personnel, participant, abstract, package, sponsor and event endpoints under `/role/**` and `/cmuvc/**`; the project database payment view reads `/role/payment/data/approved` and can update participant/abstract payment files/status.
- VetRun: participant/payment/animal/tracking/shirt/sponsor endpoints under `/role/api/v1/vetrun/**`, plus `/vetrun/sponsors`; the project database includes payment verification and shirt-order workflows.
- SCB: `/scb/api/v1/token`, `/qrcode`, `/void`, `/data`, `/inquiry`, `/check/wait`.

## Not found

- Backend OpenAPI/Swagger specification, complete request schemas, response schemas, status-code contract, and server-side authorization implementation: `ไม่พบข้อมูล`.