export type UserRole = 'admin' | 'customer';

export interface IUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Keep for backward compatibility
  contactNumber?: string;
  email: string;
  password: string;
  role: UserRole;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type User = Omit<IUser, 'password'>;
