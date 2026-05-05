# Typed API Contracts

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อสร้าง service function ใหม่ใน `routers/` หรือเพิ่ม model type ใน `model/`  
เป้าหมาย: TypeScript รู้ type ของ API request และ response ตั้งแต่ต้น

## 2. Preconditions

- TypeScript 5 strict mode
- axios ติดตั้งแล้ว
- `model/` — มี type definitions: `authModel.ts`, `projectModel.ts`, ฯลฯ
- `routers/` — มี service layer: `getService.tsx`, `postService.tsx`, ฯลฯ
- `config/config_api.tsx` — API base URL configuration

## 3. Inputs

- `API_ENDPOINT` — endpoint ที่ต้องการ type
- `REQUEST_SHAPE` — shape ของ request body (ถ้ามี)
- `RESPONSE_SHAPE` — shape ของ response

## 4. Outputs

- Type definitions ใน `model/`
- Service function ใน `routers/` ที่ใช้ type เหล่านั้น
- ไม่สร้างไฟล์ใหม่ถ้าสามารถเพิ่มใน file ที่มีอยู่ได้

## 5. ขั้นตอน

### ขั้นที่ 1 — กำหนด API Response Type ใน model/

```tsx
// model/vetrun/employees.ts (อิงตาม file ที่มีอยู่แล้ว)
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  startDate: string; // ISO date string
  salary: number;
  isActive: boolean;
}

export interface EmployeeListResponse {
  data: Employee[];
  total: number;
  page: number;
  perPage: number;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  startDate: string;
}
```

### ขั้นที่ 2 — Generic API Response Wrapper

```tsx
// model/shared.ts — type ที่ใช้ร่วมกัน
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

### ขั้นที่ 3 — Service Function ที่ Typed (อิง routers/getService.tsx)

```tsx
// routers/vetrun/GetRouter.tsx
import axios from "axios";
import { API_URL } from "@/config/config_api";
import type { Employee, EmployeeListResponse } from "@/model/vetrun/employees";

export async function getEmployees(params?: {
  page?: number;
  department?: string;
}): Promise<EmployeeListResponse> {
  const response = await axios.get<EmployeeListResponse>(
    `${API_URL}/employees`,
    { params }
  );
  return response.data;
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const response = await axios.get<Employee>(`${API_URL}/employees/${id}`);
  return response.data;
}
```

### ขั้นที่ 4 — POST/PUT Service ที่ Typed

```tsx
// routers/vetrun/PostRouter.tsx
import axios from "axios";
import { API_URL } from "@/config/config_api";
import type { Employee, CreateEmployeeRequest } from "@/model/vetrun/employees";
import type { ApiSuccess } from "@/model/shared";

export async function createEmployee(
  data: CreateEmployeeRequest
): Promise<ApiSuccess<Employee>> {
  const response = await axios.post<ApiSuccess<Employee>>(
    `${API_URL}/employees`,
    data
  );
  return response.data;
}
```

### ขั้นที่ 5 — Error Handling ที่ Typed

```tsx
// ✅ Handle axios error ด้วย type guard
import axios, { type AxiosError } from "axios";

interface ApiErrorBody {
  error: string;
  code?: number;
}

function isAxiosError(error: unknown): error is AxiosError<ApiErrorBody> {
  return axios.isAxiosError(error);
}

async function safeGetEmployees() {
  try {
    return await getEmployees();
  } catch (error) {
    if (isAxiosError(error)) {
      // TypeScript รู้ว่า error.response?.data เป็น ApiErrorBody
      const message = error.response?.data?.error ?? "เกิดข้อผิดพลาด";
      throw new Error(message); // throw error ที่ user-safe เท่านั้น
    }
    throw new Error("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
  }
}
```

### ขั้นที่ 6 — Type Props สำหรับ Component ที่รับ API Data

```tsx
// ✅ Component props ที่ type จาก model
import type { Employee } from "@/model/vetrun/employees";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

function EmployeeTable({ employees, onEdit, onDelete, isLoading }: EmployeeTableProps) {
  // TypeScript รู้ type ของ employee ทุก field
  return (
    <table>
      {employees.map((emp) => (
        <tr key={emp.id}>
          <td>{emp.firstName} {emp.lastName}</td>
          <td>{emp.department}</td>
        </tr>
      ))}
    </table>
  );
}
```

## 6. Guardrails

- ❌ ห้ามใช้ `any` เป็น return type ของ service function
- ❌ ห้าม hardcode API URL — ใช้ `config/config_api.tsx`
- ❌ ห้าม log error ที่มี sensitive data (stack trace, user data)
- ❌ ห้าม expose raw error message จาก server ไปยัง user
- ✅ type ทุก API response — ถ้าไม่รู้ shape ให้ใช้ `unknown` แล้วเพิ่ม type guard

## 7. Validation

```bash
npm run lint
# TypeScript จะ error ถ้า type ไม่ match
```

## 8. Example Prompts

```
@workspace อ่าน typed-api-contracts.md แล้วสร้าง service function สำหรับ employees API ใน routers/
```

```
@workspace เพิ่ม TypeScript type สำหรับ Animal API response ใน model/vetrun/animalModel.ts
```

```
@workspace ตรวจว่า routers/getService.tsx ใช้ typed response ถูกต้องหรือยัง
```

## 9. Links

- [discriminated-unions-for-ui-states.md](./discriminated-unions-for-ui-states.md)
- [utility-types-and-type-guards.md](./utility-types-and-type-guards.md)
- [next-best-practices/data-fetching-and-rsc-boundaries.md](../next-best-practices/data-fetching-and-rsc-boundaries.md)
