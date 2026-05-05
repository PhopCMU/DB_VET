export interface SubMenu {
  submenuid: string;
  name: string;
  icon: string;
  part: string;
  position: number;
  menuId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  menuId: string;
  name: string;
  icon: string;
  part: string;
  position: number;
  subMenus: SubMenu[];
  createdAt: string;
  updatedAt: string;
}

export interface Personnel {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  email: string;
  [key: string]: any;
}

export interface SubDepartment {
  subDepartmentId: string;
  name_TH: string;
  name_EN?: string | null;
  mainDepartmentId: string;
}

export interface MainDepartment {
  mainDepartmentId: string;
  name_TH: string;
  name_EN?: string | null;
  subDepartments: SubDepartment[];
}
