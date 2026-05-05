export interface Animal {
  animalId: string;
  name: string;
  breed: string;
  weight: string | number | any;
  sex: string;
  fancys: boolean;
  participantId: string;
  createdAt: string;
  updatedAt: string;
}

export type AnimalType = {
  animalId: string;
  name: string;
  breed: string;
  weight: number;
  sex: "DM" | "DF";
};
