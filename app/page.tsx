'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  listings as initialListings,
  demoProfile,
  socialPosts,
  communities,
  chatMessages as initialChatMessages,
  escrowDeals as initialEscrowDeals
} from '@/lib/mockData';
import {
  aiSuggestCategory,
  aiGenerateDescription,
  aiModerateListing,
  aiRecommend
} from '@/lib/ai';
import { Category, Listing, ChatMessage, EscrowDeal } from '@/lib/types';

// Microservices info for the architectural diagram
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
    description: 'Клиентские приложения с нативной производительностью, встроенной связью p2p для видеозвонков и push-уведомлениями.',
    logs: [
      'Инициализация WebRTC Peer Connection...',
      'Успешное подключение к API Gateway по протоколу HTTPS.',
      'Загрузка конфигурации интерфейса: темная тема, стеклянные панели.'
    ]
  },
  {
    id: 'gateway',
    title: 'API Gateway',
    sub: 'Маршрутизация & Лимиты',
    tech: 'Nginx / Kong',
    ports: '80 / 443',
    description: 'Единая точка входа. Выполняет SSL-терминацию, балансировку нагрузки, rate limiting и перенаправление запросов на микросервисы.',
    logs: [
      'Gateway GET /api/v1/listings -> Redirect to Marketplace Service [200 OK]',
      'Gateway POST /api/v1/chat/message -> Redirect to Chat Service [201 Created]',
      'Gateway Rate-Limiter: IP 192.168.1.100 - Запросов: 12/сек (Лимит: 60/сек)'
    ]
  },
  {
    id: 'auth',
    title: 'Auth Service',
    sub: 'Авторизация и Сессии',
    tech: 'Python / FastAPI',
    ports: '8001',
    description: 'Управление пользователями, хэширование паролей через passlib, выпуск и верификация токенов JWT HS256 с коротким временем жизни.',
    logs: [
      'Auth Service: Проверка токена JWT для пользователя katya@neosphere.io',
      'Auth Service: Успешная генерация Access Token (срок действия: 15 минут)',
      'Auth Service: Зарегистрирован вход с нового устройства (iOS Simulator).'
    ]
  },
  {
    id: 'social',
    title: 'Social Service',
    sub: 'Ленты, Посты, Группы',
    tech: 'Node.js / Express',
    ports: '8002',
    description: 'Сервис новостной ленты, публикаций, лайков, комментариев и структуры сообществ. Обеспечивает социальные связи пользователей.',
    logs: [
      'Social Service: Сборка персональной новостной ленты (3 новых поста)',
      'Social Service: Добавление лайка к посту p2 от пользователя u1',
      'Social Service: Кэширование списка сообществ в Redis завершено.'
    ]
  },
  {
    id: 'market',
    title: 'Marketplace Service',
    sub: 'Объявления & Поиск',
    tech: 'Node.js / Express',
    ports: '8003',
    description: 'Полнотекстовый поиск, фильтрация объявлений, категоризация. Интегрирован с Elasticsearch для мгновенного поиска по тегам.',
    logs: [
      'Marketplace: Поиск объявлений по запросу "MacBook" в Москве',
      'Marketplace: Синхронизация нового объявления 5 с индексом Elasticsearch',
      'Marketplace: Выдача рекомендаций по алгоритму ИИ для Екатерины.'
    ]
  },
  {
    id: 'chat',
    title: 'Chat/WebRTC Service',
    sub: 'Реалтайм-связь',
    tech: 'Go / WebSockets & C++',
    ports: '8004 / WebRTC',
    description: 'Отказоустойчивый микросервис для мгновенного обмена сообщениями. С++ ядро обрабатывает сигнальный трафик WebRTC с ультра-низкой задержкой.',
    logs: [
      'Chat/WebRTC: Открыто WebSocket соединение для пользователя u1',
      'Chat/WebRTC: Доставлено сообщение m3 для Илья (Продавец MacBook)',
      'Chat/WebRTC [C++ Engine]: Сигнальный пакет WebRTC обработан за 0.4мс.'
    ]
  },
  {
    id: 'ai',
    title: 'AI Service',
    sub: 'Нейросети & Анализ',
    tech: 'Python / FastAPI / PyTorch',
    ports: '8005',
    description: 'Генерация описаний товаров, автоопределение категории, умная модерация контента, фильтрация спама и запрещенных тем в реальном времени.',
    logs: [
      'AI Service: Анализ заголовка "MacBook Pro M3 Pro 16”" -> Категория "Техника"',
      'AI Service: Генерация автоматического описания объявления...',
      'AI Service: Модерация успешна, запрещенных слов (скам, обман) не обнаружено.'
    ]
  },
  {
    id: 'payments',
    title: 'Payments/Escrow',
    sub: 'Безопасная сделка',
    tech: 'Node.js / TypeScript',
    ports: '8006',
    description: 'Оркестратор платежей и транзакций безопасной сделки. Замораживает деньги на транзитном счете (Escrow) до подтверждения получения.',
    logs: [
      'Escrow Service: Средства 249,990 ₽ успешно холдированы на счете сделки e1',
      'Escrow Service: Статус транзакции изменен на "ОПЛАЧЕНА" (Step 2)',
      'Escrow Service: Смарт-контракт ожидает подтверждения отправки товара.'
    ]
  },
  {
    id: 'notifications',
    title: 'Notification Service',
    sub: 'Push & Email',
    tech: 'Python / Celery',
    ports: '8007',
    description: 'Асинхронная отправка пуш-уведомлений, SMS и писем о статусах безопасной сделки и новых сообщениях в чатах.',
    logs: [
      'Notification: Отправлен Push Екатерине Смирновой: "Оплата по сделке подтверждена"',
      'Notification: Постановка задачи отправки email-уведомления Илье в Celery',
      'Notification: Очередь RabbitMQ очищена.'
    ]
  },
  {
    id: 'db',
    title: 'Databases & Storage',
    sub: 'Хранилища данных',
    tech: 'PostgreSQL, Redis, ES',
    ports: '5432, 6379, 9200',
    description: 'Гибридный слой данных: PostgreSQL как основная СУБД, Redis для кэширования сессий, Elasticsearch для поиска, Object Storage (S3) для медиа.',
    logs: [
      'PostgreSQL: Выполнено транзакционное обновление статуса сделки e1',
      'Redis: Обновлен кэш активных пользователей в сети (1.2 секунды)',
      'Elasticsearch: Проиндексировано 5 новых объявлений.'
    ]
  }
];

