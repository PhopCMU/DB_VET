export interface AbstractDataModel {
  abstractId: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  address: string;
  abstractType: {
    abstractTypeId: string;
    adstractType: string;
  };
  categorys: {
    categoryId: string;
    categoryType: string;
  };
  packages: {
    packageId: string;
    category_th: string;
    category_en: string;
    earlyBird: number;
    regularRate: number;
    oneDayParticipant: number;
    endEarlyBird: string;
    endRegularRate: string;
    people: number;
  };
  foods: {
    foodId: string;
    foodType: string;
  };
  titleAbstarct: string;
  fileAbstarct: string;
  statusAbstract: string;
  price: number;
  acc: boolean;
  payments: boolean;
  Imagepayment: null | string;
  createAt: string;
}
