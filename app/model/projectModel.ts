import type { UserPermission } from "./vetrun/Permission";

// กำหนดโครงสร้างของรายการเมนู

export interface ProjectModel {
  projectId: string;
  name: string;
  description: string;
  database: string;
  part: string | null;
  position: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProjectWithPermissions = ProjectModel & {
  UserPermission: UserPermission[];
};
