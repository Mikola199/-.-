'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { aiGenerateDescription, aiModerateListing, aiRecommend, aiSuggestCategory } from '@/lib/ai';
import { demoProfile, listings } from '@/lib/mockData';
import { Category } from '@/lib/types';

const categories: Array<Category | 'Все'> = ['Все', 'IT', 'Маркетинг', 'Продажи', 'Медицина', 'Строительство'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Все'>('Все');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [titleDraft, setTitleDraft] = useState('');

  const filtered = useMemo(() => {
    return listings.filter((item) => {
      const queryMatch = item.title.toLowerCase().includes(query.toLowerCase()) ||
                         item.description.toLowerCase().includes(query.toLowerCase()) ||
                         (item.company?.toLowerCase().includes(query.toLowerCase()) ?? false);
      const cityMatch = city ? item.city.toLowerCase().includes(city.toLowerCase()) : true;
      const categoryMatch = selectedCategory === 'Все' || item.category === selectedCategory;
      const salaryMatch = minSalary ? item.price >= Number(minSalary) : true;
      return queryMatch && cityMatch && categoryMatch && salaryMatch;
    });
  }, [query, city, selectedCategory, minSalary]);

  const recommendations = useMemo(() => aiRecommend(listings, demoProfile.city, ['IT', 'Маркетинг']), []);
  const aiCategory = titleDraft ? aiSuggestCategory(titleDraft) : '—';
  const generatedDescription = titleDraft ? aiGenerateDescription(titleDraft) : 'Введите название должности';
  const moderation = aiModerateListing(titleDraft);

  return (
    <main className="container">
      <Header />

      <section className="hero">
        <div>
          <p className="eyebrow">Кадровое агентство нового поколения</p>
          <h1>Найдите работу мечты или идеального кандидата с AI</h1>
          <p>
            Интеллектуальный подбор персонала, автоматическая модерация резюме и вакансий,
            удобные фильтры и прямая связь между соискателем и работодателем.
          </p>
          <div className="hero-cta">
            <button type="button">Опубликовать вакансию</button>
            <button type="button" className="ghost-button">
              Разместить резюме
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <h3>Почему NeoJob</h3>
          <ul>
            <li>⚡ Быстрый поиск по базе проверенных вакансий</li>
            <li>🔐 Безопасные сделки и защита данных</li>
            <li>🤖 AI-подбор подходящих кандидатов</li>
            <li>📱 Удобное управление откликами</li>
          </ul>
        </div>
      </section>

      <section id="catalog" className="panel">
        <h2>Поиск работы и сотрудников</h2>
        <div className="filters">
          <input placeholder="Должность, навыки или компания" value={query} onChange={(event) => setQuery(event.target.value)} />
          <input placeholder="Город или Удаленно" value={city} onChange={(event) => setCity(event.target.value)} />
          <input
            placeholder="Зарплата от"
            type="number"
            value={minSalary}
            onChange={(event) => setMinSalary(event.target.value)}
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
          <h2>AI-помощник рекрутера</h2>
          <label>
            Название вакансии/резюме
            <input
              placeholder="Например: Senior React Developer"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
            />
          </label>
          <p>
            Рекомендуемая индустрия: <strong>{aiCategory}</strong>
          </p>
          <p>{generatedDescription}</p>
          <p className={moderation.approved ? 'success' : 'danger'}>{moderation.reason}</p>
        </div>

        <div className="panel">
          <h2>Рекомендованные вакансии</h2>
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
            <p>Рейтинг: ⭐ {demoProfile.sellerRating}</p>
          </div>
          <div>
            <h4>Отклики и уведомления</h4>
            <p>Новых откликов: 3</p>
            <p>Приглашений: 2</p>
          </div>
        </div>
      </section>
    </main>
  );
}
