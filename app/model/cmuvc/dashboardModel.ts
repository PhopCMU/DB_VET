export interface CmuvcStudents {
  studentId?: string | any;
  studentCode: string;
  prefix: string;
  fname: string;
  lname: string;
  level: string;
  createAt?: string;
  updateAt?: string | null;
}

export interface CmuvcVet {
  accountId?: string | any;
  prefix: string;
  fname: string;
  lname: string;
  number_ce?: string | number | readonly string[] | undefined;
  createAt: string;
  updateAt: string | null;
}

export interface CmuvcInternRA {
  internshipId?: string | any;
  ce?: string | number | readonly string[] | undefined;
  prefix: string;
  fname: string;
  lname: string;
  category: string;
  createAt: string;
  updateAt?: string | null;
}

export interface CmuvcPersonnel {
  personnelId?: string | any;
  prefix: string;
  fname: string;
  lname: string;
  createAt?: string;
  updateAt?: string | null;
}

interface category {
  categoryId: string;
  categoryType: string;
  createAt?: string;
  status: boolean;
  updateAt?: string;
}

export interface CmuvcParticipant {
  participantId?: string;
  themeTitleId: string;
  categoryId: string;
  packagesId: string;
  price: number;
  ce: string;
  prefix: string;
  fname: string;
  lname: string;
  phone: string;
  email: string;
  organization: string;
  country: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  zipCode: string;
  foodId: string;
  acc: boolean;
  Imagepayment: string;
  packageOneDay: string;
  selectdayId: string;
  payments: boolean;
  createAt: string;
  updateAt: string;
  packages: Package;
  themeTitle: ThemeTitle;
  selectday: SelectDay;
  categorys: Category;
  foods: Food;
}

export interface Package {
  packageId: string;
  themeTitleId: string;
  category_th: string;
  category_en: string;
  earlyBird: number;
  regularRate: number;
  oneDayParticipant: number;
  endEarlyBird: string;
  endRegularRate: string;
  people: number;
  position: number;
  createAt: string;
  updateAt: string;
}

export interface ThemeTitle {
  mainId: string;
  title: string;
  startEvent: string;
  endEvent: string;
  status: boolean;
  part: string;
  position: number;
  createAt: string;
  updateAt: string;
}

export interface SelectDay {
  selectdayId: string;
  day: string;
  month: string;
  year: string;
  dayDate: string;
  createAt: string;
  updateAt: string;
}

export interface Category {
  categoryId: string;
  categoryType: string;
  status: boolean;
  createAt: string;
  updateAt: string;
}

export interface Food {
  foodId: string;
  foodType: string;
  createAt: string;
  updateAt: string;
}
