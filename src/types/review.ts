export interface ReviewSummary {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment?: string;
}


