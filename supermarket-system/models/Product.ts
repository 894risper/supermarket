import { ObjectId } from 'mongodb';

export interface IProduct {
  _id?: ObjectId;
  name: string;
  brand: string;       
  category: string;   
  price: number;
  image?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class ProductModel {
  static collectionName = 'products';
 
  static commonBrands = [
    'Coca-Cola', 
    'PepsiCo', 
    'Red Bull', 
    'Monster', 
    'EABL', 
    'Crown Beverages'
  ];

  static validate(product: Partial<IProduct>): { valid: boolean; error?: string } {
    if (!product.name || product.name.trim().length < 3) {
      return { valid: false, error: 'Product name must be at least 3 characters' };
    }
 
    if (!product.brand || product.brand.trim().length < 2) {
      return { valid: false, error: 'Brand is required' };
    }

    if (!product.price || product.price <= 0) {
      return { valid: false, error: 'Price must be greater than 0' };
    }

    if (product.price && product.price > 100000) {
      return { valid: false, error: 'Price seems too high (max 100,000)' };
    }

    return { valid: true };
  }

  static sanitize(product: Partial<IProduct>): Partial<IProduct> {
    return {
      ...product,
      name: product.name?.trim(),
      brand: product.brand?.trim(),
      category: product.category?.trim() || 'General',
      price: product.price ? Number(product.price) : 0,
      image: product.image?.trim() || '',
    };
  }
}