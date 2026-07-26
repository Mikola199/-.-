import { Listing, UserProfile, SocialPost, Community, ChatMessage, EscrowDeal, Job } from './types';

export const listings: Listing[] = [
  {
    id: 'l1',
    title: 'MacBook Pro M3 Max 16” (16/512GB)',
    description: 'Новый, запечатанный. Идеально подходит для NestJS & Go бэкенд разработки и AI инференса.',
    price: 320000,
    city: 'Москва',
    category: 'Техника',
    seller: 'Илья',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-14',
    aiScore: 98
  },
  {
    id: 'l2',
    title: 'Tesla Model Y Performance 2024',
    description: 'Абсолютно новый электромобиль. Доставка в любой регион РФ, растаможен. Полный автопилот.',
    price: 5200000,
    city: 'Москва',
    category: 'Авто',
    seller: 'Артем',
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-12',
    aiScore: 94
  },
  {
    id: 'l3',
    title: 'Аренда офиса в EQUHUB Tower',
    description: 'Современный коворкинг-офис класса A+ с панорамным остеклением и высокоскоростным интернетом.',
    price: 150000,
    city: 'Санкт-Петербург',
    category: 'Недвижимость',
    seller: 'EQUHUB Estate',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-10',
    aiScore: 97
  },
  {
    id: 'l4',
    title: 'Разработка Flutter мобильных приложений',
    description: 'Кроссплатформенная разработка для iOS & Android с интеграцией WebRTC видеовызовов и AI помощников.',
    price: 120000,
    city: 'Казань',
    category: 'Услуги',
    seller: 'Никита',
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-08',
    aiScore: 96
  },
  {
    id: 'l5',
    title: 'Профессиональный студийный микрофон',
    description: 'Идеальный звук для записи аудиозвонков, голосовых сообщений и подкастов в EQUHUB Messenger.',
    price: 35000,
    city: 'Екатеринбург',
    category: 'Хобби',
    seller: 'Максим',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-02-05',
    aiScore: 91
  }
];

export const demoProfile: UserProfile = {
  id: 'u1',
  name: 'Екатерина Смирнова',
  email: 'katya@equhub.ru',
  city: 'Москва',
  listingsCount: 4,
  favoritesCount: 18,
  sellerRating: 4.95,
  walletBalance: 450000,
  walletTransactions: [
    {
      id: 'tx1',
      type: 'deposit',
      amount: 500000,
      description: 'Пополнение баланса кошелька EQUHUB через СБП',
      time: '12.02.2026 10:15'
    },
    {
      id: 'tx2',
      type: 'escrow_hold',
      amount: 320000,
      description: 'Замораживание средств по сделке #e1 (MacBook Pro)',
      time: '14.02.2026 14:22'
    },
    {
      id: 'tx3',
      type: 'deposit',
      amount: 270000,
      description: 'Выплата за выполненные услуги разработки по договору',
      time: '15.02.2026 18:40'
    }
  ]
};

export const socialPosts: SocialPost[] = [
  {
    id: 'p1',
    author: 'Александр Новиков (Product Lead)',
    avatar: '👨‍💻',
    time: '2 часа назад',
    content: 'Приветствуем всех пользователей на Единой Цифровой Платформе EQUHUB! 🌌 Наш MVP объединяет социальную сеть, мессенджер с поддержкой WebRTC-видеовызовов, маркетплейс товаров и услуг, защищенный Wallet с безопасной сделкой Escrow и интеллектуального AI-ассистента. Впереди много обновлений!',
    likes: 254,
    comments: 48,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p2',
    author: 'Мария Кравцова (HR-директор)',
    avatar: '👩‍🎨',
    time: '4 часа назад',
    content: 'Опубликовала свежие вакансии от EQUHUB Tech в нашем новом встроенном разделе "Работа"! Ищем сильных инженеров на NestJS, Go и Flutter. Вы также можете разместить свое резюме за пару кликов. Отклики обрабатываются мгновенно через наш Chat Service! 💼🚀',
    likes: 112,
    comments: 18
  },
  {
    id: 'p3',
    author: 'AI-Ассистент EQUHUB',
    avatar: '🤖',
    time: 'Вчера',
    content: 'Интеллектуальный отчет: активность на платформе EQUHUB выросла на 40% за прошедшую неделю! Популярность безопасных сделок увеличилась на треть, а средняя заработная плата по вакансиям в IT-секторе превысила 280,000 ₽. Используйте AI-генератор описания для быстрого старта!',
    likes: 340,
    comments: 56
  }
];

