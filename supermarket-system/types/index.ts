import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  phone?: string;
  createdAt: Date;
}

export interface Branch {
  _id?: ObjectId;
  name: string;
  location: string;
  code: string;
  isHeadquarter: boolean;
}

export interface Product {
  _id?: ObjectId;
  name: string;
  brand: 'Coke' | 'Fanta' | 'Sprite';
  price: number;
  image?: string;
}

export interface Inventory {
  _id?: ObjectId;
  productId: ObjectId;
  branchId: ObjectId;
  quantity: number;
  lastRestocked?: Date;
}

export interface Order {
  _id?: ObjectId;
  userId: ObjectId;
  branchId: ObjectId;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  mpesaReceiptNumber?: string;
  mpesaTransactionId?: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: ObjectId;
  productName: string;
  brand: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  _id?: ObjectId;
  orderId: ObjectId;
  mpesaReceiptNumber: string;
  phoneNumber: string;
  amount: number;
  transactionDate: Date;
  status: 'success' | 'failed';
  checkoutRequestID?: string;
}

export interface SalesReport {
  branch: string;
  brandSales: {
    brand: string;
    quantity: number;
    revenue: number;
  }[];
  totalRevenue: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}