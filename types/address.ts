export interface IAddress {
  _id?: string;
  user: string; // User ID
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type Address = IAddress;

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}
