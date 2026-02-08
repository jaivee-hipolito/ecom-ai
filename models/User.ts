import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/types/user';

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: false, // Make optional for OAuth users
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters'],
      default: '', // Allow empty first name for OAuth users
    },
    lastName: {
      type: String,
      required: false, // Make optional for OAuth users
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters'],
      default: '', // Allow empty last name for OAuth users
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
      required: false, // Make optional for OAuth users
      trim: true,
      match: [
        /^[\d\s\-\+\(\)]*$/, // Allow empty string for OAuth users
        'Please provide a valid contact number',
      ],
      default: '', // Allow empty contact number for OAuth users
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
      required: false, // Make optional for OAuth users
      validate: {
        validator: function(this: IUser, value?: string) {
          // If password is provided, it must be at least 6 characters
          // OAuth users can have empty password
          return !value || value.length >= 6;
        },
        message: 'Password must be at least 6 characters',
      },
      select: false, // Don't return password by default
    } as any,
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
    image: {
      type: String,
      default: '',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      select: false,
    },
    phoneVerificationCode: {
      type: String,
      select: false,
    },
    emailVerificationCodeExpires: {
      type: Date,
      select: false,
    },
    phoneVerificationCodeExpires: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordTokenExpires: {
      type: Date,
      select: false,
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
