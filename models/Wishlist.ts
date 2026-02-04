import mongoose, { Schema, Model } from 'mongoose';
import { IWishlist } from '@/types/wishlist';

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    } as any,
    products: {
      type: [Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create unique index on user (combines unique constraint with index)
WishlistSchema.index({ user: 1 }, { unique: true });

// Prevent re-compilation during development
const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist ||
  mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export default Wishlist;
