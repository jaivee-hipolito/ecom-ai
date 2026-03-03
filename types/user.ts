export type UserRole = 'admin' | 'customer';

export interface IUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Keep for backward compatibility
  contactNumber?: string;
  email: string;
  password?: string; // Optional for OAuth users
  role: UserRole;
  image?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  emailVerificationCode?: string;
  phoneVerificationCode?: string;
  emailVerificationCodeExpires?: Date;
  phoneVerificationCodeExpires?: Date;
  emailVerificationCodeSentAt?: Date;
  phoneVerificationCodeSentAt?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  /** Failed login attempts; account locks when this reaches lockout threshold (e.g. 3). */
  failedLoginAttempts?: number;
  /** When true, login is denied until an admin unlocks the account. */
  isLocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type User = Omit<IUser, 'password'>;
