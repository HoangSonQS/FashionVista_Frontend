export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  status: string;
  featured: boolean;
  category?: string | null;
  thumbnailUrl?: string | null;
  sizes?: string[] | null;
  colors?: string[] | null;
}

export interface ProductVariant {
  id: number;
  size?: string | null;
  color?: string | null;
  sku: string;
  price: number;
  stock: number;
  active: boolean;
}

export interface ProductImage {
  id: number;
  url: string;
  alt?: string | null;
  primary: boolean;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  compareAtPrice?: number;
  status: string;
  featured: boolean;
  category?: string | null;
  tags?: string[];
  sizes?: string[];
  colors?: string[];
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductListResponse {
  items: ProductListItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
}

export interface SearchSuggestion {
  slug: string;
  name: string;
  thumbnailUrl?: string | null;
}

export interface ProductVariantRequest {
  size?: string;
  color?: string;
  sku: string;
  price?: number;
  stock: number;
  active?: boolean;
  id?: number;
}

export interface ProductCreateRequest {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  status?: string;
  featured?: boolean;
  categorySlug?: string;
  tags?: string[];
  sizes?: string[];
  colors?: string[];
  variants?: ProductVariantRequest[];
  removedImageIds?: number[];
}

