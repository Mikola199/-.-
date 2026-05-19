export type Category = 'IT' | 'Продажи' | 'Маркетинг' | 'Медицина' | 'Дизайн' | 'Строительство';

export interface Listing {
  id: string;
  type: 'vacancy' | 'resume';
  title: string;
  description: string;
  price: number; // For salary
  city: string;
  category: Category;
  author: string; // Changed from seller
  rating: number;
  image: string;
  createdAt: string;
  aiScore: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  city: string;
  listingsCount: number;
  favoritesCount: number;
  rating: number; // Changed from sellerRating
}
