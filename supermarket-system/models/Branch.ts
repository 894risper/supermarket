import { ObjectId } from 'mongodb';

export interface IBranch {
  _id?: ObjectId;
  name: string;
  location: string;
  code: string;
  isHeadquarter: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export class BranchModel {
  static collectionName = 'branches';

  static validate(branch: Partial<IBranch>): { valid: boolean; error?: string } {
    if (!branch.name || branch.name.trim().length < 3) {
      return { valid: false, error: 'Branch name must be at least 3 characters' };
    }

    if (!branch.location || branch.location.trim().length < 2) {
      return { valid: false, error: 'Location must be at least 2 characters' };
    }

    if (!branch.code || !this.isValidCode(branch.code)) {
      return { valid: false, error: 'Code must be 3-10 uppercase letters, numbers, or hyphens' };
    }

    return { valid: true };
  }

  static isValidCode(code: string): boolean {
    const codeRegex = /^[A-Z0-9-]{3,10}$/;
    return codeRegex.test(code);
  }

  static sanitize(branch: Partial<IBranch>): Partial<IBranch> {
    return {
      ...branch,
      name: branch.name?.trim(),
      location: branch.location?.trim(),
      code: branch.code?.toUpperCase().trim(),
      isHeadquarter: branch.isHeadquarter || false,
    };
  }
}