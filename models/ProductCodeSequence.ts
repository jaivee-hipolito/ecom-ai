import mongoose, { Schema, Model } from 'mongoose';

interface IProductCodeSequence {
  categoryPrefix: string;
  lastNumber: number;
}

const ProductCodeSequenceSchema = new Schema<IProductCodeSequence>(
  {
    categoryPrefix: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 10,
    },
    lastNumber: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

const ProductCodeSequence: Model<IProductCodeSequence> =
  mongoose.models?.ProductCodeSequence ||
  mongoose.model<IProductCodeSequence>('ProductCodeSequence', ProductCodeSequenceSchema);

export default ProductCodeSequence;
