'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="logo text-gradient">Аврора</div>
      <nav>
        <Link href="#catalog">Каталог</Link>
        <Link href="#features">AI-возможности</Link>
        <Link href="#dashboard">Кабинет</Link>
      </nav>
      <button onClick={toggleTheme} className="ghost-button" type="button">
        {theme === 'light' ? '🌙 Тёмная' : '☀️ Светлая'}
      </button>
    </header>
  );
}
