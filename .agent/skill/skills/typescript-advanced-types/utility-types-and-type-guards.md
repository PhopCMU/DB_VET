# Utility Types and Type Guards

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องการ:
- Transform type ที่มีอยู่แล้วแทนการเขียน type ใหม่
- ตรวจสอบ type ที่ runtime (type guards)
- Extract หรือ Narrow types จาก API responses

## 2. Preconditions

- TypeScript 5 strict mode
- model/ directory มี types: `authModel.ts`, `projectModel.ts`, `roleModel.ts` เป็นต้น

## 3. Inputs

- `BASE_TYPE` — type ที่ต้องการ transform หรือตรวจสอบ

## 4. Outputs

- Utility type หรือ type guard ที่ใช้งานได้

## 5. ขั้นตอน

### ขั้นที่ 1 — Built-in Utility Types ที่ใช้บ่อย

```tsx
// ✅ Partial — ทำให้ทุก field เป็น optional (ใช้กับ form draft)
interface Employee {
  id: string;
  name: string;
  department: string;
  salary: number;
}

type EmployeeFormData = Partial<Employee>; // ทุก field optional

// ✅ Required — ทำให้ทุก field เป็น required
type CompleteEmployee = Required<EmployeeFormData>;

// ✅ Pick — เลือกเฉพาะบาง field
type EmployeeListItem = Pick<Employee, "id" | "name" | "department">;

// ✅ Omit — ลบบาง field
type CreateEmployeeInput = Omit<Employee, "id">; // ไม่ต้องการ id ตอนสร้าง

// ✅ Readonly — ป้องกัน mutation
type ImmutableEmployee = Readonly<Employee>;
```

### ขั้นที่ 2 — Record Type

```tsx
// ✅ Record — สร้าง object type จาก key และ value
type DepartmentMap = Record<string, Employee[]>;
type PermissionMap = Record<string, boolean>;

// ตัวอย่างในโปรเจกต์
const permissions: Record<string, boolean> = {
  canViewReports: true,
  canEditEmployees: false,
  canDeleteRecords: false,
};
```

### ขั้นที่ 3 — Type Guards (Runtime Checks)

```tsx
// ✅ isX function — ตรวจสอบ type ที่ runtime
function isEmployee(value: unknown): value is Employee {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    typeof (value as Employee).id === "string" &&
    typeof (value as Employee).name === "string"
  );
}

// การใช้งาน
const data: unknown = await fetchFromAPI();
if (isEmployee(data)) {
  console.log(data.name); // ✅ TypeScript รู้ว่าเป็น Employee
}
```

### ขั้นที่ 4 — API Response Type Guard

```tsx
// ✅ ตรวจสอบ API response ที่ unknown
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function isApiResponse<T>(
  value: unknown,
  isT: (v: unknown) => v is T
): value is ApiResponse<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "data" in value &&
    isT((value as ApiResponse<T>).data)
  );
}
```

### ขั้นที่ 5 — Conditional Types

```tsx
// ✅ Extract response type จาก async function
type Awaited<T> = T extends Promise<infer U> ? U : T; // built-in ใน TS 4.5+

// ✅ NonNullable — remove null/undefined
type StrictString = NonNullable<string | null | undefined>; // = string

// ✅ ReturnType / Parameters — ดึง type จาก function
function createEmployee(name: string, dept: string): Employee {
  return { id: nanoid(), name, dept, salary: 0 };
}

type CreateEmployeeParams = Parameters<typeof createEmployee>; // [string, string]
type CreateEmployeeReturn = ReturnType<typeof createEmployee>; // Employee
```

### ขั้นที่ 6 — Extract/Exclude จาก Union

```tsx
type EmployeeRole = "admin" | "manager" | "employee" | "viewer";

// ✅ ดึงเฉพาะ roles ที่มีสิทธิ์จัดการ
type ManagementRole = Extract<EmployeeRole, "admin" | "manager">;
// = "admin" | "manager"

// ✅ ลบ role ที่ไม่ต้องการ
type NonAdminRole = Exclude<EmployeeRole, "admin">;
// = "manager" | "employee" | "viewer"
```

## 6. Guardrails

- ❌ ห้ามใช้ `any` แทน `unknown` สำหรับ unvalidated external data
- ❌ ห้าม type assertion (`as Employee`) โดยไม่มี type guard ตรวจสอบก่อน
- ❌ ห้ามเขียน type ซ้ำเมื่อ utility type ทำได้
- ✅ ใช้ `unknown` สำหรับ API response ก่อน type guard เสมอ

## 7. Validation

```bash
npm run lint
# TypeScript strict mode จะ error ถ้า type ไม่ถูกต้อง
```

## 8. Example Prompts

```
@workspace อ่าน utility-types-and-type-guards.md แล้วสร้าง type guard สำหรับ Employee response จาก API
```

```
@workspace ใช้ Pick/Omit จาก Employee type ใน model/ เพื่อสร้าง form input type
```

```
@workspace ตรวจว่า routers/getService.tsx ใช้ type ที่ถูกต้องสำหรับ API response
```

## 9. Links

- [discriminated-unions-for-ui-states.md](./discriminated-unions-for-ui-states.md)
- [typed-api-contracts.md](./typed-api-contracts.md)
