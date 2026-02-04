import { CategoryAttribute } from './category';

export interface IProductVariant {
  _id: string;
  attributes: Record<string, any>;
  stock: number;
  price: number;
  images: string[];
  coverImage?: string;
}

export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  coverImage?: string; // URL of the cover image (must be one of the images)
  stock: number;
  rating?: number;
  numReviews?: number;
  featured?: boolean;
  views?: number;
  lastViewed?: Date;
  attributes?: Record<string, any>; // Dynamic attributes based on category
  categoryId?: string; // Category ObjectId (for API responses)
  categoryAttributes?: CategoryAttribute[]; // Category attribute definitions (for API responses)
  variants?: IProductVariant[]; // Variants of the same product (same name, different attributes)
  createdAt?: Date;
  updatedAt?: Date;
}

export type Product = IProduct;

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}
