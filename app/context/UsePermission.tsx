"use client";
import { useMemo } from "react";
import { useUser } from "./UserContext";

interface Permission {
  submenuId: string;
  projectId?: string;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  view?: boolean;
}

export function usePermission(SUB_MENU_ID: string, PROJECT_ID?: string) {
  const { userData, isSuperAdmin } = useUser();

  const matchPermission = (perm: any, action: keyof typeof perm) => {
    // ตรวจสอบ submenuId
    if (perm.submenuId !== SUB_MENU_ID) return false;

    // ถ้า PROJECT_ID มีค่า → ต้องตรงกัน หรือ perm.projectId === null (สิทธิ์ทุกโปรเจ็กต์)
    if (PROJECT_ID != null && PROJECT_ID !== "") {
      if (!(perm.projectId === PROJECT_ID || perm.projectId === null))
        return false;
    }

    // ตรวจสอบสิทธิ์ตาม action
    return perm[action] === true;
  };

  const canCreate = useMemo(
    () =>
      isSuperAdmin ||
      (userData?.UserPermission?.some((perm: Permission) =>
        matchPermission(perm, "create")
      ) ??
        false),
    [userData?.UserPermission, PROJECT_ID, SUB_MENU_ID, isSuperAdmin]
  );

  const canEdit = useMemo(
    () =>
      isSuperAdmin ||
      (userData?.UserPermission?.some((perm: Permission) =>
        matchPermission(perm, "edit")
      ) ??
        false),
    [userData?.UserPermission, PROJECT_ID, SUB_MENU_ID, isSuperAdmin]
  );

  const canDelete = useMemo(
    () =>
      isSuperAdmin ||
      (userData?.UserPermission?.some((perm: Permission) =>
        matchPermission(perm, "delete")
      ) ??
        false),
    [userData?.UserPermission, PROJECT_ID, SUB_MENU_ID, isSuperAdmin]
  );

  const canView = useMemo(
    () =>
      isSuperAdmin ||
      (userData?.UserPermission?.some((perm: Permission) =>
        matchPermission(perm, "view")
      ) ??
        false),
    [userData?.UserPermission, PROJECT_ID, SUB_MENU_ID, isSuperAdmin]
  );

  return { canCreate, canEdit, canDelete, canView };
}
