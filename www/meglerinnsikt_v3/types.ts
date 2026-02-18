
export interface DistrictInfo {
  id: string;
  name: string;
  priceChange: number;
  avgDaysOnMarket: number;
  pricePerSqm: number;
  medianPrice: number; // Nytt felt for medianpris
  description: string;
  lat: number;
  lng: number;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  address: string;
  city: string;
  lat: number;
  lng: number;
  image: string;
  type: 'House' | 'Apartment' | 'Condo' | 'Townhouse';
  description: string;
  tags: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  image: string;
}

// Content block types for the blog CMS
export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3 | 4 | 5; text: string }
  | { type: 'image'; url: string; caption?: string }
  | { type: 'quote'; text: string }
  | { type: 'bulletList'; title?: string; items: string[] }
  | { type: 'numberedList'; items: { title: string; description: string }[] }
  | { type: 'imageGrid'; images: { url: string; caption: string }[] };

// Extended blog post with full content for CMS
export interface BlogPostFull extends BlogPost {
  slug: string;
  dateISO: string;
  excerpt: string;
  author: {
    name: string;
    title: string;
    image: string;
  };
  readTime: string;
  tags: string[];
  published: boolean;
  content: ContentBlock[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface FilterState {
  search: string;
  minPrice: number;
  maxPrice: number;
  type: string;
  bedrooms: string;
}
