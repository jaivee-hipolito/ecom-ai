import { IProduct } from './product';
import { ShippingAddress } from './address';

export interface IOrderItem {
  product: IProduct | string; // Product object or product ID
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface IOrderHistoryEntry {
  modifiedBy?: string;
  modifiedByName: string;
  changes: { field: string; from: string; to: string }[];
  note?: string;
  changedAt?: string;
}

export interface IOrderCoupon {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountAmount?: number;
}

export interface IOrder {
  _id?: string;
  user: string; // User ID
  items: IOrderItem[];
  totalAmount: number;
  shippingFee?: number;
  coupon?: IOrderCoupon;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentId?: string;
  history?: IOrderHistoryEntry[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type Order = IOrder;
