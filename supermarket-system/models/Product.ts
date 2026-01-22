import { ObjectId } from 'mongodb';

export type BrandType = 'Coke' | 'Fanta' | 'Sprite';

export interface IProduct {
  _id?: ObjectId;
  name: string;
  brand: BrandType;
  price: number;
  image?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class ProductModel {
  static collectionName = 'products';
  static validBrands: BrandType[] = ['Coke', 'Fanta', 'Sprite'];

  static validate(product: Partial<IProduct>): { valid: boolean; error?: string } {
    if (!product.name || product.name.trim().length < 3) {
      return { valid: false, error: 'Product name must be at least 3 characters' };
    }

    if (!product.brand || !this.validBrands.includes(product.brand)) {
      return { 
        valid: false, 
        error: `Brand must be one of: ${this.validBrands.join(', ')}` 
      };
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
      price: product.price ? Number(product.price) : undefined,
      image: product.image?.trim() || '',
    };
  }
}