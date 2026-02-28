import { IProduct } from './product';

export interface ICartItem {
  product: IProduct | string; // Product object or product ID
  quantity: number;
  /** Attributes the user selected (e.g. { "size(inch)": "7", "color": "black" }). Single source for size, color, and any others. */
  selectedAttributes?: Record<string, unknown>;
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
