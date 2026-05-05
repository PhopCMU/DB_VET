export interface ParticipantItem {
  participantId: string;
  themeTitleId: string;
  fname: string;
  lname: string;
  packageOneDay: string;
  payments: boolean;
}

export interface AbstractItem {
  abstractId: string;
  fname: string;
  lname: string;
  statusAbstract: string;
  payments: boolean;
}

export interface ApiResponseData {
  search_participant: ParticipantItem[];
  search_abstract: AbstractItem[];
}

interface Animal {
  animalId: string;
  name: string;
  breed: string;
  weight: string;
  sex: string;
  fancys: boolean;
}

interface Size_sh {
  shirtId: string;
  size: string;
  s_width: number;
  s_high: number;
  point: number;
  participantId: string;
}

interface CheckPoint {
  checkPointId: string;
  checkPoint: boolean;
  participantId: string;
}

export interface ParticipantData {
  participantId: string;
  typeBib: string;
  nameBib: string;
  numberBib: string;
  payment: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: string;
  age: string;
  address: string;
  sizeId: string;
  year: string;
  transferFile: string;
  createdAt: string; // วันที่แนบ สลิป
  animals: Animal[];
  size_shirts: Size_sh[];
}
