import { Listing, UserProfile } from './types';

export const listings: Listing[] = [
  {
    id: '1',
    type: 'vacancy',
    title: 'Senior Frontend Developer (React)',
    description: 'Ищем опытного React разработчика для работы над крупным финтех проектом. Удаленка, гибкий график.',
    price: 350000,
    city: 'Москва',
    category: 'IT',
    author: 'NeoBank',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-12',
    aiScore: 96
  },
  {
    id: '2',
    type: 'resume',
    title: 'Маркетолог с опытом в E-commerce',
    description: 'Более 5 лет опыта в продвижении интернет-магазинов. Увеличение ROI на 40% за последний год.',
    price: 150000,
    city: 'Санкт-Петербург',
    category: 'Маркетинг',
    author: 'Алексей Иванов',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-10',
    aiScore: 91
  },
  {
    id: '3',
    type: 'vacancy',
    title: 'Менеджер по продажам (B2B)',
    description: 'Активные продажи облачных решений. Высокий процент с продаж + оклад. Обучение за счет компании.',
    price: 120000,
    city: 'Екатеринбург',
    category: 'Продажи',
    author: 'CloudTech',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-08',
    aiScore: 89
  }
];

export const demoProfile: UserProfile = {
  id: 'u1',
  name: 'Екатерина Смирнова',
  email: 'katya.hr@neojob.ru',
  city: 'Москва',
  listingsCount: 14,
  favoritesCount: 37,
  rating: 4.9
};
