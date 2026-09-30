# 5. Дизайн-система и CSS гайдлайн EQUHUB

## 5.1 Цветовая палитра и переменные CSS

Дизайн-система EQUHUB использует премиальную тёмную концепцию (Dark Theme) с неоновыми акцентами, размытиями заднего плана (glassmorphism) и плавными анимациями свечения.

```css
:root {
  /* Базовые фоновые цвета */
  --bg: #030712;
  --surface: #0a0f1d;
  --surface-hover: #111827;
  --border: rgba(255, 255, 255, 0.08);

  /* Текст и приглушенные оттенки */
  --text: #f9fafb;
  --text-secondary: #9ca3af;
  --muted: #6b7280;

  /* Неоновые брендовые акценты */
  --accent-blue: #3b82f6;
  --accent-cyan: #06b6d4;
  --accent-purple: #8b5cf6;
  --accent-green: #10b981;
  --accent-red: #ef4444;

  /* Градиенты */
  --brand-gradient: linear-gradient(135deg, #0891b2, #8b5cf6);
  --glow-cyan: 0 0 15px rgba(6, 182, 212, 0.4);
  --glow-purple: 0 0 15px rgba(139, 92, 246, 0.4);
}
```

---

## 5.2 Типографика

* **Основной шрифт**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`.
* **Моноширинный шрифт (для кода и логов)**: `JetBrains Mono`, `Fira Code`, `monospace`.

| Элемент | Размер шрифта | Начертание | Межстрочный интервал |
| :--- | :--- | :--- | :--- |
| **Заголовок H1** | 2rem (32px) | 800 (ExtraBold) | 1.2 |
| **Заголовок H2** | 1.5rem (24px) | 700 (Bold) | 1.25 |
| **Заголовок H3** | 1.125rem (18px) | 600 (SemiBold) | 1.3 |
| **Основной текст** | 0.875rem (14px) | 400 (Regular) | 1.5 |
| **Приглушенный текст / Подписи** | 0.75rem (12px) | 400 (Regular) | 1.4 |

---

## 5.3 Компоненты UI

### Glassmorphism Panel
```css
.glass-panel {
  background: rgba(10, 15, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

### Neon Glow Button
```css
.phone-btn-neon {
  background: var(--brand-gradient);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  padding: 10px 16px;
  transition: all 0.2s ease-in-out;
  box-shadow: var(--glow-cyan);
}

.phone-btn-neon:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}
```