export default function ConceptPage() {
  // Mobile emulator states
  const [activeScreen, setActiveScreen] = useState<'home' | 'marketplace' | 'chats' | 'profile' | 'ai' | 'escrow'>('home');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Все'>('Все');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Custom interactive mock data
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [chatMsgs, setChatMsgs] = useState<ChatMessage[]>(initialChatMessages);
  const [escrowList, setEscrowList] = useState<EscrowDeal[]>(initialEscrowDeals);
  const [inputMsg, setInputMsg] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Architectural Diagram states
  const [activeNode, setActiveNode] = useState<string>('gateway');
  const [terminalLogs, setTerminalLogs] = useState<Array<{ text: string; type: 'success' | 'warn' | 'error' | 'info' }>>([
    { text: 'Система инициализирована. Ожидание сигналов...', type: 'success' },
    { text: 'Подключение к PostgreSQL, Redis, Elasticsearch и S3 выполнено успешно.', type: 'success' },
    { text: 'Микросервисы запущены. API Gateway готов к приему запросов.', type: 'info' }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Handle Architecture node click
  const handleNodeClick = (nodeId: string) => {
    setActiveNode(nodeId);
    const service = serviceNodes.find(n => n.id === nodeId);
    if (service) {
      const formattedLogs = service.logs.map(log => ({
        text: `[${service.title}] ${log}`,
        type: log.includes('Ошибка') || log.includes('Error') ? 'error' as const :
              log.includes('Предупреждение') || log.includes('Rate-Limiter') ? 'warn' as const :
              log.includes('успешно') || log.includes('OK') || log.includes('Доставлено') ? 'success' as const : 'info' as const
      }));
      setTerminalLogs(prev => [...prev, ...formattedLogs]);
    }
  };

  // Simulate network signal traffic pulsing towards the database periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNode = serviceNodes[Math.floor(Math.random() * serviceNodes.length)];
      if (randomNode.id !== 'db') {
        const randomLog = randomNode.logs[Math.floor(Math.random() * randomNode.logs.length)];
        setTerminalLogs(prev => {
          const next = [...prev, {
            text: `[ПАКЕТ] Маршрутизация от ${randomNode.title} к СУБД/Хранилищу: ${randomLog}`,
            type: 'info' as const
          }];
          if (next.length > 50) next.shift(); // keep list clean
          return next;
        });
      }
    }, 4500);
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
      text: `[Chat Service] Новое сообщение отправлено Екатериной. Обработка Go/WebSocket...`,
      type: 'success'
    }]);

    const userText = inputMsg;
    setInputMsg('');

    // Simulate response
    setTimeout(() => {
      let replyText = 'Понял вас! Я подготовлю товар к отправке.';
      if (userText.toLowerCase().includes('привет') || userText.toLowerCase().includes('здравствуйте')) {
        replyText = 'Привет! Да, ноутбук в наличии и готов к любым проверкам.';
      } else if (userText.toLowerCase().includes('скидк') || userText.toLowerCase().includes('дешев')) {
        replyText = 'Цена и так отличная для комплектации M3 Pro, но для реального покупателя сделаю небольшую скидку!';
      } else if (userText.toLowerCase().includes('безопасн') || userText.toLowerCase().includes('сделк') || userText.toLowerCase().includes('escrow')) {
        replyText = 'Отличная идея, безопасная сделка - лучший выбор. Деньги заблокируются в Escrow, пока вы не проверите Mac.';
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
        text: `[Chat Service] Доставлен автоматический ответ от Ильи. Уведомление отправлено на клиент.`,
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
          if (nextStep === 4) statusText = 'завершена';

          setTerminalLogs(logs => [...logs, {
            text: `[Payments/Escrow] Сделка e1 переведена на Шаг ${nextStep} (${statusText.toUpperCase()}).`,
            type: 'success'
          }]);

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
            text: `[Payments/Escrow] СИГНАЛ ТРЕВОГИ: По сделке e1 открыт спор (Арбитраж AI и модераторов)!`,
            type: 'error'
          }]);
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
            text: `[Payments/Escrow] Сброс сделки e1 в исходное оплаченное состояние (Шаг 2).`,
            type: 'info'
          }]);
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Brand Header */}
      <header className="main-header">
        <div className="header-inner">
          <div className="logo-container">
            <span style={{ fontSize: '1.8rem' }}>🌌</span>
            <span>NeoSphere / GLock Connect</span>
          </div>
          <div className="flex gap-3">
            <span className="glass-pill pulsing-glow" style={{ borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-purple)' }}></span>
              Demo V2.4 Active
            </span>
            <button className="ghost-btn" onClick={() => {
              setTerminalLogs(prev => [...prev, { text: 'Пользователь очистил терминал логов микросервисов.', type: 'info' }]);
              setTerminalLogs([]);
            }}>Очистить логи</button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="concept-dashboard">

        {/* Left Column: Interactive Screen Selectors & Detailed Russian Infographics */}
        <section className="controls-section flex flex-col gap-4">
          <div className="glass-panel">
            <h2 className="text-lg font-bold mb-2 text-accent">Концепт Мобильного Приложения</h2>
            <p className="text-sm text-muted mb-4">
              Супер-приложение следующего поколения (Social + Marketplace + AI), построенное на базе микросервисной архитектуры. Выберите экран ниже, чтобы протестировать симулятор приложения:
            </p>

            {/* Simulated app screen switch buttons */}
            <div className="flex flex-col gap-2">
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'home' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('home'); handleNodeClick('social'); }}
              >
                <span>🏠 1. Главная (Социальная сеть)</span>
                <span className="text-xs text-muted">Новостная лента, сообщества</span>
              </button>
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'marketplace' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('marketplace'); handleNodeClick('market'); }}
              >
                <span>🛍️ 2. Маркетплейс Объявлений</span>
                <span className="text-xs text-muted">Поиск, категории, товары</span>
              </button>
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'chats' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('chats'); handleNodeClick('chat'); }}
              >
                <span>💬 3. Чаты & Звонки WebRTC</span>
                <span className="text-xs text-muted">Реалтайм, видеовызовы p2p</span>
              </button>
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'profile' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('profile'); handleNodeClick('auth'); }}
              >
                <span>👤 4. Профиль & Настройки</span>
                <span className="text-xs text-muted">Кабинет, JWT сессия</span>
              </button>
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'ai' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('ai'); handleNodeClick('ai'); }}
              >
                <span>🤖 5. AI-помощник (Prompt)</span>
                <span className="text-xs text-muted">Генерация, модерация ИИ</span>
              </button>
              <button
                className={`ghost-btn text-left flex items-center justify-between ${activeScreen === 'escrow' ? 'active' : ''}`}
                onClick={() => { setActiveScreen('escrow'); handleNodeClick('payments'); }}
              >
                <span>🔒 6. Безопасная сделка (Escrow)</span>
                <span className="text-xs text-muted">Защита платежей, смарт-степ</span>
              </button>
            </div>
          </div>

          {/* Russian Infographics Container */}
          <div className="glass-panel">
            <h3 className="text-sm font-bold mb-3 text-cyan uppercase tracking-wider">Инфографика & Особенности концепта</h3>

            <div className="flex flex-col gap-3">
              <div className="infography-item">
                <div className="infography-title">
                  <span>🔒</span> Безопасная сделка (Escrow)
                </div>
                <div className="infography-desc">
                  Средства покупателя замораживаются на временном банковском счете микросервиса Payments до успешного получения товара. Исключает любой вид мошенничества.
                </div>
              </div>

              <div className="infography-item" style={{ borderColor: 'var(--accent-blue)' }}>
                <div className="infography-title">
                  <span>📞</span> Реалтайм WebRTC и Go WebSockets
                </div>
                <div className="infography-desc">
                  Чат работает на отказоустойчивых сокетах Go. Видеозвонки устанавливают p2p-туннели напрямую между смартфонами пользователей с задержкой менее 50мс.
                </div>
              </div>

              <div className="infography-item" style={{ borderColor: 'var(--accent-cyan)' }}>
                <div className="infography-title">
                  <span>🧠</span> ИИ-ассистент на базе PyTorch/LLM
                </div>
                <div className="infography-desc">
                  Интегрированная нейросеть автоматически определяет категорию товара по заголовку, пишет качественные рекламные описания и блокирует подозрительные скам-слова.
                </div>
              </div>

              <div className="infography-item" style={{ borderColor: 'var(--accent-purple)' }}>
                <div className="infography-title">
                  <span>💎</span> Премиальный Glassmorphism
                </div>
                <div className="infography-desc">
                  Эстетика современного минимализма: глубокие космические градиенты, полупрозрачные матовые подложки и неоновые акценты обеспечивают премиальный опыт UI/UX.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Center Column: The Smartphone Bezel Emulator with 6 Rich Screens */}
        <section className="phone-section flex justify-center">
          <div className="phone-frame">
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
                  <span>🔋 98%</span>
                </div>
              </div>

              {/* PHONE SCREEN CONTENT AREA */}
              <div className="phone-content">

                {/* 1. HOME SCREEN (SOCIAL NETWORK) */}
                {activeScreen === 'home' && (
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-4 mt-2">
                      <h3 className="text-lg font-bold text-accent">Лента новостей</h3>
                      <span className="glass-pill">Москва</span>
                    </div>

                    {/* Stories Bubble Carousel */}
                    <div className="stories-container">
                      <div className="story-bubble" onClick={() => setIsVideoCalling(true)}>
                        <div className="story-inner">🎥</div>
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
                        <div className="story-inner">🍔</div>
                      </div>
                    </div>

                    <p className="text-xs text-muted mb-2 font-semibold">РЕКОМЕНДУЕМЫЕ СООБЩЕСТВА</p>
                    {communities.map((comm) => (
                      <div key={comm.id} className="phone-card flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <span style={{ fontSize: '1.4rem' }}>{comm.image}</span>
                          <div>
                            <p className="text-xs font-bold">{comm.name}</p>
                            <p className="text-xs text-muted" style={{ fontSize: '9px' }}>{comm.members.toLocaleString('ru-RU')} участников</p>
                          </div>
                        </div>
                        <button className="glass-pill" style={{ background: 'rgba(139, 92, 246, 0.2)' }} onClick={() => {
                          setTerminalLogs(prev => [...prev, {
                            text: `[Social Service] Пользователь вступил в сообщество "${comm.name}".`,
                            type: 'success'
                          }]);
                        }}>Вступить</button>
                      </div>
                    ))}

                    <p className="text-xs text-muted mb-2 mt-2 font-semibold">ПОПУЛЯРНЫЕ ПУБЛИКАЦИИ</p>
                    {socialPosts.map((post) => (
                      <div key={post.id} className="phone-card">
                        <div className="flex gap-2 items-center mb-2">
                          <span style={{ fontSize: '1.2rem' }}>{post.avatar}</span>
                          <div>
                            <p className="text-xs font-bold">{post.author}</p>
                            <p className="text-muted" style={{ fontSize: '8px' }}>{post.time}</p>
                          </div>
                        </div>
                        <p className="text-xs mb-2" style={{ lineHeight: '1.3' }}>{post.content}</p>
                        {post.image && (
                          <div style={{ borderRadius: '10px', overflow: 'hidden', height: '100px', marginBottom: '8px' }}>
                            <img src={post.image} alt="post media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div className="flex justify-between text-muted" style={{ fontSize: '10px' }}>
                          <span style={{ cursor: 'pointer' }} onClick={() => {
                            setTerminalLogs(prev => [...prev, { text: `[Social Service] Поставлен лайк на публикацию ${post.id}`, type: 'success' }]);
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
                      <h3 className="text-lg font-bold text-cyan">Маркетплейс</h3>
                      <button className="glass-pill" onClick={() => setShowMap(!showMap)}>
                        {showMap ? '🗺️ Скрыть карту' : '🗺️ Показать карту'}
                      </button>
                    </div>

                    {/* Filter Inputs */}
                    <div className="flex flex-col gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Поиск товаров..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontSize: '12px', padding: '6px 10px' }}
                      />
                      <div className="grid-2">
                        <input
                          type="text"
                          placeholder="Город..."
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontSize: '11px', padding: '5px' }}
                        />
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value as Category | 'Все')}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontSize: '11px', padding: '5px' }}
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
                      <div className="phone-card text-center" style={{ height: '180px', background: 'radial-gradient(circle, #1e1b4b 0%, #0c101f 100%)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ position: 'absolute', width: '200%', height: '200%', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '50%', top: '-50%', left: '-50%' }}></div>
                        <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px #06b6d4)' }}>📍</span>
                        <p className="text-xs font-bold mt-2 text-cyan">Интерактивная Карта</p>
                        <p className="text-muted" style={{ fontSize: '9px' }}>В радиусе 5 км найдено {filteredListings.length} предложений</p>
                        <div className="flex gap-2 mt-2">
                          <span className="glass-pill" style={{ fontSize: '8px' }}>Tesla - 4.29 млн ₽</span>
                          <span className="glass-pill" style={{ fontSize: '8px' }}>MacBook - 249k ₽</span>
                        </div>
                      </div>
                    ) : null}

                    {/* Listings */}
                    <p className="text-xs text-muted mb-2 font-semibold">ОБЪЯВЛЕНИЯ ({filteredListings.length})</p>
                    {filteredListings.length === 0 ? (
                      <p className="text-xs text-muted text-center py-4">Ничего не найдено по фильтрам</p>
                    ) : (
                      filteredListings.map((listing) => (
                        <div key={listing.id} className="phone-card">
                          <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '110px', marginBottom: '8px' }}>
                            <img src={listing.image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div className="glass-pill" style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(10, 15, 30, 0.85)' }}>
                              ⚡ AI Оценка: {listing.aiScore}%
                            </div>
                            <span className="glass-pill" style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(139, 92, 246, 0.9)' }}>
                              {listing.category}
                            </span>
                          </div>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-bold" style={{ maxWidth: '70%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.title}</h4>
                            <span className="text-xs font-bold text-accent" style={{ whiteSpace: 'nowrap' }}>{listing.price.toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <p className="text-muted mb-2" style={{ fontSize: '9px', lineHeight: '1.2' }}>{listing.description}</p>
                          <div className="flex justify-between items-center" style={{ fontSize: '9px' }}>
                            <span>📍 {listing.city} · {listing.seller}</span>
                            <button className="glass-pill" style={{ padding: '2px 8px', fontSize: '9px' }} onClick={() => {
                              setActiveScreen('chats');
                              handleNodeClick('chat');
                              setTerminalLogs(prev => [...prev, {
                                text: `[Marketplace] Инициализирован чат с продавцом ${listing.seller} по товару "${listing.title}".`,
                                type: 'success'
                              }]);
                            }}>Чат</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. CHATS SCREEN */}
                {activeScreen === 'chats' && (
                  <div className="flex flex-col h-full" style={{ minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex justify-between items-center mb-2 mt-2">
                      <h3 className="text-lg font-bold text-blue">Диалоги</h3>
                      <button className="glass-pill pulsing-glow" style={{ borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }} onClick={() => setIsVideoCalling(true)}>
                        📞 Видеовызов
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
                              background: msg.sender === 'user' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(255, 255, 255, 0.05)',
                              border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '12px',
                              padding: '8px 12px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                          >
                            <p className="text-muted mb-1" style={{ fontSize: '8px', fontWeight: 'bold', color: msg.sender === 'user' ? '#93c5fd' : 'var(--accent-cyan)' }}>
                              {msg.senderName}
                            </p>
                            <p className="text-xs" style={{ color: '#fff', lineHeight: '1.3' }}>{msg.text}</p>
                            <p className="text-right text-muted" style={{ fontSize: '7px', marginTop: '2px' }}>{msg.time}</p>
                          </div>
                        ))}
                      </div>

                      {/* Msg Input Area */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ваше сообщение..."
                          value={inputMsg}
                          onChange={(e) => setInputMsg(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontSize: '11px', padding: '6px 10px' }}
                        />
                        <button className="glow-btn" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '10px' }} onClick={handleSendMessage}>
                          🚀
                        </button>
                      </div>
                    </div>

                    {/* Video Call Dialog Overlay inside Simulator */}
                    {isVideoCalling && (
                      <div className="videocall-overlay">
                        <h4 className="text-sm font-bold text-center mb-2 text-cyan">WebRTC Video Connection</h4>
                        <div className="video-stream-box">
                          {/* Main stream - seller */}
                          <div className="text-center">
                            <span style={{ fontSize: '3rem', display: 'block' }}>👨‍💻</span>
                            <p className="text-xs font-semibold text-white mt-1">Илья (MacBook)</p>
                            <p className="text-muted" style={{ fontSize: '9px' }}>Трансляция 1080p · 60fps</p>
                          </div>

                          {/* Small stream - current user */}
                          <div className="small-stream-box flex items-center justify-center">
                            <span style={{ fontSize: '1.5rem' }}>👩‍🎨</span>
                          </div>
                        </div>

                        {/* Connection statistics banner */}
                        <div className="glass-panel mt-2" style={{ padding: '6px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)' }}>
                          <p className="text-cyan font-bold" style={{ fontSize: '8px' }}>СТАТИСТИКА WebRTC (P2P):</p>
                          <p className="text-muted" style={{ fontSize: '7px' }}>Задержка: 14мс · Потеря пакетов: 0.0% · Кодек: VP9 / Opus</p>
                        </div>

                        {/* Buttons control bar */}
                        <div className="video-control-bar">
                          <button className="video-control-btn" onClick={() => {
                            setTerminalLogs(prev => [...prev, { text: '[WebRTC] Микрофон отключен пользователем', type: 'warn' }]);
                          }}>🎙️</button>
                          <button className="video-control-btn hangup" onClick={() => {
                            setIsVideoCalling(false);
                            setTerminalLogs(prev => [...prev, { text: '[WebRTC Connection] Видеовызов успешно завершен. Сессия закрыта.', type: 'info' }]);
                          }}>
                            ❌
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. PROFILE SCREEN */}
                {activeScreen === 'profile' && (
                  <div className="flex flex-col">
                    <div className="text-center mt-4 mb-4">
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>👩‍🎨</span>
                      </div>
                      <h3 className="text-sm font-bold">{demoProfile.name}</h3>
                      <p className="text-muted" style={{ fontSize: '9px' }}>{demoProfile.email}</p>
                      <div className="flex justify-center gap-2 mt-2">
                        <span className="glass-pill" style={{ color: '#facc15' }}>⭐ {demoProfile.sellerRating} Рейтинг</span>
                        <span className="glass-pill">📍 {demoProfile.city}</span>
                      </div>
                    </div>

                    <div className="grid-2 mb-4">
                      <div className="phone-card text-center">
                        <p className="text-lg font-bold text-accent">{demoProfile.listingsCount}</p>
                        <p className="text-muted" style={{ fontSize: '9px' }}>Объявлений</p>
                      </div>
                      <div className="phone-card text-center">
                        <p className="text-lg font-bold text-cyan">{demoProfile.favoritesCount}</p>
                        <p className="text-muted" style={{ fontSize: '9px' }}>В избранном</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted mb-2 font-semibold">УПРАВЛЕНИЕ АККАУНТОМ</p>
                    <div className="flex flex-col gap-1">
                      <div className="phone-card flex justify-between items-center" style={{ padding: '8px' }}>
                        <span style={{ fontSize: '11px' }}>🔒 Безопасность и пароли</span>
                        <span>➡️</span>
                      </div>
                      <div className="phone-card flex justify-between items-center" style={{ padding: '8px' }}>
                        <span style={{ fontSize: '11px' }}>💳 Платежные карты (Escrow)</span>
                        <span>➡️</span>
                      </div>
                      <div className="phone-card flex justify-between items-center" style={{ padding: '8px' }}>
                        <span style={{ fontSize: '11px' }}>🔔 Настройки пуш-уведомлений</span>
                        <span>➡️</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. AI ASSISTANT SCREEN */}
                {activeScreen === 'ai' && (
                  <div className="flex flex-col">
                    <div className="text-center mt-2 mb-4">
                      <div className="ai-glow-ring">
                        <span style={{ fontSize: '2.2rem' }}>🤖</span>
                      </div>
                      <h3 className="text-sm font-bold text-accent">AI-Ассистент NeoSphere</h3>
                      <p className="text-muted" style={{ fontSize: '9px' }}>Модерация, генерация описаний и рекомендации на лету</p>
                    </div>

                    <div className="phone-card">
                      <p className="text-xs font-bold mb-1 text-cyan">Черновик заголовка товара:</p>
                      <input
                        type="text"
                        placeholder="Например: Tesla Model 3 2023 скам"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontSize: '11px', padding: '6px 10px', marginBottom: '8px' }}
                      />

                      <div className="flex flex-col gap-2" style={{ fontSize: '10px' }}>
                        <div>
                          <span className="text-muted">Рекомендуемая категория:</span>{' '}
                          <strong className="text-cyan">{currentAiCategory}</strong>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                          <span className="text-muted">AI-Модерация:</span>{' '}
                          <span className={currentAiModeration.approved ? 'success' : 'danger'} style={{ fontWeight: 'bold' }}>
                            {currentAiModeration.approved ? 'Разрешено ✅' : 'Блокировка ❌'}
                          </span>
                          <p className="text-muted" style={{ fontSize: '9px' }}>{currentAiModeration.reason}</p>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                          <span className="text-muted">Генеративный текст объявления:</span>
                          <p className="text-white bg-slate-900 p-2 rounded mt-1" style={{ fontSize: '9px', lineHeight: '1.3', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {currentAiDescription}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted mb-2 font-semibold">БЫСТРЫЕ ШАБЛОНЫ AI</p>
                    <div className="flex flex-col gap-1">
                      <button className="ghost-btn text-left text-xs" style={{ padding: '6px 10px' }} onClick={() => {
                        setAiPrompt('Sony PlayStation 5 Slim 1TB');
                        handleNodeClick('ai');
                      }}>
                        🎮 Sony PlayStation 5
                      </button>
                      <button className="ghost-btn text-left text-xs" style={{ padding: '6px 10px' }} onClick={() => {
                        setAiPrompt('Продам схему обмана легкие деньги скам');
                        handleNodeClick('ai');
                      }}>
                        ⚠️ Подозрительное объявление (Скам)
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. ESCROW SCREEN (SECURE DEAL) */}
                {activeScreen === 'escrow' && (
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-3 mt-2">
                      <h3 className="text-lg font-bold text-accent">Безопасные Сделки</h3>
                      <button className="glass-pill" onClick={restartEscrowDeal}>Сбросить</button>
                    </div>

                    {escrowList.map((deal) => (
                      <div key={deal.id} className="phone-card">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold" style={{ color: 'var(--accent-cyan)' }}>Сделка #{deal.id}</span>
                          <span className={`glass-pill ${deal.status === 'завершена' ? 'success' : deal.status === 'спор' ? 'danger' : 'pulsing-glow'}`} style={{
                            background: deal.status === 'завершена' ? 'rgba(74, 222, 128, 0.15)' : deal.status === 'спор' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                            borderColor: deal.status === 'завершена' ? '#4ade80' : deal.status === 'спор' ? '#ef4444' : 'var(--accent-purple)',
                            color: deal.status === 'завершена' ? '#4ade80' : deal.status === 'спор' ? '#ef4444' : 'var(--accent-purple)'
                          }}>
                            {deal.status.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold mb-1">{deal.title}</h4>
                        <p className="text-xs font-bold text-accent mb-3">{deal.price.toLocaleString('ru-RU')} ₽</p>

                        {/* Escrow Progress Stepper */}
                        <div className="escrow-steps">
                          <div className={`escrow-step ${deal.step >= 1 ? 'done' : ''}`} title="Создана">1</div>
                          <div className={`escrow-step ${deal.step >= 2 ? (deal.step === 2 ? 'active' : 'done') : ''}`} title="Оплачена в Escrow">2</div>
                          <div className={`escrow-step ${deal.step >= 3 ? (deal.step === 3 ? 'active' : 'done') : ''}`} title="Отправлена продавцом">3</div>
                          <div className={`escrow-step ${deal.step >= 4 ? 'active' : ''}`} title="Выполнена">4</div>
                        </div>

                        <div className="flex justify-between text-muted mb-4" style={{ fontSize: '8px' }}>
                          <span>1. Создана</span>
                          <span>2. Заморожена</span>
                          <span>3. В пути</span>
                          <span>4. Выдана</span>
                        </div>

                        <div className="text-muted mb-4" style={{ fontSize: '9px', lineHeight: '1.3' }}>
                          <p><strong>Покупатель:</strong> {deal.buyer}</p>
                          <p><strong>Продавец:</strong> {deal.seller}</p>
                          <p className="mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                            {deal.status === 'оплачена' && '🔒 Средства успешно заморожены в Escrow. Продавец упаковывает товар.'}
                            {deal.status === 'отправлена' && '📦 Товар передан курьерской службе. Ожидайте доставки.'}
                            {deal.status === 'завершена' && '🎉 Сделка успешно закрыта! Деньги отправлены продавцу.'}
                            {deal.status === 'спор' && '⚠️ Открыт спор. Арбитражная служба GLock Connect изучает переписку.'}
                          </p>
                        </div>

                        {/* Action buttons based on status */}
                        <div className="flex flex-col gap-2">
                          {deal.step === 2 && (
                            <button className="phone-btn-neon" onClick={advanceEscrowStep}>
                              📦 Подтвердить отправку товара
                            </button>
                          )}
                          {deal.step === 3 && (
                            <button className="phone-btn-neon" style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }} onClick={advanceEscrowStep}>
                              ✅ Подтвердить получение товара
                            </button>
                          )}
                          {deal.status !== 'завершена' && deal.status !== 'спор' && (
                            <button className="ghost-btn text-xs text-center" style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }} onClick={triggerEscrowDispute}>
                              ⚠️ Открыть спор / Арбитраж
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Home Indicator bar */}
              <div className="phone-home-bar"></div>

              {/* Bottom Navigation Bar */}
              <nav className="phone-bottom-nav">
                <button
                  className={`phone-nav-item ${activeScreen === 'home' ? 'active' : ''}`}
                  onClick={() => { setActiveScreen('home'); handleNodeClick('social'); }}
                >
                  <span className="phone-nav-icon">🏠</span>
                  <span>Главная</span>
                </button>
                <button
                  className={`phone-nav-item ${activeScreen === 'marketplace' ? 'active' : ''}`}
                  onClick={() => { setActiveScreen('marketplace'); handleNodeClick('market'); }}
                >
                  <span className="phone-nav-icon">🛍️</span>
                  <span>Маркет</span>
                </button>
                <button
                  className={`phone-nav-item ${activeScreen === 'chats' ? 'active' : ''}`}
                  onClick={() => { setActiveScreen('chats'); handleNodeClick('chat'); }}
                >
                  <span className="phone-nav-icon">💬</span>
                  <span>Чаты</span>
                </button>
                <button
                  className={`phone-nav-item ${activeScreen === 'ai' ? 'active' : ''}`}
                  onClick={() => { setActiveScreen('ai'); handleNodeClick('ai'); }}
                >
                  <span className="phone-nav-icon">🤖</span>
                  <span>AI</span>
                </button>
                <button
                  className={`phone-nav-item ${activeScreen === 'escrow' ? 'active' : ''}`}
                  onClick={() => { setActiveScreen('escrow'); handleNodeClick('payments'); }}
                >
                  <span className="phone-nav-icon">🔒</span>
                  <span>Сделки</span>
                </button>
              </nav>

            </div>
          </div>
        </section>

        {/* Right Column: Architectural Flowchart Diagram & Microservice details with Live Logs Monitor */}
        <section className="arch-section flex flex-col gap-4">
          <div className="glass-panel">
            <h2 className="text-lg font-bold mb-2 text-cyan">Архитектурная схема системы</h2>
            <p className="text-sm text-muted mb-4">
              Интерактивная диаграмма микросервисов. Кликните по любому элементу схемы для симуляции трафика, анализа архитектуры и вывода логов:
            </p>

            {/* Interactive Flowchart Diagram SVG */}
            <div className="arch-svg-container">
              <svg viewBox="0 0 450 500" className="w-full h-full">

                {/* Background decorative grids */}
                <defs>
                  <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.03)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />

                {/* FLOW CONNECTIONS (LINKS) */}
                {/* Client to Gateway */}
                <path d="M 225 60 L 225 110" className={`arch-link ${(activeNode === 'client' || activeNode === 'gateway') ? 'active' : ''}`} />
                {/* Gateway to Auth */}
                <path d="M 225 145 L 75 180" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'auth') ? 'active' : ''}`} />
                {/* Gateway to Social */}
                <path d="M 225 145 L 140 230" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'social') ? 'active' : ''}`} />
                {/* Gateway to Market */}
                <path d="M 225 145 L 225 230" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'market') ? 'active' : ''}`} />
                {/* Gateway to Chat */}
                <path d="M 225 145 L 310 230" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'chat') ? 'active' : ''}`} />
                {/* Gateway to Payments */}
                <path d="M 225 145 L 375 180" className={`arch-link ${(activeNode === 'gateway' || activeNode === 'payments') ? 'active' : ''}`} />

                {/* Internal Service connections */}
                {/* Market to AI */}
                <path d="M 225 270 L 160 330" className={`arch-link ${(activeNode === 'market' || activeNode === 'ai') ? 'active' : ''}`} />
                {/* Chat to AI */}
                <path d="M 310 270 L 160 330" className={`arch-link ${(activeNode === 'chat' || activeNode === 'ai') ? 'active' : ''}`} />
                {/* Payments to Notifications */}
                <path d="M 375 220 L 310 330" className={`arch-link ${(activeNode === 'payments' || activeNode === 'notifications') ? 'active' : ''}`} />

                {/* Databases Connections */}
                <path d="M 75 220 L 225 410" className="arch-link" />
                <path d="M 140 270 L 225 410" className="arch-link" />
                <path d="M 225 270 L 225 410" className="arch-link" />
                <path d="M 310 270 L 225 410" className="arch-link" />
                <path d="M 375 220 L 225 410" className="arch-link" />
                <path d="M 160 370 L 225 410" className="arch-link" />
                <path d="M 310 370 L 225 410" className="arch-link" />

                {/* Pulsing traffic signal points (flowing down) */}
                <circle cx="225" cy="85" r="4" className="signal-dot pulsing-glow">
                  <animate attributeName="cy" values="60;110" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="150" cy="162" r="3" className="signal-dot pulsing-glow" style={{ fill: 'var(--accent-purple)' }}>
                  <animate attributeName="cx" values="225;75" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="145;180" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="225" cy="187" r="3" className="signal-dot pulsing-glow">
                  <animate attributeName="cy" values="145;230" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="300" cy="162" r="3" className="signal-dot pulsing-glow" style={{ fill: 'var(--accent-blue)' }}>
                  <animate attributeName="cx" values="225;375" dur="2.3s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="145;180" dur="2.3s" repeatCount="indefinite" />
                </circle>

                {/* NODES */}
                {/* 1. Mobile Apps */}
                <g className={`arch-node ${activeNode === 'client' ? 'active' : ''}`} onClick={() => handleNodeClick('client')}>
                  <rect x="150" y="15" width="150" height="45" />
                  <text x="225" y="33" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle" className="node-title">Mobile Apps (Android/iOS)</text>
                  <text x="225" y="44" fill="var(--accent-cyan)" fontSize="8" textAnchor="middle">Frontend (Flutter)</text>
                </g>

                {/* 2. API Gateway */}
                <g className={`arch-node ${activeNode === 'gateway' ? 'active' : ''}`} onClick={() => handleNodeClick('gateway')}>
                  <rect x="150" y="100" width="150" height="45" />
                  <text x="225" y="118" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle" className="node-title">API Gateway</text>
                  <text x="225" y="129" fill="var(--accent-purple)" fontSize="8" textAnchor="middle">Nginx / SSL / RateLimit</text>
                </g>

                {/* 3. Auth Service */}
                <g className={`arch-node ${activeNode === 'auth' ? 'active' : ''}`} onClick={() => handleNodeClick('auth')}>
                  <rect x="15" y="175" width="120" height="45" />
                  <text x="75" y="193" fill="#fff" fontSize="10" textAnchor="middle" className="node-title">Auth Service</text>
                  <text x="75" y="204" fill="var(--muted)" fontSize="8" textAnchor="middle">FastAPI (Python)</text>
                </g>

                {/* 4. Social Service */}
                <g className={`arch-node ${activeNode === 'social' ? 'active' : ''}`} onClick={() => handleNodeClick('social')}>
                  <rect x="80" y="230" width="120" height="40" />
                  <text x="140" y="246" fill="#fff" fontSize="10" textAnchor="middle" className="node-title">Social Service</text>
                  <text x="140" y="256" fill="var(--muted)" fontSize="8" textAnchor="middle">Express (Node.js)</text>
                </g>

                {/* 5. Marketplace Service */}
                <g className={`arch-node ${activeNode === 'market' ? 'active' : ''}`} onClick={() => handleNodeClick('market')}>
                  <rect x="165" y="285" width="120" height="40" />
                  <text x="225" y="301" fill="#fff" fontSize="10" textAnchor="middle" className="node-title">Marketplace Serv.</text>
                  <text x="225" y="311" fill="var(--muted)" fontSize="8" textAnchor="middle">Express (Node.js)</text>
                </g>

                {/* 6. Chat / WebRTC */}
                <g className={`arch-node ${activeNode === 'chat' ? 'active' : ''}`} onClick={() => handleNodeClick('chat')}>
                  <rect x="250" y="230" width="120" height="40" />
                  <text x="310" y="246" fill="#fff" fontSize="10" textAnchor="middle" className="node-title">Chat / WebRTC</text>
                  <text x="310" y="256" fill="var(--muted)" fontSize="8" textAnchor="middle">Go & C++ Engine</text>
                </g>

                {/* 7. Payments & Escrow */}
                <g className={`arch-node ${activeNode === 'payments' ? 'active' : ''}`} onClick={() => handleNodeClick('payments')}>
                  <rect x="315" y="175" width="120" height="45" />
                  <text x="375" y="193" fill="#fff" fontSize="10" textAnchor="middle" className="node-title">Payments/Escrow</text>
                  <text x="375" y="204" fill="var(--muted)" fontSize="8" textAnchor="middle">TypeScript (SFC)</text>
                </g>

                {/* 8. AI Service */}
                <g className={`arch-node ${activeNode === 'ai' ? 'active' : ''}`} onClick={() => handleNodeClick('ai')}>
                  <rect x="100" y="330" width="120" height="40" />
                  <text x="160" y="346" fill="#fff" fontSize="10" textAnchor="middle" className="node-title">AI Service</text>
                  <text x="160" y="356" fill="var(--accent-purple)" fontSize="8" textAnchor="middle">FastAPI (Python)</text>
                </g>

                {/* 9. Notification Service */}
                <g className={`arch-node ${activeNode === 'notifications' ? 'active' : ''}`} onClick={() => handleNodeClick('notifications')}>
                  <rect x="250" y="330" width="120" height="40" />
                  <text x="310" y="346" fill="#fff" fontSize="10" textAnchor="middle" className="node-title">Notification Serv.</text>
                  <text x="310" y="356" fill="var(--muted)" fontSize="8" textAnchor="middle">Celery & RabbitMQ</text>
                </g>

                {/* 10. Databases Layer */}
                <g className={`arch-node ${activeNode === 'db' ? 'active' : ''}`} onClick={() => handleNodeClick('db')}>
                  <rect x="125" y="410" width="200" height="50" style={{ rx: '14px' }} />
                  <text x="225" y="430" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle" className="node-title">PostgreSQL, Redis, ES</text>
                  <text x="225" y="442" fill="var(--accent-cyan)" fontSize="8" textAnchor="middle">Хранение данных & Реалтайм Кэширование</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Active Microservice Tech Spec */}
          <div className="glass-panel">
            {serviceNodes.map((service) => (
              service.id === activeNode ? (
                <div key={service.id} className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-accent uppercase tracking-wider">{service.title}</h3>
                    <span className="glass-pill">Порт: {service.ports}</span>
                  </div>
                  <p className="text-xs font-bold text-cyan mb-2">Стек: {service.tech}</p>
                  <p className="text-xs text-muted mb-4" style={{ lineHeight: '1.4' }}>{service.description}</p>
                </div>
              ) : null
            ))}
          </div>

          {/* Microservice Live Logs Terminal Monitor */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Монитор логов микросервисов (Симуляция в реальном времени)</h3>
            <div className="terminal-monitor">
              <div className="terminal-header">
                <span>TERMINAL MONITOR v2.4</span>
                <span>ONLINE</span>
              </div>
              {terminalLogs.map((log, index) => (
                <div key={index} className={`terminal-line ${log.type}`}>
                  &gt; {log.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </section>

      </main>

      {/* Footer Branding */}
      <footer className="glass-panel" style={{ margin: '1.5rem', marginTop: 'auto', textAlign: 'center', padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <p className="text-xs text-muted">
          Разработчик: <strong>Mikola199</strong> · Концепт-макет спроектирован с использованием Next.js 14, Web Audio API, WebRTC, Tailwind-ready CSS Variables и адаптивного UI/UX. 2026.
        </p>
      </footer>
    </div>
  );
}
