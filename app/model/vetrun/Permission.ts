export interface UserPermission {
  userPermissionId?: string;
  userId?: string;
  submenuId?: string;
  projectId?: string | null;
  edit: boolean;
  create: boolean;
  view: boolean;
  delete: boolean;
}
