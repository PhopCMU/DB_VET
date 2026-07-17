# Database and Data Boundary

## Observed data contracts

The client defines TypeScript models, not database entities. Notable model areas are auth/user, menu/role, project, 360 users, anatomy students, CMUVC participants/abstracts/payments, and VetRun animals/employees/orders/permissions.

## Storage

- Server data is accessed through the external API client layer.
- Browser persistence uses `localStorage` for `authToken`, navigation/module selections, and UI tab preferences.
- File/image URLs are received or sent through API functions; PDF/export helpers consume those URLs.

## Not found

- Database engine, schema, migrations, ORM, connection configuration, indexes, foreign-key definitions, and transaction rules: `ไม่พบข้อมูล` in this repository.
- Do not treat TypeScript interfaces as proof of physical database schema.

