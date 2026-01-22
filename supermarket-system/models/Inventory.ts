import { ObjectId } from 'mongodb';

export interface IInventory {
  _id?: ObjectId;
  productId: ObjectId;
  branchId: ObjectId;
  quantity: number;
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export class InventoryModel {
  static collectionName = 'inventory';

  static validate(inventory: Partial<IInventory>): { valid: boolean; error?: string } {
    if (!inventory.productId) {
      return { valid: false, error: 'Product ID is required' };
    }

    if (!inventory.branchId) {
      return { valid: false, error: 'Branch ID is required' };
    }

    if (inventory.quantity !== undefined && inventory.quantity < 0) {
      return { valid: false, error: 'Quantity cannot be negative' };
    }

    return { valid: true };
  }

  static sanitize(inventory: Partial<IInventory>): Partial<IInventory> {
    return {
      ...inventory,
      quantity: inventory.quantity !== undefined ? Number(inventory.quantity) : 0,
    };
  }

  static isLowStock(quantity: number): boolean {
    return quantity < 20;
  }

  static isMediumStock(quantity: number): boolean {
    return quantity >= 20 && quantity < 50;
  }

  static isGoodStock(quantity: number): boolean {
    return quantity >= 50;
  }

  static getStockStatus(quantity: number): 'low' | 'medium' | 'good' {
    if (this.isLowStock(quantity)) return 'low';
    if (this.isMediumStock(quantity)) return 'medium';
    return 'good';
  }
}