import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/types/user';

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters'],
    },
    name: {
      type: String,
      required: false, // Keep for backward compatibility only
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
      select: false, // Don't return in queries by default
    },
    contactNumber: {
      type: String,
      required: [true, 'Please provide a contact number'],
      trim: true,
      match: [
        /^[\d\s\-\+\(\)]+$/,
        'Please provide a valid contact number',
      ],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Register User model - reuse existing if available, otherwise create new
// This prevents "Schema hasn't been registered" errors when populating
let User: Model<IUser>;
if (mongoose.models.User) {
  // Model already exists, use it
  User = mongoose.models.User as Model<IUser>;
} else {
  // Create new model
  User = mongoose.model<IUser>('User', UserSchema);
}

export default User;
