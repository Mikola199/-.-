import { Listing, UserProfile } from './types';

export const listings: Listing[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer (React)',
    description: 'Ищем опытного React разработчика для работы над финтех проектом. Требуется опыт с Next.js и TypeScript.',
    price: 350000,
    city: 'Москва',
    category: 'IT',
    type: 'Вакансия',
    company: 'NeoTech Solutions',
    experience: '3-6 лет',
    seller: 'Александр (HR)',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-12',
    aiScore: 96
  },
  {
    id: '2',
    title: 'Менеджер по продажам (B2B)',
    description: 'Активный поиск клиентов, проведение переговоров, заключение договоров. Высокий процент с продаж.',
    price: 120000,
    city: 'Санкт-Петербург',
    category: 'Продажи',
    type: 'Вакансия',
    company: 'Global Trade',
    experience: '1-3 года',
    seller: 'Елена',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-10',
    aiScore: 91
  },
  {
    id: '3',
    title: 'Middle Python Developer',
    description: 'Разработка backend части высоконагруженных систем. Опыт с FastAPI и PostgreSQL обязателен.',
    price: 250000,
    city: 'Удаленно',
    category: 'IT',
    type: 'Резюме',
    experience: '4 года',
    seller: 'Иван Петров',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-08',
    aiScore: 89
  },
  {
    id: '4',
    title: 'Врач-терапевт',
    description: 'Прием пациентов, назначение лечения, ведение медицинской документации.',
    price: 90000,
    city: 'Казань',
    category: 'Медицина',
    type: 'Вакансия',
    company: 'Медицентр',
    experience: 'от 5 лет',
    seller: 'Мария Владимировна',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-14',
    aiScore: 98
  }
];

export const demoProfile: UserProfile = {
  id: 'u1',
  name: 'Екатерина Смирнова',
  email: 'katya.hr@neojob.ru',
  city: 'Москва',
  listingsCount: 5,
  favoritesCount: 12,
  sellerRating: 4.9
};
