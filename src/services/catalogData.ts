export interface ProductSpecification {
  label: string;
  val: string;
}

export interface ProductVariantOption {
  id: string;
  name: string;
  priceDiff?: number;
  inStock?: boolean;
}

export interface ProductVariant {
  id: string;
  type: 'color' | 'size' | 'storage' | 'weight' | 'portion' | 'duration' | 'tier';
  label: string;
  options: ProductVariantOption[];
}

export interface SellerInfo {
  name: string;
  rating?: string;
  verified?: boolean;
  location?: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  subcategory?: string;
  image: string;
  gallery?: string[];
  description: string;
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  price: number; // Selling price in INR
  mrp?: number; // Listed MRP in INR
  rating?: number;
  ratingCount?: string;
  assured?: boolean;
  availability?: string;
  deliveryInfo?: string;
  seller?: SellerInfo;
  warranty?: string;
  highlights?: string[];
}

export function calculateDiscount(mrp?: number, price?: number): number {
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
