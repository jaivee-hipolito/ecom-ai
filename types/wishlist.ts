import { IProduct } from './product';

export interface IWishlist {
  _id?: string;
  user: string; // User ID
  products: (IProduct | string)[]; // Array of Product objects or product IDs
  createdAt?: Date;
  updatedAt?: Date;
}

export type Wishlist = IWishlist;
