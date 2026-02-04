import mongoose, { Schema, Model } from 'mongoose';
import { ICategory } from '@/types/category';

const CategoryAttributeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'number', 'textarea', 'select', 'boolean', 'date'],
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: {
    type: [String],
    default: [],
  },
  placeholder: String,
  validation: {
    min: Number,
    max: Number,
    pattern: String,
  },
}, { _id: false });

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      maxlength: [100, 'Category name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a category description'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    attributes: {
      type: [CategoryAttributeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Generate slug from name before saving
CategorySchema.pre('save', async function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = generateSlug(this.name);
  }
});

// Create indexes (unique indexes)
CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ slug: 1 }, { unique: true });

// Prevent re-compilation during development
const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
