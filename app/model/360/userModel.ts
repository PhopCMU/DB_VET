export interface User {
  accountId: string;
  accounttype_en?: string;
  accounttype_th: string;
  cmuaccount: string;
  createdAt: string;
  fullname_en?: string;
  fullname_th: string;
  imageprofile?: File | string | null;
  level1agency_en?: string;
  level1agency_th: string;
  level2agency_en?: string;
  level2agency_th: string;
  level3agency_en?: string;
  level3agency_th: string;
  nickname?: string;
  positiontitle_en?: string;
  positiontitle_th: string;
  ratenumber: string;
  updatedAt: string;
  workingstatus: boolean;
}
