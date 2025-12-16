export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  thumbnailUrl?: string | null;
  price: number;
  compareAtPrice?: number | null;
}


