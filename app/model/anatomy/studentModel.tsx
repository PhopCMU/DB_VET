export interface StudentData {
  studentId: string;
  prefix: string;
  fname: string;
  levelup: string;
  school: string;
  age: number | string;
  [key: string]: any;
}

export interface StudentUpdateSroceProp {
  [studentId: string]: { [term: string]: number | string };
}

interface UpdateSroceProp {
  term: string;
  subject: string;
  score: number;
  studentId: string;
}

export interface UpdateSroceProps {
  updates: UpdateSroceProp[];
}

interface UpdateCertificateProp {
  studentId: string;
  downloadUrl: string;
}

export interface UpdateCertificateProps {
  updates: UpdateCertificateProp[];
}
