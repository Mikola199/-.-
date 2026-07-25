import { Listing, UserProfile, SocialPost, Community, ChatMessage, EscrowDeal } from './types';

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
  },
  {
    id: '4',
    title: 'Sony PlayStation 5 Slim',
    description: 'Игровая консоль 1TB, 2 геймпада в комплекте, идеальное состояние.',
    price: 48000,
    city: 'Екатеринбург',
    category: 'Техника',
    seller: 'Максим',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-05',
    aiScore: 92
  },
  {
    id: '5',
    title: 'Услуги репетитора по Python & AI',
    description: 'Обучение с нуля, создание нейросетей, веб-разработка на Django/FastAPI.',
    price: 2500,
    city: 'Новосибирск',
    category: 'Услуги',
    seller: 'Алексей',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-01',
    aiScore: 95
  }
];

export const demoProfile: UserProfile = {
  id: 'u1',
  name: 'Екатерина Смирнова',
  email: 'katya@neosphere.io',
  city: 'Москва',
  listingsCount: 14,
  favoritesCount: 37,
  sellerRating: 4.9
};

export const socialPosts: SocialPost[] = [
  {
    id: 'p1',
    author: 'Александр Новиков',
    avatar: '👨‍💻',
    time: '2 часа назад',
    content: 'Запустили децентрализованный хакатон по WebRTC и AI-помощникам в нашем комьюнити! Ожидаем более 100 участников. Присоединяйтесь, кто в теме!',
    likes: 42,
    comments: 11,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p2',
    author: 'Мария Кравцова',
    avatar: '👩‍🎨',
    time: '4 часа назад',
    content: 'Выставила свою первую картину на маркетплейс NeoSphere с использованием безопасной сделки Escrow. Очень удобно: оплата холдируется банком-партнером до подтверждения доставки! 🎨🔒',
    likes: 89,
    comments: 24
  },
  {
    id: 'p3',
    author: 'ИИ-Ассистент',
    avatar: '🤖',
    time: 'Вчера',
    content: 'Привет! Я проанализировал тренды категорий за неделю: Спрос на электромобили вырос на 14%, а услуги AI-репетиторов увеличились вдвое. Пора разместить свои предложения в маркетплейсе!',
    likes: 156,
    comments: 38
  }
];

export const communities: Community[] = [
  {
    id: 'c1',
    name: 'Электромобили РФ',
    description: 'Сообщество владельцев электрокаров. Обсуждаем зарядки, ТО и автопилоты.',
    members: 14205,
    image: '⚡'
  },
  {
    id: 'c2',
    name: 'AI & Web3 Developers',
    description: 'Разработка будущего: генеративный AI, LLM, WebRTC и смарт-контракты.',
    members: 8930,
    image: '🧠'
  },
  {
    id: 'c3',
    name: 'Крафтовый Дизайн',
    description: 'Авторы, дизайнеры, художники. Маркетплейс уникальных вещей.',
    members: 5120,
    image: '🎨'
  }
];

export const chatMessages: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'other',
    senderName: 'Илья (Продавец MacBook)',
    text: 'Привет! Да, MacBook Pro в идеальном состоянии, без сколов и царапин.',
    time: '14:20'
  },
  {
    id: 'm2',
    sender: 'user',
    senderName: 'Екатерина',
    text: 'Отлично! Можем оформить покупку через Безопасную Сделку прямо здесь?',
    time: '14:22'
  },
  {
    id: 'm3',
    sender: 'other',
    senderName: 'Илья (Продавец MacBook)',
    text: 'Да, конечно. Я уже активировал Escrow-транзакцию, можете оплачивать. Смарт-контракт заморозит средства до получения.',
    time: '14:25'
  }
];

export const escrowDeals: EscrowDeal[] = [
  {
    id: 'e1',
    title: 'MacBook Pro M3 Pro 16”',
    price: 249990,
    status: 'оплачена',
    buyer: 'Екатерина Смирнова',
    seller: 'Илья',
    step: 2 // 1: Создана, 2: Оплачена (в Escrow), 3: Отправлена, 4: Завершена
  }
];
