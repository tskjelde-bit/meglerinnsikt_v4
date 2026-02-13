
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
