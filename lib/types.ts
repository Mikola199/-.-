export type Category = 'IT' | 'Маркетинг' | 'Продажи' | 'Медицина' | 'Строительство';

export type ListingType = 'Вакансия' | 'Резюме';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number; // Salary or expected salary
  city: string;
  category: Category;
  type: ListingType;
  company?: string;
  experience: string;
  seller: string; // Recruiter or Job Seeker name
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
