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

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'escrow_hold' | 'escrow_release' | 'escrow_refund';
  amount: number;
  description: string;
  time: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  city: string;
  listingsCount: number;
  favoritesCount: number;
  sellerRating: number;
  walletBalance: number;
  walletTransactions: WalletTransaction[];
}

export interface SocialPost {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  image?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  image: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'other' | 'ai';
  senderName: string;
  text: string;
  time: string;
}

export interface EscrowDeal {
  id: string;
  title: string;
  price: number;
  status: 'создана' | 'оплачена' | 'отправлена' | 'завершена' | 'спор';
  buyer: string;
  seller: string;
  step: number; // 1 to 4
}

export interface Job {
  id: string;
  type: 'vacancy' | 'resume';
  title: string;
  description: string;
  company?: string;
  author: string;
  salary: number;
  city: string;
  sector: 'IT' | 'Sales' | 'Marketing' | 'HR' | 'Design' | 'Другое';
  requirements?: string;
  createdAt: string;
}
