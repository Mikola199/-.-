'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  listings as initialListings,
  demoProfile as initialProfile,
  socialPosts,
  communities,
  chatMessages as initialChatMessages,
  escrowDeals as initialEscrowDeals,
  jobs as initialJobs
} from '@/lib/mockData';
import {
  aiSuggestCategory,
  aiGenerateDescription,
  aiModerateListing
} from '@/lib/ai';
import { Category, Listing, ChatMessage, EscrowDeal, Job, WalletTransaction, UserProfile } from '@/lib/types';

// Microservices info for the architectural diagram matching the SRS
interface ServiceNode {
  id: string;
  title: string;
  sub: string;
  tech: string;
  description: string;
  ports: string;
  logs: string[];
}

const serviceNodes: ServiceNode[] = [
  {
    id: 'client',
    title: 'Mobile Apps',
    sub: 'Android/iOS (Flutter)',
    tech: 'Dart, WebSockets, WebRTC',
    ports: 'Client Side',
    description: 'Клиентские приложения с нативной производительностью на Flutter. Обеспечивают мгновенный обмен сообщениями и p2p-связь.',
    logs: [
      'Инициализация Flutter UI...',
      'Успешное подключение к API Gateway EQUHUB по HTTPS.',
      'Токен JWT успешно считан из Secure Storage. Сессия активна.'
    ]
  },
  {
    id: 'gateway',
    title: 'API Gateway',
    sub: 'Маршрутизация & Лимиты',
    tech: 'Nginx / Kong / REST / WS',
    ports: '80 / 443',
    description: 'Единая точка входа. SSL-терминация, балансировка нагрузки, rate limiting, проверка токенов JWT HS256 с перенаправлением запросов.',
    logs: [
      'Gateway GET /api/v1/jobs -> Redirect to Vacancy Service [200 OK]',
      'Gateway POST /api/v1/payments/escrow -> Redirect to Payment Service [201 Created]',
      'Gateway Rate-Limiter: IP 192.168.0.45 - Запросов: 8/сек (Лимит: 100/сек)'
    ]
  },
  {
    id: 'auth',
    title: 'Auth Service',
    sub: 'Сессии и JWT',
    tech: 'Python / FastAPI',
    ports: '8001',
    description: 'Управление пользователями, хэширование паролей, двухфакторная аутентификация, выпуск и верификация токенов JWT HS256.',
    logs: [
      'Auth Service: Проверка подписи JWT токена для katya@equhub.ru',
      'Auth Service: Успешная генерация Access Token (срок действия: 15 минут)',
      'Auth Service: Зарегистрирован успешный вход со смартфона Apple iPhone 15 Pro.'
    ]
  },
  {
    id: 'user',
    title: 'User Service',
    sub: 'Профили и Связи',
    tech: 'NestJS / TypeScript',
    ports: '8002',
    description: 'Управление профилями, контактами, списком друзей, рейтингами, достижениями и настройками приватности.',
    logs: [
      'User Service: Запрос профиля пользователя u1 (Екатерина Смирнова)',
      'User Service: Обновление био и интересов пользователя в СУБД',
      'User Service: Синхронизация рейтинга 4.95 в кэш Redis.'
    ]
  },
  {
    id: 'feed',
    title: 'Feed Service',
    sub: 'Ленты и Сообщества',
    tech: 'NestJS / TypeScript',
    ports: '8003',
    description: 'Создание новостной ленты публикаций, обработка лайков, комментариев, репостов, хэштегов и структуры сообществ EQUHUB.',
    logs: [
      'Feed Service: Сборка персональной ленты по хэштегам #IT #Flutter',
      'Feed Service: Добавлен лайк к публикации p2 от пользователя u1',
      'Feed Service: Получен список активных сообществ (3 записи).'
    ]
  },
  {
    id: 'chat',
    title: 'Chat Service',
    sub: 'Реалтайм Мессенджер',
    tech: 'Go / WebSockets & C++',
    ports: '8004 / WebRTC',
    description: 'Отказоустойчивый чат на Go. C++ ядро обрабатывает сигнальный трафик WebRTC для аудио- и видеозвонков с задержкой <50мс.',
    logs: [
      'Chat Service: WebSocket соединение установлено для пользователя u1',
      'Chat Service: Доставлено сообщение m3 для Илья (Продавец MacBook)',
      'Chat Service [C++ Engine]: Сигнальный пакет WebRTC обработан за 0.3мс.'
    ]
  },
  {
    id: 'market',
    title: 'Marketplace Service',
    sub: 'Объявления & Полнотекст',
    tech: 'NestJS / TypeScript',
    ports: '8005',
    description: 'Управление объявлениями маркетплейса (товары, услуги, авто, недвижимость, аренда), фильтрами и отзывами.',
    logs: [
      'Marketplace: Поиск объявлений по фильтру "Техника" в г. Москва',
      'Marketplace: Объявление l1 проиндексировано в Search Service',
      'Marketplace: Добавление товара l1 в избранное пользователем u1.'
    ]
  },
  {
    id: 'vacancy',
    title: 'Vacancy Service',
    sub: 'Раздел "Работа"',
    tech: 'NestJS / TypeScript',
    ports: '8006',
    description: 'Оркестратор раздела вакансий и резюме. Обрабатывает отклики, приглашения соискателей и строит аналитику рынка труда.',
    logs: [
      'Vacancy Service: GET /jobs -> Выборка активных вакансий по фильтру "IT"',
      'Vacancy Service: Зарегистрирован отклик Екатерины Смирновой на вакансию j1',
      'Vacancy Service: Отправка email HR-менеджеру через Notification Service.'
    ]
  },
  {
    id: 'ai',
    title: 'AI Service',
    sub: 'Нейросети & Анализ',
    tech: 'Python / FastAPI / PyTorch',
    ports: '8007',
    description: 'Интеллектуальный помощник: генерация описаний товаров, автоопределение категории, умная модерация текста.',
    logs: [
      'AI Service: Анализ ключевых слов для автоопределения категории...',
      'AI Service: Генерация рекламного описания на основе параметров',
      'AI Service: Проверка текста на модерационные нарушения (скам, обман).'
    ]
  },
  {
    id: 'payments',
    title: 'Payment Service',
    sub: 'Кошелек & Escrow',
    tech: 'NestJS / TypeScript',
    ports: '8008',
    description: 'Управление балансом кошелька, переводами и проведением безопасных сделок. Блокирует средства на счетах Escrow.',
    logs: [
      'Payment Service: Средства 320,000 ₽ успешно холдированы на счете сделки e1',
      'Payment Service: Баланс кошелька u1 изменен. Списание: 320,000 ₽',
      'Payment Service: Сделка e1 переведена в статус ОПЛАЧЕНА.'
    ]
  },
  {
    id: 'notifications',
    title: 'Notification Service',
    sub: 'Push, Email & SMS',
    tech: 'NestJS / RabbitMQ',
    ports: '8009',
    description: 'Асинхронная отправка push-уведомлений на мобильные устройства, писем и SMS через брокер сообщений RabbitMQ.',
    logs: [
      'Notification: Отправлен Push Екатерине: "Ваш отклик на вакансию j1 доставлен!"',
      'Notification: Добавлено сообщение в очередь RabbitMQ: send_escrow_update',
      'Notification: Письмо успешно отправлено на email hr@equhub.ru.'
    ]
  },
  {
    id: 'search',
    title: 'Search Service',
    sub: 'Elasticsearch',
    tech: 'Elasticsearch 8',
    ports: '9200',
    description: 'Полнотекстовый поиск объявлений, вакансий, резюме и публикаций. Поиск по геокоординатам на интерактивной карте.',
    logs: [
      'Search Service: Индексация новой вакансии "Senior NestJS Developer" завершена',
      'Search Service: Выполнен поисковый запрос "MacBook M3 Max" за 12мс',
      'Search Service: Полнотекстовый поиск по карте в радиусе 5км.'
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics Service',
    sub: 'Аналитика рынка',
    tech: 'NestJS / Python',
    ports: '8010',
    description: 'Сбор поведенческих метрик, анализ активности пользователей, статистика по рынку труда и успешности безопасных сделок.',
    logs: [
      'Analytics Service: Расчет средней зарплаты в ИТ-секторе за февраль...',
      'Analytics Service: Сбор логов активности для панели администратора',
      'Analytics Service: Построение рекомендательного вектора для пользователя u1.'
    ]
  },
  {
    id: 'db',
    title: 'Databases & Storage',
    sub: 'Базы данных и S3',
    tech: 'PostgreSQL, Redis, MinIO',
    ports: '5432, 6379, 9000',
    description: 'Слой хранения данных. PostgreSQL хранит транзакции и сущности, Redis кэширует сессии, MinIO хранит изображения и файлы резюме.',
    logs: [
      'PostgreSQL: Завершено транзакционное обновление баланса кошелька',
      'Redis: Обновлен кэш ленты активности (запись активна 60с)',
      'MinIO: Изображение l1 успешно загружено в бакет /marketplace.'
    ]
  }
];

export default function ConceptPage() {
  // Mobile emulator states
  const [activeScreen, setActiveScreen] = useState<'home' | 'marketplace' | 'jobs' | 'chats' | 'ai' | 'escrow' | 'profile'>('home');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Все'>('Все');

  // Job screen states
  const [jobType, setJobType] = useState<'all' | 'vacancy' | 'resume'>('all');
  const [jobSector, setJobSector] = useState<'all' | 'IT' | 'Sales' | 'Marketing' | 'HR' | 'Design'>('all');
  const [jobQuery, setJobQuery] = useState('');
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  // Custom interactive mock data
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [chatMsgs, setChatMsgs] = useState<ChatMessage[]>(initialChatMessages);
  const [escrowList, setEscrowList] = useState<EscrowDeal[]>(initialEscrowDeals);
  const [inputMsg, setInputMsg] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Success overlays for interactivity
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Architectural Diagram states
  const [activeNode, setActiveNode] = useState<string>('gateway');
  const [terminalLogs, setTerminalLogs] = useState<Array<{ text: string; type: 'success' | 'warn' | 'error' | 'info' }>>([
    { text: 'Единая цифровая платформа EQUHUB успешно инициализирована.', type: 'success' },
    { text: 'Подключение к PostgreSQL, Redis, Elasticsearch и MinIO S3 выполнено.', type: 'success' },
    { text: 'Все микросервисы в сети. API Gateway принимает внешние запросы.', type: 'info' }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Show Toast helper
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  // Handle Architecture node click
  const handleNodeClick = (nodeId: string) => {
    setActiveNode(nodeId);
    const service = serviceNodes.find(n => n.id === nodeId);
    if (service) {
      const formattedLogs = service.logs.map(log => ({
        text: `[${service.title}] ${log}`,
        type: log.includes('Ошибка') || log.includes('Error') || log.includes('Блокировка') ? 'error' as const :
              log.includes('Предупреждение') || log.includes('Rate-Limiter') || log.includes('подозрительное') ? 'warn' as const :
              log.includes('успешно') || log.includes('OK') || log.includes('Доставлено') || log.includes('выполнен') ? 'success' as const : 'info' as const
      }));
      setTerminalLogs(prev => [...prev, ...formattedLogs]);
    }
  };

  // Simulate network signal traffic pulsing periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNode = serviceNodes[Math.floor(Math.random() * serviceNodes.length)];
      if (randomNode.id !== 'db') {
        const randomLog = randomNode.logs[Math.floor(Math.random() * randomNode.logs.length)];
        setTerminalLogs(prev => {
          const next = [...prev, {
            text: `[МАРШРУТ] Транзит от ${randomNode.title} к СУБД: ${randomLog}`,
            type: 'info' as const
          }];
          if (next.length > 40) next.shift(); // keep list clean
          return next;
        });
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Filter listings based on interactive inputs
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const queryMatch = item.title.toLowerCase().includes(query.toLowerCase()) ||
                         item.description.toLowerCase().includes(query.toLowerCase());
      const cityMatch = city ? item.city.toLowerCase().includes(city.toLowerCase()) : true;
      const categoryMatch = selectedCategory === 'Все' || item.category === selectedCategory;
      return queryMatch && cityMatch && categoryMatch;
    });
  }, [query, city, selectedCategory, listings]);

  // Filter jobs based on interactive inputs
  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      const matchesType = jobType === 'all' || job.type === jobType;
      const matchesSector = jobSector === 'all' || job.sector === jobSector;
      const matchesQuery = jobQuery ? (
        job.title.toLowerCase().includes(jobQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(jobQuery.toLowerCase()) ||
        (job.requirements && job.requirements.toLowerCase().includes(jobQuery.toLowerCase()))
      ) : true;
      return matchesType && matchesSector && matchesQuery;
    });
  }, [jobType, jobSector, jobQuery]);

  // AI assistant simulation outputs
  const currentAiCategory = useMemo(() => {
    return aiPrompt ? aiSuggestCategory(aiPrompt) : '—';
  }, [aiPrompt]);

  const currentAiDescription = useMemo(() => {
    return aiPrompt ? aiGenerateDescription(aiPrompt) : 'Ожидание ввода параметров товара...';
  }, [aiPrompt]);

  const currentAiModeration = useMemo(() => {
    return aiPrompt ? aiModerateListing(aiPrompt) : { approved: true, reason: 'Ожидание ввода текста' };
  }, [aiPrompt]);

  // Chat message submission
  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: 'Екатерина',
      text: inputMsg,
      time: 'Сейчас'
    };
    setChatMsgs(prev => [...prev, userMsg]);
    setTerminalLogs(prev => [...prev, {
      text: `[Chat Service] Новое WebSocket-сообщение от u1 отправлено. Сигнальный трафик Go...`,
      type: 'success'
    }]);

    const userText = inputMsg;
    setInputMsg('');

    // Simulate response
    setTimeout(() => {
      let replyText = 'Понял вас! Я подготовлю товар к отправке.';
      if (userText.toLowerCase().includes('привет') || userText.toLowerCase().includes('здравствуйте')) {
        replyText = 'Привет! Да, MacBook M3 Max в наличии и готов к любым проверкам в офисе.';
      } else if (userText.toLowerCase().includes('скидк') || userText.toLowerCase().includes('дешев')) {
        replyText = 'Цена и так отличная для M3 Max комплектации, но для пользователей EQUHUB сделаю небольшую скидку!';
      } else if (userText.toLowerCase().includes('безопасн') || userText.toLowerCase().includes('сделк') || userText.toLowerCase().includes('escrow')) {
        replyText = 'Отличная мысль! Безопасная сделка на EQUHUB гарантирует сохранность денег в Escrow, пока вы не проверите ноутбук.';
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'other',
        senderName: 'Илья (Продавец MacBook)',
        text: replyText,
        time: 'Сейчас'
      };
      setChatMsgs(prev => [...prev, botMsg]);
      setTerminalLogs(prev => [...prev, {
        text: `[Chat Service] Доставлен входящий реалтайм ответ от Ильи. Пользователь u1 уведомлен.`,
        type: 'info'
      }]);
    }, 1500);
  };

  // Escrow actions simulation
  const advanceEscrowStep = () => {
    setEscrowList(prev => {
      return prev.map(deal => {
        if (deal.id === 'e1') {
          const nextStep = deal.step < 4 ? deal.step + 1 : 4;
          let statusText: 'создана' | 'оплачена' | 'отправлена' | 'завершена' | 'спор' = deal.status;
          if (nextStep === 3) statusText = 'отправлена';
          if (nextStep === 4) {
            statusText = 'завершена';
            // Also update seller profile / wallet release
            setProfile(p => ({
              ...p,
              walletTransactions: [
                {
                  id: `tx-rel-${Date.now()}`,
                  type: 'escrow_release',
                  amount: deal.price,
                  description: `Разблокирование и выплата из Escrow по сделке #${deal.id}`,
                  time: 'Сегодня'
                },
                ...p.walletTransactions
              ]
            }));
          }

          setTerminalLogs(logs => [...logs, {
            text: `[Payment Service] Сделка e1 переведена на Шаг ${nextStep} (${statusText.toUpperCase()}).`,
            type: 'success'
          }]);

          triggerToast(`Статус сделки: ${statusText.toUpperCase()}`);

          return {
            ...deal,
            step: nextStep,
            status: statusText
          };
        }
        return deal;
      });
    });
  };

  const triggerEscrowDispute = () => {
    setEscrowList(prev => {
      return prev.map(deal => {
        if (deal.id === 'e1') {
          setTerminalLogs(logs => [...logs, {
            text: `[Payment Service] СИГНАЛ АРБИТРАЖА: По безопасной сделке e1 открыт спор соискателем/продавцом!`,
            type: 'error'
          }]);
          triggerToast('Открыт спор по сделке!');
          return {
            ...deal,
            status: 'спор'
          };
        }
        return deal;
      });
    });
  };

  const restartEscrowDeal = () => {
    setEscrowList(prev => {
      return prev.map(deal => {
        if (deal.id === 'e1') {
          setTerminalLogs(logs => [...logs, {
            text: `[Payment Service] Сброс сделки e1 в исходное оплаченное состояние (Шаг 2).`,
            type: 'info'
          }]);
          triggerToast('Сделка возвращена на Шаг 2');
          return {
            ...deal,
            step: 2,
            status: 'оплачена'
          };
        }
        return deal;
      });
    });
  };

  // Job application simulation
  const handleApplyJob = (job: Job) => {
    if (appliedJobs.includes(job.id)) return;
    setAppliedJobs(prev => [...prev, job.id]);
    triggerToast(job.type === 'vacancy' ? 'Отклик успешно отправлен!' : 'Запрос связи отправлен!');

    // Log to terminal
    setTerminalLogs(prev => [...prev, {
      text: `[Vacancy Service] Пользователь Екатерина Смирнова покинула отклик на ${job.type === 'vacancy' ? `вакансию '${job.title}' (${job.company})` : `резюме '${job.title}'`}.`,
      type: 'success'
    }, {
      text: `[Notification Service] Отправка пуш-уведомления автору ${job.author} через RabbitMQ Celery Task.`,
      type: 'info'
    }]);
  };

  // Wallet top up simulation
  const handleTopUpWallet = () => {
    const amount = 50000;
    setProfile(p => ({
      ...p,
      walletBalance: p.walletBalance + amount,
      walletTransactions: [
        {
          id: `tx-${Date.now()}`,
          type: 'deposit',
          amount,
          description: 'Пополнение баланса через Систему быстрых платежей (СБП)',
          time: 'Сегодня'
        },
        ...p.walletTransactions
      ]
    }));

    setTerminalLogs(prev => [...prev, {
      text: `[Payment Service] Баланс пользователя u1 пополнен на +50,000 ₽.`,
      type: 'success'
    }, {
      text: `[PostgreSQL] UPDATE profiles SET wallet_balance = wallet_balance + 50000 WHERE id = 'u1' [1 row affected]`,
      type: 'info'
    }]);

    triggerToast('Кошелёк пополнен на 50,000 ₽!');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Brand Header */}
      <header className="main-header" style={{ padding: '0.8rem 1.5rem' }}>
        <div className="header-inner">
          <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🌌</span>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white text-lg">EQUHUB</span>
              <span className="text-muted text-xs font-normal" style={{ fontSize: '10px', marginTop: '-3px' }}>Единая цифровая платформа</span>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="glass-pill pulsing-glow" style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></span>
              Версия 1.0 (MVP)
            </span>
            <button className="ghost-btn" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => {
              setTerminalLogs([]);
            }}>Очистить консоль</button>
          </div>
        </div>
      </header>

      {/* Interactive Success Toast Overlay */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(6, 182, 212, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #06b6d4',
          color: '#fff',
          borderRadius: '12px',
          padding: '10px 20px',
          zIndex: 1000,
          fontWeight: 'bold',
          fontSize: '13px',
          boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
        }}>
          ✨ {successToast}
        </div>
      )}

      {/* Main Container Layout */}
      <main className="concept-dashboard">

        {/* Left Column: Interactive Screen Selectors & Detailed Russian Infographics */}
        <section className="controls-section flex flex-col gap-4">
          <div className="glass-panel">
            <h2 className="text-base font-bold mb-2 text-cyan">Симулятор Мобильного Приложения</h2>
            <p className="text-xs text-muted mb-4">
              Интерактивный макет 7 экранов супер-аппа EQUHUB, соответствующий техническому заданию (SRS). Кликайте по разделам ниже, чтобы переключить симулятор:
            </p>

            {/* Simulated app screen switch buttons */}
            <div className="flex flex-col gap-1.5">
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'home' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('home'); handleNodeClick('feed'); }}
                style={{ padding: '8px 12px', fontSize: '12px' }}
              >
                <span>🏠 1. Социальная сеть</span>
                <span className="text-xs text-muted">Публикации, сообщества</span>
              </button>
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'marketplace' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('marketplace'); handleNodeClick('market'); }}
                style={{ padding: '8px 12px', fontSize: '12px' }}
              >
                <span>🛍️ 2. Маркетплейс</span>
                <span className="text-xs text-muted">Товары, услуги, геокарта</span>
              </button>
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'jobs' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('jobs'); handleNodeClick('vacancy'); }}
                style={{ padding: '8px 12px', fontSize: '12px' }}
              >
                <span>💼 3. Работа (Вакансии & Резюме)</span>
                <span className="text-xs text-muted" style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>NEW MVP</span>
              </button>
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'chats' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('chats'); handleNodeClick('chat'); }}
                style={{ padding: '8px 12px', fontSize: '12px' }}
              >
                <span>💬 4. Мессенджер & WebRTC</span>
                <span className="text-xs text-muted">Чаты, звонки p2p</span>
              </button>
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'ai' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('ai'); handleNodeClick('ai'); }}
                style={{ padding: '8px 12px', fontSize: '12px' }}
              >
                <span>🤖 5. AI-помощник</span>
                <span className="text-xs text-muted">Генератор, модератор</span>
              </button>
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'escrow' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('escrow'); handleNodeClick('payments'); }}
                style={{ padding: '8px 12px', fontSize: '12px' }}
              >
                <span>🔒 6. Безопасные сделки</span>
                <span className="text-xs text-muted">Escrow-оркестратор</span>
              </button>
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'profile' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('profile'); handleNodeClick('user'); }}
                style={{ padding: '8px 12px', fontSize: '12px' }}
              >
                <span>👤 7. Профиль & Кошелёк</span>
                <span className="text-xs text-muted">Баланс, транзакции, JWT</span>
              </button>
            </div>
          </div>

          {/* Russian Infographics Container */}
          <div className="glass-panel">
            <h3 className="text-xs font-bold mb-3 text-cyan uppercase tracking-wider">Функциональные модули EQUHUB</h3>

            <div className="flex flex-col gap-3">
              <div className="infography-item" style={{ borderColor: 'var(--accent-purple)' }}>
                <div className="infography-title">
                  <span>💼</span> Раздел "Работа" (Вакансии & Резюме)
                </div>
                <div className="infography-desc" style={{ fontSize: '11px' }}>
                  Интегрированная база вакансий компаний и резюме соискателей. Быстрый отклик с отправкой пуш-уведомлений и привязкой чатов для собеседований.
                </div>
              </div>

              <div className="infography-item" style={{ borderColor: 'var(--accent-cyan)' }}>
                <div className="infography-title">
                  <span>🔒</span> Безопасная сделка (Escrow) & Кошелек
                </div>
                <div className="infography-desc" style={{ fontSize: '11px' }}>
                  Внутренние кошельки с поддержкой рублевого баланса. При покупке на маркетплейсе деньги холдируются Payment Service на транзитном счете до приемки товара.
                </div>
              </div>

              <div className="infography-item" style={{ borderColor: 'var(--accent-blue)' }}>
                <div className="infography-title">
                  <span>💬</span> Realtime Мессенджер & WebRTC
                </div>
                <div className="infography-desc" style={{ fontSize: '11px' }}>
                  Мгновенные сообщения через вебсокеты Go. Высокоэффективное C++ ядро осуществляет сигнальный обмен для видеовызовов напрямую между устройствами.
                </div>
              </div>

              <div className="infography-item" style={{ borderColor: '#ef4444' }}>
                <div className="infography-title">
                  <span>🤖</span> AI-ассистент & Автомодерация
                </div>
                <div className="infography-desc" style={{ fontSize: '11px' }}>
                  Интеллектуальная модерация контента на спам и скам-слова. Модуль генерации рекламного текста по названию и автоопределение товарных категорий.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Center Column: The Smartphone Bezel Emulator with 7 Rich Screens */}
        <section className="phone-section flex justify-center">
          <div className="phone-frame" style={{ height: '790px' }}>
            <div className="phone-screen">

              {/* Dynamic Island Notch */}
              <div className="phone-notch">
                <div className="phone-dynamic-island-glow"></div>
              </div>

              {/* Status Bar */}
              <div className="phone-status-bar">
                <span>09:41</span>
                <div className="phone-status-icons">
                  <span>📶</span>
                  <span>🔋 99%</span>
                </div>
              </div>

              {/* PHONE SCREEN CONTENT AREA */}
              <div className="phone-content" style={{ paddingBottom: '4.5rem' }}>

                {/* 1. HOME SCREEN (SOCIAL NETWORK) */}
                {activeScreen === 'home' && (
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-4 mt-2">
                      <h3 className="text-sm font-bold text-cyan">EQUHUB Публикации</h3>
                      <span className="glass-pill" style={{ fontSize: '9px' }}>Москва</span>
                    </div>

                    {/* Stories Bubble Carousel */}
                    <div className="stories-container">
                      <div className="story-bubble" onClick={() => setIsVideoCalling(true)}>
                        <div className="story-inner" title="Начать звонок">🎥</div>
                      </div>
                      <div className="story-bubble">
                        <div className="story-inner">👨‍💻</div>
                      </div>
                      <div className="story-bubble">
                        <div className="story-inner">👩‍🎨</div>
                      </div>
                      <div className="story-bubble">
                        <div className="story-inner">🤖</div>
                      </div>
                      <div className="story-bubble">
                        <div className="story-inner">👔</div>
                      </div>
                    </div>

                    <p className="text-xs text-muted mb-2 font-semibold">РЕКОМЕНДУЕМЫЕ СООБЩЕСТВА</p>
                    {communities.map((comm) => (
                      <div key={comm.id} className="phone-card flex justify-between items-center" style={{ padding: '8px' }}>
                        <div className="flex gap-2 items-center">
                          <span style={{ fontSize: '1.2rem' }}>{comm.image}</span>
                          <div>
                            <p className="font-bold" style={{ fontSize: '10px' }}>{comm.name}</p>
                            <p className="text-muted" style={{ fontSize: '8px' }}>{comm.members.toLocaleString('ru-RU')} участников</p>
                          </div>
                        </div>
                        <button className="glass-pill" style={{ background: 'rgba(6, 182, 212, 0.15)', borderColor: 'var(--accent-cyan)', fontSize: '8px', padding: '2px 6px' }} onClick={() => {
                          setTerminalLogs(prev => [...prev, {
                            text: `[Feed Service] Пользователь вступил в сообщество "${comm.name}".`,
                            type: 'success'
                          }]);
                          triggerToast(`Вы вступили в ${comm.name}!`);
                        }}>Вступить</button>
                      </div>
                    ))}

                    <p className="text-xs text-muted mb-2 mt-2 font-semibold">ПОПУЛЯРНЫЕ ПОСТЫ</p>
                    {socialPosts.map((post) => (
                      <div key={post.id} className="phone-card">
                        <div className="flex gap-2 items-center mb-1.5">
                          <span style={{ fontSize: '1.2rem' }}>{post.avatar}</span>
                          <div>
                            <p className="text-xs font-bold">{post.author}</p>
                            <p className="text-muted" style={{ fontSize: '8px' }}>{post.time}</p>
                          </div>
                        </div>
                        <p className="text-xs mb-2" style={{ lineHeight: '1.3', fontSize: '10.5px' }}>{post.content}</p>
                        {post.image && (
                          <div style={{ borderRadius: '10px', overflow: 'hidden', height: '100px', marginBottom: '8px' }}>
                            <img src={post.image} alt="post media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div className="flex justify-between text-muted" style={{ fontSize: '9px' }}>
                          <span style={{ cursor: 'pointer' }} onClick={() => {
                            setTerminalLogs(prev => [...prev, { text: `[Feed Service] Поставлен лайк на публикацию ${post.id}`, type: 'success' }]);
                            triggerToast('Нравится ❤️');
                          }}>❤️ {post.likes}</span>
                          <span>💬 {post.comments} комментариев</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. MARKETPLACE SCREEN */}
                {activeScreen === 'marketplace' && (
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2 mt-2">
                      <h3 className="text-sm font-bold text-cyan">EQUHUB Маркетплейс</h3>
                      <button className="glass-pill" style={{ fontSize: '9px', padding: '2px 6px' }} onClick={() => setShowMap(!showMap)}>
                        {showMap ? '🗺️ Список' : '🗺️ Карта'}
                      </button>
                    </div>

                    {/* Filter Inputs */}
                    <div className="flex flex-col gap-1.5 mb-3">
                      <input
                        type="text"
                        placeholder="Поиск товаров на маркетплейсе..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#fff', fontSize: '11px', padding: '5px 8px' }}
                      />
                      <div className="grid-2">
                        <input
                          type="text"
                          placeholder="Город..."
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#fff', fontSize: '10px', padding: '4px' }}
                        />
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value as Category | 'Все')}
                          style={{ background: 'rgba(13, 20, 38, 0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#fff', fontSize: '10px', padding: '4px' }}
                        >
                          <option value="Все">Все категории</option>
                          <option value="Авто">Автомобили</option>
                          <option value="Недвижимость">Недвижимость</option>
                          <option value="Техника">Техника</option>
                          <option value="Услуги">Услуги</option>
                          <option value="Хобби">Хобби</option>
                        </select>
                      </div>
                    </div>

                    {/* Interactive Mock Map View */}
                    {showMap ? (
                      <div className="phone-card text-center" style={{ height: '170px', background: 'radial-gradient(circle, #0c152a 0%, #030610 100%)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ position: 'absolute', width: '200%', height: '200%', border: '1px dashed rgba(6, 182, 212, 0.1)', borderRadius: '50%', top: '-50%', left: '-50%' }}></div>
                        <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 0 8px #06b6d4)' }}>📍</span>
                        <p className="text-xs font-bold mt-1 text-cyan">Карта объявлений</p>
                        <p className="text-muted" style={{ fontSize: '8px' }}>Найдено {filteredListings.length} объявлений поблизости</p>
                        <div className="flex gap-2 mt-2">
                          <span className="glass-pill" style={{ fontSize: '8px', padding: '2px 5px' }}>Tesla - Москва</span>
                          <span className="glass-pill" style={{ fontSize: '8px', padding: '2px 5px' }}>MacBook - Москва</span>
                        </div>
                      </div>
                    ) : null}

                    {/* Listings */}
                    <p className="text-xs text-muted mb-2 font-semibold">ОБЪЯВЛЕНИЯ ({filteredListings.length})</p>
                    {filteredListings.length === 0 ? (
                      <p className="text-xs text-muted text-center py-4">Ничего не найдено</p>
                    ) : (
                      filteredListings.map((listing) => (
                        <div key={listing.id} className="phone-card">
                          <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '110px', marginBottom: '8px' }}>
                            <img src={listing.image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div className="glass-pill" style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(10, 15, 30, 0.85)', fontSize: '8px' }}>
                              ⚡ AI Оценка: {listing.aiScore}%
                            </div>
                            <span className="glass-pill" style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(6, 182, 212, 0.9)', fontSize: '8px' }}>
                              {listing.category}
                            </span>
                          </div>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-bold" style={{ maxWidth: '65%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.title}</h4>
                            <span className="text-xs font-bold text-cyan" style={{ whiteSpace: 'nowrap' }}>{listing.price.toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <p className="text-muted mb-2" style={{ fontSize: '9px', lineHeight: '1.2' }}>{listing.description}</p>
                          <div className="flex justify-between items-center" style={{ fontSize: '9px' }}>
                            <span>📍 {listing.city} · {listing.seller}</span>
                            <button className="glass-pill" style={{ padding: '2px 6px', fontSize: '8px', background: 'rgba(6,182,212,0.1)' }} onClick={() => {
                              setActiveScreen('chats');
                              handleNodeClick('chat');
                              setTerminalLogs(prev => [...prev, {
                                text: `[Marketplace] Инициализация чата по товару "${listing.title}" с продавцом ${listing.seller}.`,
                                type: 'success'
                              }]);
                            }}>Обсудить</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. JOBS SCREEN (NEW!) */}
                {activeScreen === 'jobs' && (
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2 mt-2">
                      <h3 className="text-sm font-bold text-cyan">EQUHUB Работа</h3>
                      <span className="glass-pill" style={{ fontSize: '9px', background: 'rgba(6, 182, 212, 0.15)' }}>Аналитика: Активна</span>
                    </div>

                    {/* Toggle Vacancies / Resumes */}
                    <div className="flex gap-1.5 mb-2">
                      <button
                        className={`glass-pill flex-1 text-center`}
                        style={{
                          background: jobType === 'all' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                          borderColor: jobType === 'all' ? 'var(--accent-cyan)' : 'transparent',
                          color: '#fff',
                          fontWeight: 'bold',
                          padding: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setJobType('all')}
                      >
                        Все
                      </button>
                      <button
                        className={`glass-pill flex-1 text-center`}
                        style={{
                          background: jobType === 'vacancy' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                          borderColor: jobType === 'vacancy' ? 'var(--accent-cyan)' : 'transparent',
                          color: '#fff',
                          fontWeight: 'bold',
                          padding: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setJobType('vacancy')}
                      >
                        Вакансии
                      </button>
                      <button
                        className={`glass-pill flex-1 text-center`}
                        style={{
                          background: jobType === 'resume' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                          borderColor: jobType === 'resume' ? 'var(--accent-cyan)' : 'transparent',
                          color: '#fff',
                          fontWeight: 'bold',
                          padding: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setJobType('resume')}
                      >
                        Резюме
                      </button>
                    </div>

                    {/* Filter Inputs for Jobs */}
                    <div className="flex flex-col gap-1.5 mb-3">
                      <input
                        type="text"
                        placeholder="Поиск вакансии или резюме..."
                        value={jobQuery}
                        onChange={(e) => setJobQuery(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#fff', fontSize: '11px', padding: '5px 8px' }}
                      />
                      <select
                        value={jobSector}
                        onChange={(e) => setJobSector(e.target.value as any)}
                        style={{ background: 'rgba(13, 20, 38, 0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#fff', fontSize: '10px', padding: '4px' }}
                      >
                        <option value="all">Все отрасли</option>
                        <option value="IT">IT (Информационные технологии)</option>
                        <option value="HR">HR / Рекрутмент</option>
                        <option value="Sales">Продажи / Sales</option>
                        <option value="Marketing">Маркетинг / PR</option>
                        <option value="Design">Дизайн / UX/UI</option>
                      </select>
                    </div>

                    {/* Jobs List */}
                    <p className="text-xs text-muted mb-2 font-semibold">СПИСОК ОБЪЯВЛЕНИЙ ({filteredJobs.length})</p>
                    {filteredJobs.length === 0 ? (
                      <p className="text-xs text-muted text-center py-4">Объявлений не найдено</p>
                    ) : (
                      filteredJobs.map((job) => (
                        <div key={job.id} className="phone-card" style={{ borderLeft: job.type === 'vacancy' ? '3px solid var(--accent-cyan)' : '3px solid var(--accent-purple)' }}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="glass-pill" style={{ fontSize: '7px', padding: '1px 4px', background: job.type === 'vacancy' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(139, 92, 246, 0.15)', color: job.type === 'vacancy' ? 'var(--accent-cyan)' : 'var(--accent-purple)' }}>
                              {job.type === 'vacancy' ? 'ВАКАНСИЯ' : 'РЕЗЮМЕ'}
                            </span>
                            <span className="text-xs font-bold text-white" style={{ fontSize: '11px' }}>
                              {job.salary.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mb-1" style={{ fontSize: '11px' }}>{job.title}</h4>
                          {job.company && (
                            <p className="text-cyan font-semibold mb-1" style={{ fontSize: '9px' }}>🏢 {job.company}</p>
                          )}
                          <p className="text-muted mb-2" style={{ fontSize: '9px', lineHeight: '1.2' }}>
                            {job.description}
                          </p>
                          {job.requirements && (
                            <div className="mb-2" style={{ background: 'rgba(255,255,255,0.02)', padding: '5px', borderRadius: '6px', fontSize: '8px' }}>
                              <strong className="text-white">Требования:</strong> {job.requirements}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <span style={{ fontSize: '8px', color: 'var(--muted)' }}>📍 {job.city} · {job.author}</span>
                            <button
                              className="glass-pill"
                              style={{
                                padding: '3px 8px',
                                fontSize: '8px',
                                cursor: 'pointer',
                                background: appliedJobs.includes(job.id) ? 'rgba(74, 222, 128, 0.15)' : 'rgba(6,182,212,0.15)',
                                borderColor: appliedJobs.includes(job.id) ? '#4ade80' : 'var(--accent-cyan)',
                                color: appliedJobs.includes(job.id) ? '#4ade80' : '#fff'
                              }}
                              onClick={() => handleApplyJob(job)}
                            >
                              {appliedJobs.includes(job.id) ? '✓ Отправлено' : job.type === 'vacancy' ? 'Откликнуться' : 'Связаться'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 4. CHATS SCREEN */}
                {activeScreen === 'chats' && (
                  <div className="flex flex-col h-full" style={{ minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex justify-between items-center mb-2 mt-2">
                      <h3 className="text-sm font-bold text-cyan">Диалоги</h3>
                      <button className="glass-pill pulsing-glow" style={{ borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', fontSize: '8px', padding: '2px 6px' }} onClick={() => setIsVideoCalling(true)}>
                        📞 Видеозвонок
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-between" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                      {/* Message Thread container */}
                      <div className="flex flex-col gap-2 mb-4" style={{ overflowY: 'auto', flex: 1, paddingRight: '2px' }}>
                        {chatMsgs.map((msg) => (
                          <div
                            key={msg.id}
                            style={{
                              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                              maxWidth: '85%',
                              background: msg.sender === 'user' ? 'linear-gradient(135deg, #0891b2, #0369a1)' : 'rgba(255, 255, 255, 0.04)',
                              border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '12px',
                              padding: '8px 10px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                          >
                            <p className="text-muted mb-1" style={{ fontSize: '8px', fontWeight: 'bold', color: msg.sender === 'user' ? '#67e8f9' : 'var(--accent-cyan)' }}>
                              {msg.senderName}
                            </p>
                            <p className="text-xs" style={{ color: '#fff', lineHeight: '1.3', fontSize: '10px' }}>{msg.text}</p>
                            <p className="text-right text-muted" style={{ fontSize: '7px', marginTop: '2px' }}>{msg.time}</p>
                          </div>
                        ))}
                      </div>

                      {/* Msg Input Area */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Напишите сообщение..."
                          value={inputMsg}
                          onChange={(e) => setInputMsg(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#fff', fontSize: '11px', padding: '6px 10px' }}
                        />
                        <button className="glow-btn" style={{ padding: '6px 10px', fontSize: '11px', borderRadius: '8px', background: 'linear-gradient(135deg, #0891b2, #8b5cf6)' }} onClick={handleSendMessage}>
                          🚀
                        </button>
                      </div>
                    </div>

                    {/* Video Call Dialog Overlay inside Simulator */}
                    {isVideoCalling && (
                      <div className="videocall-overlay">
                        <h4 className="text-xs font-bold text-center mb-2 text-cyan">WebRTC Видеовызов (P2P)</h4>
                        <div className="video-stream-box" style={{ background: '#070a16' }}>
                          {/* Main stream - seller */}
                          <div className="text-center">
                            <span style={{ fontSize: '2.5rem', display: 'block' }}>👨‍💻</span>
                            <p className="text-xs font-semibold text-white mt-1">Илья (Продавец)</p>
                            <p className="text-muted" style={{ fontSize: '8px' }}>Трансляция 1080p · 60fps</p>
                          </div>

                          {/* Small stream - current user */}
                          <div className="small-stream-box flex items-center justify-center">
                            <span style={{ fontSize: '1.4rem' }}>👩‍🎨</span>
                          </div>
                        </div>

                        {/* Connection statistics banner */}
                        <div className="glass-panel mt-2" style={{ padding: '5px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)' }}>
                          <p className="text-cyan font-bold" style={{ fontSize: '8px' }}>СТАТИСТИКА WebRTC:</p>
                          <p className="text-muted" style={{ fontSize: '7px', lineHeight: '1.2' }}>Задержка: 12мс · Потери: 0.0% · Кодек: VP9 · Тип: Прямое p2p соединение</p>
                        </div>

                        {/* Buttons control bar */}
                        <div className="video-control-bar">
                          <button className="video-control-btn" style={{ width: '36px', height: '36px', fontSize: '12px' }} onClick={() => {
                            setTerminalLogs(prev => [...prev, { text: '[Chat Service] Микрофон отключен пользователем u1', type: 'warn' }]);
                            triggerToast('Микрофон выключен');
                          }}>🎙️</button>
                          <button className="video-control-btn hangup" style={{ width: '36px', height: '36px', fontSize: '12px' }} onClick={() => {
                            setIsVideoCalling(false);
                            setTerminalLogs(prev => [...prev, { text: '[Chat Service] Видеосессия WebRTC успешно завершена.', type: 'info' }]);
                            triggerToast('Вызов завершен');
                          }}>
                            ❌
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. AI ASSISTANT SCREEN */}
                {activeScreen === 'ai' && (
                  <div className="flex flex-col">
                    <div className="text-center mt-1 mb-3">
                      <div className="ai-glow-ring" style={{ width: '60px', height: '60px' }}>
                        <span style={{ fontSize: '2rem' }}>🤖</span>
                      </div>
                      <h3 className="text-xs font-bold text-cyan">AI-Ассистент EQUHUB</h3>
                      <p className="text-muted" style={{ fontSize: '8px' }}>Умный подбор категорий, модератор и генератор текстов</p>
                    </div>

                    <div className="phone-card" style={{ padding: '8px' }}>
                      <p className="text-xs font-bold mb-1 text-cyan">Введите название объявления:</p>
                      <input
                        type="text"
                        placeholder="Например: Сдам офис в СПБ или PlayStation скам..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#fff', fontSize: '11px', padding: '5px 8px', marginBottom: '8px' }}
                      />

                      <div className="flex flex-col gap-1.5" style={{ fontSize: '9.5px' }}>
                        <div>
                          <span className="text-muted">Рекомендуемая категория:</span>{' '}
                          <strong className="text-cyan">{currentAiCategory}</strong>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '5px' }}>
                          <span className="text-muted">AI-Модерация:</span>{' '}
                          <span className={currentAiModeration.approved ? 'success' : 'danger'} style={{ fontWeight: 'bold' }}>
                            {currentAiModeration.approved ? 'Разрешено ✅' : 'Блокировка ❌'}
                          </span>
                          <p className="text-muted" style={{ fontSize: '8.5px', marginTop: '2px' }}>{currentAiModeration.reason}</p>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '5px' }}>
                          <span className="text-muted">Генеративный текст:</span>
                          <p className="text-white p-2 rounded mt-1" style={{ fontSize: '8.5px', lineHeight: '1.2', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            {currentAiDescription}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted mb-1.5 font-semibold">БЫСТРЫЕ AI ШАБЛОНЫ</p>
                    <div className="flex flex-col gap-1">
                      <button className="ghost-btn text-left text-xs" style={{ padding: '5px 8px', fontSize: '10px' }} onClick={() => {
                        setAiPrompt('MacBook Pro M3 Max');
                        handleNodeClick('ai');
                        triggerToast('Загружен шаблон MacBook');
                      }}>
                        💻 MacBook Pro M3 Max
                      </button>
                      <button className="ghost-btn text-left text-xs" style={{ padding: '5px 8px', fontSize: '10px', color: '#f87171' }} onClick={() => {
                        setAiPrompt('Продам схему обмана и легкий скам');
                        handleNodeClick('ai');
                        triggerToast('Загружен спам-шаблон');
                      }}>
                        ⚠️ Обнаружение скама (Блокировка)
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. ESCROW SCREEN (SECURE DEAL) */}
                {activeScreen === 'escrow' && (
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-3 mt-2">
                      <h3 className="text-sm font-bold text-cyan">Безопасные Сделки</h3>
                      <button className="glass-pill" style={{ fontSize: '8px', padding: '2px 5px' }} onClick={restartEscrowDeal}>Сбросить</button>
                    </div>

                    {escrowList.map((deal) => (
                      <div key={deal.id} className="phone-card">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold" style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>Сделка #{deal.id}</span>
                          <span className={`glass-pill ${deal.status === 'завершена' ? 'success' : deal.status === 'спор' ? 'danger' : 'pulsing-glow'}`} style={{
                            background: deal.status === 'завершена' ? 'rgba(74, 222, 128, 0.15)' : deal.status === 'спор' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                            borderColor: deal.status === 'завершена' ? '#4ade80' : deal.status === 'спор' ? '#ef4444' : 'var(--accent-cyan)',
                            color: deal.status === 'завершена' ? '#4ade80' : deal.status === 'спор' ? '#ef4444' : 'var(--accent-cyan)',
                            fontSize: '8px',
                            padding: '1px 5px'
                          }}>
                            {deal.status.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold mb-0.5">{deal.title}</h4>
                        <p className="text-xs font-bold text-cyan mb-2">{deal.price.toLocaleString('ru-RU')} ₽</p>

                        {/* Escrow Progress Stepper */}
                        <div className="escrow-steps">
                          <div className={`escrow-step ${deal.step >= 1 ? 'done' : ''}`} title="Создана">1</div>
                          <div className={`escrow-step ${deal.step >= 2 ? (deal.step === 2 ? 'active' : 'done') : ''}`} title="Оплачена в Escrow">2</div>
                          <div className={`escrow-step ${deal.step >= 3 ? (deal.step === 3 ? 'active' : 'done') : ''}`} title="Отправлена">3</div>
                          <div className={`escrow-step ${deal.step >= 4 ? 'active' : ''}`} title="Завершена">4</div>
                        </div>

                        <div className="flex justify-between text-muted mb-3" style={{ fontSize: '7.5px' }}>
                          <span>1. Создана</span>
                          <span>2. Заморожена</span>
                          <span>3. В пути</span>
                          <span>4. Выдана</span>
                        </div>

                        <div className="text-muted mb-3" style={{ fontSize: '9px', lineHeight: '1.25' }}>
                          <p><strong>Покупатель:</strong> {deal.buyer}</p>
                          <p><strong>Продавец:</strong> {deal.seller}</p>
                          <p className="mt-1 text-white" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                            {deal.status === 'оплачена' && '🔒 Средства заморожены на транзитном счете Payment Service. Илья упаковывает товар.'}
                            {deal.status === 'отправлена' && '📦 Товар передан службе доставки. Ожидайте прибытия.'}
                            {deal.status === 'завершена' && '🎉 Сделка завершена! Средства разблокированы и переведены на баланс Ильи.'}
                            {deal.status === 'спор' && '⚠️ Открыт диспут. Арбитры EQUHUB анализируют переписку соискателя.'}
                          </p>
                        </div>

                        {/* Action buttons based on status */}
                        <div className="flex flex-col gap-1.5">
                          {deal.step === 2 && (
                            <button className="phone-btn-neon" style={{ fontSize: '11px', padding: '6px' }} onClick={advanceEscrowStep}>
                              📦 Подтвердить отправку товара
                            </button>
                          )}
                          {deal.step === 3 && (
                            <button className="phone-btn-neon" style={{ background: 'linear-gradient(90deg, #10b981, #059669)', fontSize: '11px', padding: '6px' }} onClick={advanceEscrowStep}>
                              ✅ Подтвердить получение
                            </button>
                          )}
                          {deal.status !== 'завершена' && deal.status !== 'спор' && (
                            <button className="ghost-btn text-xs text-center" style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)', fontSize: '10px', padding: '4px' }} onClick={triggerEscrowDispute}>
                              ⚠️ Открыть спор / Арбитраж
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 7. PROFILE & WALLET SCREEN */}
                {activeScreen === 'profile' && (
                  <div className="flex flex-col">
                    <div className="text-center mt-3 mb-3">
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #0891b2, #8b5cf6)', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.6rem' }}>👩‍🎨</span>
                      </div>
                      <h3 className="text-xs font-bold">{profile.name}</h3>
                      <p className="text-muted" style={{ fontSize: '9px' }}>{profile.email}</p>
                      <div className="flex justify-center gap-1.5 mt-1.5">
                        <span className="glass-pill" style={{ color: '#facc15', fontSize: '8px', padding: '2px 5px' }}>⭐ {profile.sellerRating}</span>
                        <span className="glass-pill" style={{ fontSize: '8px', padding: '2px 5px' }}>📍 {profile.city}</span>
                      </div>
                    </div>

                    {/* Wallet Component */}
                    <div className="phone-card" style={{ borderColor: 'var(--accent-cyan)', background: 'linear-gradient(185deg, rgba(6, 182, 212, 0.1), rgba(0,0,0,0))' }}>
                      <div className="flex justify-between items-center mb-1">
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>КОШЕЛЁК EQUHUB</span>
                        <span style={{ fontSize: '7px', color: 'var(--muted)' }}>JWT СЕССИЯ АКТИВНА</span>
                      </div>
                      <p className="text-lg font-bold text-white mb-2">{profile.walletBalance.toLocaleString('ru-RU')} ₽</p>

                      <button className="phone-btn-neon" style={{ background: 'linear-gradient(90deg, #0891b2, #06b6d4)', fontSize: '10px', padding: '5px' }} onClick={handleTopUpWallet}>
                        💵 Пополнить баланс через СБП
                      </button>
                    </div>

                    {/* Transactions Log List */}
                    <p className="text-xs text-muted mb-1.5 font-semibold">ИСТОРИЯ ОПЕРАЦИЙ</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                      {profile.walletTransactions.map((tx) => (
                        <div key={tx.id} className="phone-card" style={{ padding: '6px', marginBottom: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ maxWidth: '75%' }}>
                            <p style={{ fontSize: '8px', color: '#fff', fontWeight: 'bold', lineHeight: '1.1' }}>{tx.description}</p>
                            <p style={{ fontSize: '7px', color: 'var(--muted)', marginTop: '2px' }}>{tx.time}</p>
                          </div>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 'bold',
                            color: tx.type === 'deposit' || tx.type === 'escrow_release' ? '#4ade80' : tx.type === 'escrow_refund' ? '#38bdf8' : '#ef4444'
                          }}>
                            {tx.type === 'deposit' || tx.type === 'escrow_release' ? '+' : '-'} {tx.amount.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Home Indicator bar */}
              <div className="phone-home-bar"></div>

              {/* Bottom Navigation Bar */}
              <nav className="phone-bottom-nav">
                <button
                  className={`phone-nav-item ${activeScreen === 'home' ? 'active' : ''}`}
                  onClick={() => { setActiveScreen('home'); handleNodeClick('feed'); }}
                >
                  <span className="phone-nav-icon">🏠</span>
                  <span style={{ fontSize: '7px' }}>Соцсеть</span>
                </button>
                <button
                  className={`phone-nav-item ${activeScreen === 'marketplace' ? 'active' : ''}`}
                  onClick={() => { setActiveScreen('marketplace'); handleNodeClick('market'); }}
                >
                  <span className="phone-nav-icon">🛍️</span>
                  <span style={{ fontSize: '7px' }}>Маркет</span>
                </button>
                <button
                  className={`phone-nav-item ${activeScreen === 'jobs' ? 'active' : ''}`}
                  onClick={() => { setActiveScreen('jobs'); handleNodeClick('vacancy'); }}
                >
                  <span className="phone-nav-icon">💼</span>
                  <span style={{ fontSize: '7px', color: 'var(--accent-cyan)' }}>Работа</span>
                </button>
                <button
                  className={`phone-nav-item ${activeScreen === 'chats' ? 'active' : ''}`}
                  onClick={() => { setActiveScreen('chats'); handleNodeClick('chat'); }}
                >
                  <span className="phone-nav-icon">💬</span>
                  <span style={{ fontSize: '7px' }}>Чаты</span>
                </button>
                <button
                  className={`phone-nav-item ${activeScreen === 'ai' ? 'active' : ''}`}
                  onClick={() => { setActiveScreen('ai'); handleNodeClick('ai'); }}
                >
                  <span className="phone-nav-icon">🤖</span>
                  <span style={{ fontSize: '7px' }}>AI</span>
                </button>
              </nav>

            </div>
          </div>
        </section>

        {/* Right Column: Architectural Flowchart Diagram & Microservice details with Live Logs Monitor */}
        <section className="arch-section flex flex-col gap-4">
          <div className="glass-panel">
            <h2 className="text-base font-bold mb-1 text-cyan">Архитектура платформы EQUHUB</h2>
            <p className="text-xs text-muted mb-3">
              Интерактивная карта микросервисов. Кликните по сервису, чтобы просмотреть его характеристики, порты, технологии и живую трассировку логов:
            </p>

            {/* Interactive Flowchart Diagram SVG */}
            <div className="arch-svg-container">
              <svg viewBox="0 0 450 490" className="w-full h-full">

                {/* Background decorative grids */}
                <defs>
                  <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.03)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />

                {/* FLOW CONNECTIONS (LINKS) */}
                {/* Client to Gateway */}
                <path d="M 225 50 L 225 75" className={`arch-link ${(activeNode === 'client' || activeNode === 'gateway') ? 'active' : ''}`} />

                {/* Gateway to Row 1 (Auth, User, Feed) */}
                <path d="M 225 115 L 72 140" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'auth') ? 'active' : ''}`} />
                <path d="M 225 115 L 202 140" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'user') ? 'active' : ''}`} />
                <path d="M 225 115 L 332 140" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'feed') ? 'active' : ''}`} />

                {/* Gateway to Row 2 (Chat, Market, Vacancy) */}
                <path d="M 225 115 L 72 195" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'chat') ? 'active' : ''}`} />
                <path d="M 225 115 L 202 195" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'market') ? 'active' : ''}`} />
                <path d="M 225 115 L 332 195" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'vacancy') ? 'active' : ''}`} />

                {/* Gateway to Row 3 (AI, Payments, Notifications) */}
                <path d="M 225 115 L 72 250" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'ai') ? 'active' : ''}`} />
                <path d="M 225 115 L 202 250" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'payments') ? 'active' : ''}`} />
                <path d="M 225 115 L 332 250" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'notifications') ? 'active' : ''}`} />

                {/* Connect services to Databases / Search / Analytics */}
                <path d="M 72 285 L 140 305" className="arch-link" />
                <path d="M 202 285 L 140 305" className="arch-link" />
                <path d="M 332 285 L 290 305" className="arch-link" />

                <path d="M 140 340 L 225 370" className="arch-link" />
                <path d="M 290 340 L 225 370" className="arch-link" />

                {/* Pulsing traffic signal points */}
                <circle cx="225" cy="62" r="3" className="signal-dot pulsing-glow">
                  <animate attributeName="cy" values="50;75" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="140" cy="127" r="3" className="signal-dot pulsing-glow" style={{ fill: 'var(--accent-purple)' }}>
                  <animate attributeName="cx" values="225;72" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="115;140" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="213" cy="127" r="2.5" className="signal-dot pulsing-glow">
                  <animate attributeName="cx" values="225;202" dur="1.7s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="115;140" dur="1.7s" repeatCount="indefinite" />
                </circle>
                <circle cx="280" cy="127" r="2.5" className="signal-dot pulsing-glow" style={{ fill: 'var(--accent-cyan)' }}>
                  <animate attributeName="cx" values="225;332" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="115;140" dur="2.2s" repeatCount="indefinite" />
                </circle>

                {/* NODES - COORDINATES MAP */}
                {/* 1. Mobile Apps (Flutter) */}
                <g className={`arch-node ${activeNode === 'client' ? 'active' : ''}`} onClick={() => handleNodeClick('client')}>
                  <rect x="150" y="10" width="150" height="40" />
                  <text x="225" y="26" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle" className="node-title">Mobile Apps (Flutter)</text>
                  <text x="225" y="36" fill="var(--accent-cyan)" fontSize="8" textAnchor="middle">Dart, WebSockets, WebRTC</text>
                </g>

                {/* 2. API Gateway */}
                <g className={`arch-node ${activeNode === 'gateway' ? 'active' : ''}`} onClick={() => handleNodeClick('gateway')}>
                  <rect x="150" y="75" width="150" height="40" />
                  <text x="225" y="91" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle" className="node-title">API Gateway</text>
                  <text x="225" y="101" fill="var(--accent-purple)" fontSize="8" textAnchor="middle">Nginx / SSL / JWT Auth</text>
                </g>

                {/* ROW 1: Auth, User, Feed */}
                {/* 3. Auth Service */}
                <g className={`arch-node ${activeNode === 'auth' ? 'active' : ''}`} onClick={() => handleNodeClick('auth')}>
                  <rect x="15" y="140" width="115" height="35" />
                  <text x="72" y="155" fill="#fff" fontSize="9" textAnchor="middle" className="node-title">Auth Service</text>
                  <text x="72" y="165" fill="var(--muted)" fontSize="7" textAnchor="middle">Python/FastAPI [8001]</text>
                </g>

                {/* 4. User Service */}
                <g className={`arch-node ${activeNode === 'user' ? 'active' : ''}`} onClick={() => handleNodeClick('user')}>
                  <rect x="145" y="140" width="115" height="35" />
                  <text x="202" y="155" fill="#fff" fontSize="9" textAnchor="middle" className="node-title">User Service</text>
                  <text x="202" y="165" fill="var(--muted)" fontSize="7" textAnchor="middle">NestJS [8002]</text>
                </g>

                {/* 5. Feed Service */}
                <g className={`arch-node ${activeNode === 'feed' ? 'active' : ''}`} onClick={() => handleNodeClick('feed')}>
                  <rect x="275" y="140" width="115" height="35" />
                  <text x="332" y="155" fill="#fff" fontSize="9" textAnchor="middle" className="node-title">Feed Service</text>
                  <text x="332" y="165" fill="var(--muted)" fontSize="7" textAnchor="middle">NestJS [8003]</text>
                </g>

                {/* ROW 2: Chat, Market, Vacancy */}
                {/* 6. Chat Service */}
                <g className={`arch-node ${activeNode === 'chat' ? 'active' : ''}`} onClick={() => handleNodeClick('chat')}>
                  <rect x="15" y="195" width="115" height="35" />
                  <text x="72" y="210" fill="#fff" fontSize="9" textAnchor="middle" className="node-title">Chat Service</text>
                  <text x="72" y="220" fill="var(--muted)" fontSize="7" textAnchor="middle">Go & C++ [8004]</text>
                </g>

                {/* 7. Marketplace Service */}
                <g className={`arch-node ${activeNode === 'market' ? 'active' : ''}`} onClick={() => handleNodeClick('market')}>
                  <rect x="145" y="195" width="115" height="35" />
                  <text x="202" y="210" fill="#fff" fontSize="9" textAnchor="middle" className="node-title">Market Service</text>
                  <text x="202" y="220" fill="var(--muted)" fontSize="7" textAnchor="middle">NestJS [8005]</text>
                </g>

                {/* 8. Vacancy Service */}
                <g className={`arch-node ${activeNode === 'vacancy' ? 'active' : ''}`} onClick={() => handleNodeClick('vacancy')}>
                  <rect x="275" y="195" width="115" height="35" />
                  <text x="332" y="210" fill="#fff" fontSize="9" textAnchor="middle" className="node-title">Vacancy Service</text>
                  <text x="332" y="220" fill="var(--muted)" fontSize="7" textAnchor="middle">NestJS [8006]</text>
                </g>

                {/* ROW 3: AI, Payments, Notifications */}
                {/* 9. AI Service */}
                <g className={`arch-node ${activeNode === 'ai' ? 'active' : ''}`} onClick={() => handleNodeClick('ai')}>
                  <rect x="15" y="250" width="115" height="35" />
                  <text x="72" y="265" fill="#fff" fontSize="9" textAnchor="middle" className="node-title">AI Service</text>
                  <text x="72" y="275" fill="var(--accent-purple)" fontSize="7" textAnchor="middle">FastAPI/PyTorch [8007]</text>
                </g>

                {/* 10. Payment Service */}
                <g className={`arch-node ${activeNode === 'payments' ? 'active' : ''}`} onClick={() => handleNodeClick('payments')}>
                  <rect x="145" y="250" width="115" height="35" />
                  <text x="202" y="265" fill="#fff" fontSize="9" textAnchor="middle" className="node-title">Payment Service</text>
                  <text x="202" y="275" fill="var(--muted)" fontSize="7" textAnchor="middle">NestJS/Escrow [8008]</text>
                </g>

                {/* 11. Notification Service */}
                <g className={`arch-node ${activeNode === 'notifications' ? 'active' : ''}`} onClick={() => handleNodeClick('notifications')}>
                  <rect x="275" y="250" width="115" height="35" />
                  <text x="332" y="265" fill="#fff" fontSize="9" textAnchor="middle" className="node-title">Notification Serv.</text>
                  <text x="332" y="275" fill="var(--muted)" fontSize="7" textAnchor="middle">NestJS/RabbitMQ [8009]</text>
                </g>

                {/* LOWER ROW: Search & Analytics */}
                {/* 12. Search Service */}
                <g className={`arch-node ${activeNode === 'search' ? 'active' : ''}`} onClick={() => handleNodeClick('search')}>
                  <rect x="80" y="305" width="120" height="35" />
                  <text x="140" y="320" fill="#fff" fontSize="9" textAnchor="middle" className="node-title">Search Service</text>
                  <text x="140" y="330" fill="var(--muted)" fontSize="7" textAnchor="middle">Elasticsearch 8 [9200]</text>
                </g>

                {/* 13. Analytics Service */}
                <g className={`arch-node ${activeNode === 'analytics' ? 'active' : ''}`} onClick={() => handleNodeClick('analytics')}>
                  <rect x="230" y="305" width="120" height="35" />
                  <text x="290" y="320" fill="#fff" fontSize="9" textAnchor="middle" className="node-title">Analytics Service</text>
                  <text x="290" y="330" fill="var(--muted)" fontSize="7" textAnchor="middle">NestJS/Python [8010]</text>
                </g>

                {/* Databases Layer */}
                <g className={`arch-node ${activeNode === 'db' ? 'active' : ''}`} onClick={() => handleNodeClick('db')}>
                  <rect x="110" y="370" width="230" height="45" style={{ rx: '12px' }} />
                  <text x="225" y="388" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle" className="node-title">PostgreSQL / Redis / MinIO</text>
                  <text x="225" y="399" fill="var(--accent-cyan)" fontSize="7.5" textAnchor="middle">СУБД транзакций, Кэш сессий & S3 Хранилище</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Active Microservice Tech Spec */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            {serviceNodes.map((service) => (
              service.id === activeNode ? (
                <div key={service.id} className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-bold text-accent uppercase tracking-wider" style={{ fontSize: '11px' }}>{service.title}</h3>
                    <span className="glass-pill" style={{ fontSize: '8px', padding: '1px 5px' }}>Порт: {service.ports}</span>
                  </div>
                  <p className="text-xs font-bold text-cyan mb-1.5" style={{ fontSize: '10px' }}>Стек: {service.tech}</p>
                  <p className="text-xs text-muted" style={{ lineHeight: '1.3', fontSize: '11px' }}>{service.description}</p>
                </div>
              ) : null
            ))}
          </div>

          {/* Microservice Live Logs Terminal Monitor */}
          <div className="glass-panel" style={{ padding: '0.8rem' }}>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2" style={{ fontSize: '9px' }}>Мониторинг шины логов (В реальном времени)</h3>
            <div className="terminal-monitor" style={{ height: '140px', padding: '0.5rem' }}>
              <div className="terminal-header" style={{ fontSize: '8px' }}>
                <span>EQUHUB EVENT STREAM v1.0</span>
                <span>ONLINE</span>
              </div>
              {terminalLogs.map((log, index) => (
                <div key={index} className={`terminal-line ${log.type}`} style={{ fontSize: '10px', marginBottom: '3px' }}>
                  &gt; {log.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </section>

      </main>

      {/* Footer Branding */}
      <footer className="glass-panel" style={{ margin: '1.5rem', marginTop: 'auto', textAlign: 'center', padding: '1rem', borderTop: '1px solid var(--border)', borderRadius: '16px' }}>
        <p className="text-xs text-muted" style={{ fontSize: '11px' }}>
          Разработчик: <strong>Mikola199</strong> · Единая цифровая платформа <strong>EQUHUB</strong> разработана в соответствии с ТЗ (Next.js 14, FastAPI Python, Go Realtime, WebRTC, Tailwind, PostgreSQL, Redis, Elasticsearch). 2026.
        </p>
      </footer>
    </div>
  );
}
