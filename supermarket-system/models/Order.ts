import { ObjectId } from 'mongodb';

export interface IOrderItem {
  productId: ObjectId;
  productName: string;
  brand: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IOrder {
  _id?: ObjectId;
  userId: ObjectId;
  branchId: ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  mpesaReceiptNumber?: string;
  mpesaTransactionId?: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderModel {
  static collectionName = 'orders';

  static validate(order: Partial<IOrder>): { valid: boolean; error?: string } {
    if (!order.userId) {
      return { valid: false, error: 'User ID is required' };
    }

    if (!order.branchId) {
      return { valid: false, error: 'Branch ID is required' };
    }

    if (!order.items || order.items.length === 0) {
      return { valid: false, error: 'Order must contain at least one item' };
    }

    if (!order.phoneNumber || !this.isValidPhoneNumber(order.phoneNumber)) {
      return { valid: false, error: 'Invalid phone number format (254XXXXXXXXX)' };
    }

    if (!order.totalAmount || order.totalAmount <= 0) {
      return { valid: false, error: 'Total amount must be greater than 0' };
    }

    return { valid: true };
  }

  static isValidPhoneNumber(phone: string): boolean {
    // Format: 254XXXXXXXXX (12 digits)
    const phoneRegex = /^254\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }

  static formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\s+/g, '');
    
    // Remove leading 0 if present
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    }
    
    // Add 254 if not present
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  static calculateTotal(items: IOrderItem[]): number {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  static sanitize(order: Partial<IOrder>): Partial<IOrder> {
    return {
      ...order,
      phoneNumber: order.phoneNumber ? this.formatPhoneNumber(order.phoneNumber) : '',
      totalAmount: order.totalAmount ? Number(order.totalAmount) : 0,
    };
  }
}