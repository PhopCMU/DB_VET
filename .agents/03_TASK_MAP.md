# Task Map

| Task type | Read first | Then inspect source |
|---|---|---|
| Add or change a page | `architecture/overview.md`, `standards/code.md` | related `app/dashboard/**`, `components/**` |
| Add or change API call | `api/overview.md`, `database/overview.md` | related `app/routers/**`, `app/model/**` |
| Permission or role work | `business/authorization.md` | `app/context/UsePermission.tsx`, `UserContext.tsx` |
| 360 feature | `features/overview.md`, `api/overview.md` | `app/routers/360/**`, `app/dashboard/360/**` |
| CMUVC registration/payment | `features/overview.md`, `api/overview.md` | `app/routers/cmuvc/**`, `app/dashboard/register/**` |
| VetRun | `features/overview.md`, `api/overview.md` | `app/routers/vetrun/**`, `app/dashboard/**/vetrun/**` |
| Anatomy student data | `features/overview.md`, `api/overview.md` | `app/routers/anatomy/**`, related pages |
| Finance project database | `features/overview.md`, `business/authorization.md`, `api/overview.md` | `app/dashboard/finance/projectDatabase/**`, `app/routers/getService.tsx`, related domain routers |
| SCB payment/QR | `api/overview.md`, `features/overview.md` | `app/routers/SCB/**`, `usePaymentSSE.tsx`, `useSocket.tsx` |