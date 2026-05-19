'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { aiGenerateDescription, aiModerateListing, aiRecommend, aiSuggestCategory } from '@/lib/ai';
import { demoProfile, listings } from '@/lib/mockData';
import { Category } from '@/lib/types';

const categories: Array<Category | 'Все'> = ['Все', 'IT', 'Продажи', 'Маркетинг', 'Медицина', 'Дизайн', 'Строительство'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Все'>('Все');
  const [selectedType, setSelectedType] = useState<'all' | 'vacancy' | 'resume'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [titleDraft, setTitleDraft] = useState('');

  const filtered = useMemo(() => {
    return listings.filter((item) => {
      const queryMatch = item.title.toLowerCase().includes(query.toLowerCase());
      const cityMatch = city ? item.city.toLowerCase().includes(city.toLowerCase()) : true;
      const categoryMatch = selectedCategory === 'Все' || item.category === selectedCategory;
      const priceMatch = maxPrice ? item.price <= Number(maxPrice) : true;
      const typeMatch = selectedType === 'all' || item.type === selectedType;
      return queryMatch && cityMatch && categoryMatch && priceMatch && typeMatch;
    });
  }, [query, city, selectedCategory, maxPrice, selectedType]);

  const recommendations = useMemo(() => aiRecommend(listings, demoProfile.city, ['IT', 'Дизайн']), []);
  const aiCategory = titleDraft ? aiSuggestCategory(titleDraft) : '—';
  const generatedDescription = titleDraft ? aiGenerateDescription(titleDraft) : 'Введите название должности';
  const moderation = aiModerateListing(titleDraft);

  return (
    <main className="container">
      <Header />

      <section className="hero">
        <div>
          <p className="eyebrow">Кадровое агентство нового поколения</p>
          <h1>Найдите работу мечты или идеального сотрудника с AI</h1>
          <p>
            NeoJob использует искусственный интеллект для быстрого поиска работы и подбора персонала.
            Умные рекомендации, авто-генерация описаний и мгновенная модерация.
          </p>
          <div className="hero-cta">
            <button type="button">Опубликовать вакансию</button>
            <button type="button" className="ghost-button">
              Разместить резюме
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <h3>Преимущества NeoJob</h3>
          <ul>
            <li>⚡ Быстрый отклик и связь с работодателем</li>
            <li>🔐 Безопасность и проверка компаний</li>
            <li>🤖 AI-подбор подходящих вакансий</li>
            <li>📱 Удобный поиск по городам и категориям</li>
          </ul>
        </div>
      </section>

      <section id="catalog" className="panel">
        <h2>Поиск вакансий и кандидатов</h2>
        <div className="filters">
          <input placeholder="Должность или навык" value={query} onChange={(event) => setQuery(event.target.value)} />
          <input placeholder="Город" value={city} onChange={(event) => setCity(event.target.value)} />
          <input
            placeholder="Зарплата до"
            type="number"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value as Category | 'Все')}>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <select value={selectedType} onChange={(event) => setSelectedType(event.target.value as 'all' | 'vacancy' | 'resume')}>
            <option value="all">Все типы</option>
            <option value="vacancy">Вакансии</option>
            <option value="resume">Резюме</option>
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
          <h2>AI-инструменты для HR и соискателей</h2>
          <label>
            Черновик должности
            <input
              placeholder="Например: Frontend разработчик"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
            />
          </label>
          <p>
            Предложенная категория: <strong>{aiCategory}</strong>
          </p>
          <p>{generatedDescription}</p>
          <p className={moderation.approved ? 'success' : 'danger'}>{moderation.reason}</p>
        </div>

        <div className="panel">
          <h2>Рекомендовано для вас</h2>
          <ul className="recommendations">
            {recommendations.map((item) => (
              <li key={item.id}>
                <span>{item.title} ({item.type === 'vacancy' ? 'Вакансия' : 'Резюме'})</span>
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
            <p>Ваших публикаций: {demoProfile.listingsCount}</p>
            <p>Избранных: {favorites.length || demoProfile.favoritesCount}</p>
            <p>Рейтинг: ⭐ {demoProfile.rating}</p>
          </div>
          <div>
            <h4>Отклики и сообщения</h4>
            <p>Новых откликов: 3</p>
            <p>Непрочитанных сообщений: 5</p>
          </div>
        </div>
      </section>
    </main>
  );
}
