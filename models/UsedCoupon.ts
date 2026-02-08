import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUsedCoupon extends Document {
  user: mongoose.Types.ObjectId;
  couponCode: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  orderId?: mongoose.Types.ObjectId;
  usedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UsedCouponSchema = new Schema<IUsedCoupon>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    couponCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
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

// Create compound index to prevent duplicate coupon usage per user
UsedCouponSchema.index({ user: 1, couponCode: 1 }, { unique: true });
UsedCouponSchema.index({ couponCode: 1 });
UsedCouponSchema.index({ user: 1 });

const UsedCoupon: Model<IUsedCoupon> =
  mongoose.models.UsedCoupon || mongoose.model<IUsedCoupon>('UsedCoupon', UsedCouponSchema);

export default UsedCoupon;
