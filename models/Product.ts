import mongoose, { Schema, Model } from 'mongoose';
import { IProduct } from '@/types/product';

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [200, 'Product name cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
      trim: true,
    },
    productCode: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length > 0;
        },
        message: 'Please provide at least one product image',
      },
    },
    coverImage: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isFlashSale: {
      type: Boolean,
      default: false,
    },
    flashSaleDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    flashSaleDiscountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastViewed: {
      type: Date,
      default: null,
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ views: -1 }); // Index for most viewed queries
ProductSchema.index({ createdAt: -1 });

// Prevent re-compilation during development
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
