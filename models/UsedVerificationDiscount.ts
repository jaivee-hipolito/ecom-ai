import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUsedVerificationDiscount extends Document {
  user: mongoose.Types.ObjectId;
  verificationType: 'phone' | 'email' | 'both';
  discount: number;
  orderId?: mongoose.Types.ObjectId;
  usedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UsedVerificationDiscountSchema = new Schema<IUsedVerificationDiscount>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verificationType: {
      type: String,
      enum: ['phone', 'email', 'both'],
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One verification discount per user, ever
UsedVerificationDiscountSchema.index({ user: 1 }, { unique: true });

const UsedVerificationDiscount: Model<IUsedVerificationDiscount> =
  mongoose.models.UsedVerificationDiscount ||
  mongoose.model<IUsedVerificationDiscount>(
    'UsedVerificationDiscount',
    UsedVerificationDiscountSchema
  );

export default UsedVerificationDiscount;
