import { IProduct } from './product';

export interface ICartItem {
  product: IProduct | string; // Product object or product ID
  quantity: number;
}

export interface ICart {
  _id?: string;
  user: string; // User ID
  items: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type Cart = ICart;

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  items: ICartItem[];
}
