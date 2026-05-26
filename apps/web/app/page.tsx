'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { Messenger } from '@/components/Messenger';
import { aiGenerateDescription, aiModerateListing, aiRecommend, aiSuggestCategory } from '@/lib/ai';
import { demoProfile, listings } from '@/lib/mockData';
import { Category, Job } from '@/lib/types';

const categories: Array<Category | 'Все'> = ['Все', 'Авто', 'Недвижимость', 'Техника', 'Услуги', 'Хобби'];

const mockJobs: Job[] = [
  { id: 'j1', title: 'Senior Frontend Developer', company: 'TechCorp', salary: '300 000 ₽', location: 'Москва', type: 'vacancy' },
  { id: 'j2', title: 'Product Designer', company: 'DesignStudio', salary: '200 000 ₽', location: 'Удаленно', type: 'vacancy' }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'market' | 'jobs' | 'chat'>('market');
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
          <p className="eyebrow">NeoSuperApp — Экосистема будущего</p>
          <h1>Telegram + Avito + WhatsApp в одном приложении</h1>
          <p>
            Общайтесь, ищите работу, покупайте товары и используйте мощь AI в единой платформе
            с enterprise-grade архитектурой.
          </p>
          <div className="hero-cta">
            <button type="button" onClick={() => setActiveTab('market')}>Маркетплейс</button>
            <button type="button" className="ghost-button" onClick={() => setActiveTab('chat')}>
              Мессенджер
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <h3>SuperApp Ecosystem</h3>
          <nav className="superapp-nav">
            <button className={activeTab === 'market' ? 'active' : 'ghost-button'} onClick={() => setActiveTab('market')}>Объявления</button>
            <button className={activeTab === 'jobs' ? 'active' : 'ghost-button'} onClick={() => setActiveTab('jobs')}>Работа</button>
            <button className={activeTab === 'chat' ? 'active' : 'ghost-button'} onClick={() => setActiveTab('chat')}>Чат</button>
          </nav>
        </div>
      </section>

      {activeTab === 'market' && (
        <>
          <section id="catalog" className="panel">
            <h2>Маркетплейс</h2>
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
        </>
      )}

      {activeTab === 'jobs' && (
        <section id="jobs" className="panel">
          <h2>Вакансии и работа</h2>
          <div className="grid">
            {mockJobs.map(job => (
              <div key={job.id} className="card panel">
                <h3>{job.title}</h3>
                <p className="eyebrow">{job.company}</p>
                <p>{job.location} • {job.salary}</p>
                <button style={{marginTop: '1rem', width: '100%'}}>Откликнуться</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'chat' && (
        <section id="messenger" className="panel">
          <h2>Мессенджер</h2>
          <Messenger />
        </section>
      )}

      <section id="dashboard" className="panel">
        <h2>Профиль NeoID</h2>
        <div className="dashboard">
          <div>
            <h3>{demoProfile.name}</h3>
            <p>{demoProfile.email}</p>
            <p>Город: {demoProfile.city}</p>
          </div>
          <div>
            <p>Объявлений: {demoProfile.listingsCount}</p>
            <p>Избранных: {favorites.length || demoProfile.favoritesCount}</p>
            <p>Рейтинг: ⭐ {demoProfile.sellerRating}</p>
          </div>
          <div>
            <h4>Статус системы</h4>
            <p>API Gateway: <span className="success">Online</span></p>
            <p>Realtime: <span className="success">Connected</span></p>
          </div>
        </div>
      </section>
    </main>
  );
}
