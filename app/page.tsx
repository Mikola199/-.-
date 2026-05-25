'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { aiGenerateDescription, aiModerateListing, aiRecommend, aiSuggestCategory } from '@/lib/ai';
import { demoProfile, listings } from '@/lib/mockData';
import { Category } from '@/lib/types';

const categories: Array<Category | 'Все'> = ['Все', 'Авто', 'Недвижимость', 'Техника', 'Услуги', 'Хобби'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Все'>('Все');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [titleDraft, setTitleDraft] = useState('');

  const filtered = useMemo(() => {
    return listings.filter((item) => {
      const queryMatch = item.title.toLowerCase().includes(query.toLowerCase());
      const cityMatch = city ? item.city.toLowerCase().includes(city.toLowerCase()) : true;
      const categoryMatch = selectedCategory === 'Все' || item.category === selectedCategory;
      const priceMatch = maxPrice ? item.price <= Number(maxPrice) : true;
      return queryMatch && cityMatch && categoryMatch && priceMatch;
    });
  }, [query, city, selectedCategory, maxPrice]);

  const recommendations = useMemo(() => aiRecommend(listings, demoProfile.city, ['Авто', 'Техника']), []);
  const aiCategory = titleDraft ? aiSuggestCategory(titleDraft) : '—';
  const generatedDescription = titleDraft ? aiGenerateDescription(titleDraft) : 'Введите заголовок';
  const moderation = aiModerateListing(titleDraft);

  return (
    <main className="container">
      <Header />

      <section className="hero">
        <div>
          <p className="eyebrow">Современная платформа объявлений</p>
          <h1>Аврора: покупайте и продавайте быстрее с AI-помощником</h1>
          <p>
            Современный дизайн, удобные фильтры, личный кабинет, сообщения, избранное и умные рекомендации,
            которые повышают конверсию объявлений.
          </p>
          <div className="hero-cta">
            <button type="button">Разместить объявление</button>
            <button type="button" className="ghost-button">
              Открыть сообщения
            </button>
          </div>
        </div>
        <div className="hero-stats aurora-bg">
          <h3>Почему Аврора</h3>
          <ul>
            <li>⚡ SSR + оптимизация для быстрой загрузки и SEO</li>
            <li>🔐 JWT-ready архитектура API</li>
            <li>🤖 AI-модерация, рекомендации и автокатегоризация</li>
            <li>📱 Адаптивный интерфейс под все устройства</li>
          </ul>
        </div>
      </section>

      <section id="catalog" className="panel">
        <h2>Каталог объявлений</h2>
        <div className="filters">
          <input placeholder="Поиск" value={query} onChange={(event) => setQuery(event.target.value)} />
          <input placeholder="Город" value={city} onChange={(event) => setCity(event.target.value)} />
          <input
            placeholder="Цена до"
            type="number"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value as Category | 'Все')}>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="grid">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onFavorite={(id) => setFavorites((current) => [...new Set([...current, id])])}
            />
          ))}
        </div>
      </section>

      <section id="features" className="split">
        <div className="panel">
          <h2>AI-инструменты для продавца</h2>
          <label>
            Черновик заголовка
            <input
              placeholder="Например: iPhone 15 Pro 256GB"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
            />
          </label>
          <p>
            Определенная категория: <strong>{aiCategory}</strong>
          </p>
          <p>{generatedDescription}</p>
          <p className={moderation.approved ? 'success' : 'danger'}>{moderation.reason}</p>
        </div>

        <div className="panel">
          <h2>AI-рекомендации</h2>
          <ul className="recommendations">
            {recommendations.map((item) => (
              <li key={item.id}>
                <span>{item.title}</span>
                <strong>{item.price.toLocaleString('ru-RU')} ₽</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="dashboard" className="panel">
        <h2>Личный кабинет</h2>
        <div className="dashboard">
          <div>
            <h3>{demoProfile.name}</h3>
            <p>{demoProfile.email}</p>
            <p>Город: {demoProfile.city}</p>
          </div>
          <div>
            <p>Активных объявлений: {demoProfile.listingsCount}</p>
            <p>Избранных: {favorites.length || demoProfile.favoritesCount}</p>
            <p>Рейтинг продавца: ⭐ {demoProfile.sellerRating}</p>
          </div>
          <div>
            <h4>Сообщения и уведомления</h4>
            <p>Новых сообщений: 3</p>
            <p>Уведомлений: 5</p>
          </div>
        </div>
      </section>
    </main>
  );
}
