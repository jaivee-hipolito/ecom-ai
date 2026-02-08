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
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type User = Omit<IUser, 'password'>;
