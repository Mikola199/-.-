import { Listing, UserProfile } from './types';

export const listings: Listing[] = [
  {
    id: '1',
    title: 'Tesla Model 3 Long Range 2023',
    description: 'Отличное состояние, автопилот, один владелец, обслуживание у дилера.',
    price: 4290000,
    city: 'Москва',
    category: 'Авто',
    seller: 'Артем',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-12',
    aiScore: 96
  },
  {
    id: '2',
    title: '2-к квартира рядом с метро',
    description: 'Евроремонт, мебель, техника, быстрый выход на сделку.',
    price: 12300000,
    city: 'Санкт-Петербург',
    category: 'Недвижимость',
    seller: 'Ольга',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-10',
    aiScore: 91
  },
  {
    id: '3',
    title: 'MacBook Pro M3 Pro 16”',
    description: 'Новый, в коробке, гарантия 1 год. Идеален для работы и учебы.',
    price: 249990,
    city: 'Казань',
    category: 'Техника',
    seller: 'Илья',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-08',
    aiScore: 89
  }
];

export const demoProfile: UserProfile = {
  id: 'u1',
  name: 'Екатерина Смирнова',
  email: 'katya@mail.ru',
  city: 'Москва',
  listingsCount: 14,
  favoritesCount: 37,
  sellerRating: 4.9
};
