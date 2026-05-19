'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="logo">NeoJob</div>
      <nav>
        <Link href="#catalog">Вакансии и Резюме</Link>
        <Link href="#features">AI-Рекрутинг</Link>
        <Link href="#dashboard">Кабинет</Link>
      </nav>
      <button onClick={toggleTheme} className="ghost-button" type="button">
        {theme === 'light' ? '🌙 Тёмная' : '☀️ Светлая'}
      </button>
    </header>
  );
}
