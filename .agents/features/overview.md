# Feature Overview

The main feature areas evidenced by route and router names are:

- Authentication and account provisioning through CMU IT Account / token exchange.
- Dashboard navigation, menu/submenu, project, role, user, and department administration.
- Finance project database selector at `/dashboard/finance/projectDatabase`, with project search, pagination, query/localStorage selection, and module dispatch for Anatomy, CMUVC, and VetRun.
- 360 personnel directory/HR management and reports.
- CMUVC event registration/payment administration: students, veterinarians, personnel, participants, abstracts, packages, food, sponsors, payment files, payment-status verification, and event check-in.
- Anatomy student records/payment administration: student list, scores, certificates, PDPA/payment/file updates, and slip replacement/verification.
- VetRun operations/payment administration: participants, animals, payment approval, sponsor logos, shirt orders/slips, tracking, and checkpoints.
- SCB payment integration: access token, QR creation, inquiry/data polling, void, and realtime payment streams.
- Export/document utilities: PDF, Excel, image capture, QR code, and document extraction dependencies/utilities.

## Business-rule boundary

Names and UI flows establish feature scope only. Pricing, eligibility, payment settlement, event policy, and data-retention rules are owned by backend or domain stakeholders and are `ไม่พบข้อมูล` here.