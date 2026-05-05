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
