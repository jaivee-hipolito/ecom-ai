export interface CategoryAttribute {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'multiselect' | 'boolean' | 'date';
  required?: boolean;
  options?: string[]; // For select and multiselect types
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ICategory {
  _id?: string;
  name: string;
  description: string;
  slug?: string;
  attributes?: CategoryAttribute[]; // Dynamic attributes for products in this category
  createdAt?: Date;
  updatedAt?: Date;
}

export type Category = ICategory;

