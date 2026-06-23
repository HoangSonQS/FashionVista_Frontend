export interface CollectionSummary {
  id: number;
  name: string;
  slug: string;
  description?: string;
  heroImageUrl?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'ARCHIVED';
  visible: boolean;
  startAt?: string | null;
  endAt?: string | null;
}

export interface CollectionDetail extends CollectionSummary {
  seoTitle?: string;
  seoDescription?: string;
  longDescriptionHtml?: string | null;
  products: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: number;
    compareAtPrice?: number | null;
    status: string;
    featured: boolean;
    thumbnailUrl?: string | null;
    category?: string | null;
  }[];
}