export const communities: Community[] = [
  {
    id: 'c1',
    name: 'Разработчики NestJS & Go',
    description: 'Официальное техническое сообщество платформы EQUHUB. Делимся лучшими практиками создания микросервисов.',
    members: 15400,
    image: '💻'
  },
  {
    id: 'c2',
    name: 'EQUHUB Бизнес-Клуб',
    description: 'Объединение предпринимателей, инвесторов и продавцов. Обсуждаем безопасные сделки, кошелек и налоги.',
    members: 8900,
    image: '💼'
  },
  {
    id: 'c3',
    name: 'Креативный Маркетплейс',
    description: 'Сообщество авторов уникальных товаров ручной работы, дизайнеров и художников.',
    members: 6200,
    image: '🎨'
  }
];

export const chatMessages: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'other',
    senderName: 'Илья (Продавец MacBook)',
    text: 'Здравствуйте, Екатерина! Да, ноутбук абсолютно новый. Готов продать через безопасную сделку EQUHUB.',
    time: '14:20'
  },
  {
    id: 'm2',
    sender: 'user',
    senderName: 'Екатерина',
    text: 'Отлично! Я уже перевела средства на транзитный счет Escrow.',
    time: '14:22'
  },
  {
    id: 'm3',
    sender: 'other',
    senderName: 'Илья (Продавец MacBook)',
    text: 'Супер, вижу подтверждение от Payment Service. Готовлю товар к отправке курьером.',
    time: '14:25'
  }
];

export const escrowDeals: EscrowDeal[] = [
  {
    id: 'e1',
    title: 'MacBook Pro M3 Max 16”',
    price: 320000,
    status: 'оплачена',
    buyer: 'Екатерина Смирнова',
    seller: 'Илья',
    step: 2 // 1: Создана, 2: Оплачена, 3: Отправлена, 4: Завершена
  }
];

export const jobs: Job[] = [
  {
    id: 'j1',
    type: 'vacancy',
    title: 'Senior NestJS Backend Developer',
    description: 'Ищем опытного бэкенд-инженера для масштабирования высоконагруженных микросервисов EQUHUB (Social Service, Vacancy Service, Payment Service). Стек: NestJS, TypeScript, PostgreSQL, Redis, RabbitMQ, Docker.',
    company: 'EQUHUB Tech',
    author: 'Мария Кравцова (HR)',
    salary: 350000,
    city: 'Москва',
    sector: 'IT',
    requirements: 'Опыт разработки на NestJS/Node.js от 5 лет. Отличное понимание микросервисной архитектуры, оптимизации SQL-запросов и брокеров сообщений (RabbitMQ).',
    createdAt: '2026-02-14'
  },
  {
    id: 'j2',
    type: 'vacancy',
    title: 'Flutter Mobile Developer (Senior)',
    description: 'Разработка и поддержка официального супер-приложения EQUHUB на Flutter. Оптимизация UI-производительности, интеграция WebRTC звонков, мессенджера, внутреннего кошелька и карт.',
    company: 'EQUHUB Mobile Team',
    author: 'Александр Новиков (Product)',
    salary: 280000,
    city: 'Санкт-Петербург',
    sector: 'IT',
    requirements: 'Опыт коммерческой Flutter-разработки от 3 лет. Глубокое знание Dart, BloC/Riverpod state managers, опыт работы с WebRTC, WebSocket и пуш-уведомлениями.',
    createdAt: '2026-02-13'
  },
  {
    id: 'j3',
    type: 'resume',
    title: 'Middle React / TypeScript Frontend Engineer',
    description: 'Frontend-разработчик с фокусом на создание стильных, отзывчивых интерфейсов с использованием Next.js 14, Tailwind CSS, TypeScript. Интересуюсь разработкой личных кабинетов, дашбордов и интерактивных SVG-схем.',
    author: 'Екатерина Смирнова',
    salary: 180000,
    city: 'Москва',
    sector: 'IT',
    requirements: 'Опыт работы с React/Next.js от 2 лет. Уверенные знания TypeScript, CSS Variables, адаптивного адаптива, интеграции с REST/WebSocket API.',
    createdAt: '2026-02-12'
  },
  {
    id: 'j4',
    type: 'resume',
    title: 'HR-директор / IT Recruiter',
    description: 'Подбор IT-специалистов уровня Middle/Senior/Lead. Выстраивание HR-процессов с нуля, онбординг, проведение технических интервью и развитие бренда работодателя.',
    author: 'Мария Кравцова',
    salary: 200000,
    city: 'Казань',
    sector: 'HR',
    requirements: 'Опыт в IT-рекрутменте от 4 лет. Собственная база разработчиков, знание рынка труда РФ, опыт работы с платформами вакансий.',
    createdAt: '2026-02-11'
  }
];
