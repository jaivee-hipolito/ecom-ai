import { IProduct } from './product';
import { ShippingAddress } from './address';

export interface IOrderItem {
  product: IProduct | string; // Product object or product ID
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface IOrder {
  _id?: string;
  user: string; // User ID
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type Order = IOrder;
