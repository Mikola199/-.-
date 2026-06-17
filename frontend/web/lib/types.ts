export type Category = 'Авто' | 'Недвижимость' | 'Техника' | 'Услуги' | 'Хобби';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  category: Category;
  seller: string;
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
  sellerRating: number;
}
