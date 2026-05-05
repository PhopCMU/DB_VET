import { Animal } from "./animalModel";

export interface Employees {
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
  createdAt: string;
  updatedAt: string;

  size: {
    shirtId: string;
    size: string;
    [keyof: string]: any;
  };
  Animal: Animal[] | null;
}

interface Size_shirt {
  shirtId?: string;
  point: number;
  s_high: number;
  s_width: number;
  size: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OrderItem {
  orderId: string;
  shirtmodelId: string;
  userSaleshirtId: number;
  createdAt?: string;
  updatedAt?: string;
  size: Size_shirt;
}

export interface Order {
  userId: string;
  delivery_address: string;
  email: string;
  ems_tracking?: string;
  fullname: string;
  payment: boolean;
  phone: string;
  sh_collection_method: string;
  total_amount: number;
  transferFile: string;
  createdAt?: string;
  updatedAt?: string;
  OrderItem: OrderItem[];
}
