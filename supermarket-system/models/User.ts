import { ObjectId } from 'mongodb';

export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  phone?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class UserModel {
  static collectionName = 'users';

  static validate(user: Partial<IUser>): { valid: boolean; error?: string } {
    if (!user.name || user.name.trim().length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' };
    }

    if (!user.email || !this.isValidEmail(user.email)) {
      return { valid: false, error: 'Invalid email address' };
    }

    if (!user.password || user.password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters' };
    }

    if (user.role && !['customer', 'admin'].includes(user.role)) {
      return { valid: false, error: 'Role must be customer or admin' };
    }

    return { valid: true };
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static sanitize(user: Partial<IUser>): Partial<IUser> {
    return {
      ...user,
      name: user.name?.trim(),
      email: user.email?.toLowerCase().trim(),
      phone: user.phone?.trim(),
    };
  }
}