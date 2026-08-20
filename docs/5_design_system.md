# 5. Дизайн-система (EQUHUB)

Данный документ представляет собой полную техническую документацию по дизайн-системе цифровой платформы **EQUHUB**. Дизайн-система разработана для обеспечения визуальной согласованности, высокой эстетики, отзывчивости интерфейсов и премиального пользовательского опыта.

---

## 5.1 Философия бренда и стиль

**EQUHUB — Единая цифровая платформа** использует стиль **Premium Cyber-Minimalism** с элементами **Glassmorphism (стекломорфизма)**.

Основные принципы стиля:
*   **Глубокий темный фон** (снижает нагрузку на глаза, подчеркивает элементы управления).
*   **Неоновое свечение и градиенты** (акценты цвета Cyan, Purple, Blue направляют внимание пользователя).
*   **Тонкие полупрозрачные границы** и размытие фона (Backdrop Blur) создают ощущение глубины и многослойности интерфейса.
*   **Плавные CSS-переходы** (glowing transitions) на интерактивных элементах (hover/focus).

---

## 5.2 Цветовая палитра (Color Palette & Tokens)

Цветовые токены реализованы в виде CSS-переменных в файле `app/globals.css`.

### 5.2.1 Системные цвета и фоны

| CSS Переменная | Значение HEX / RGBA | Описание |
| :--- | :--- | :--- |
| `--bg` | `#030610` | Основной глубокий фоновый цвет |
| `--surface` | `rgba(13, 20, 38, 0.4)` | Фон карточек и панелей с эффектом стекла |
| `--text` | `#ffffff` | Цвет основного текста (высокий контраст) |
| `--muted` | `#94a3b8` | Приглушенный текст (подписи, даты, второстепенные элементы) |
| `--border` | `rgba(255, 255, 255, 0.06)` | Тонкие границы карточек и разделителей |

### 5.2.2 Неоновые акценты (Brand Accent Colors)

| CSS Переменная | Значение HEX / RGBA | Описание |
| :--- | :--- | :--- |
| `--accent-cyan` | `#06b6d4` (Cyan 500) | Главный интерактивный цвет, индикаторы работы, AI |
| `--accent-purple` | `#8b5cf6` (Violet 500) | Дополнительный цвет, резюме, сообщества, кнопки действий |
| `--accent-blue` | `#3b82f6` (Blue 500) | Цвет мессенджера, личных переписок |
| `--success` | `#10b981` (Emerald 500) | Успешные транзакции, завершенные сделки Escrow |
| `--warning` | `#f59e0b` (Amber 500) | Ожидание отправки, предупреждения, TOTP сессии |
| `--danger` | `#ef4444` (Red 500) | Спорные сделки Escrow, ошибки авторизации, спам-блокировка |

---

## 5.3 Типографика (Typography Scale)

В качестве основного системного шрифта используется семейство **Inter** или альтернативные системные шрифты `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`.

| Системный токен | Размер (Font Size) | Начертание (Weight) | Высота строки (Line Height) | Применение |
| :--- | :--- | :--- | :--- | :--- |
| `H1` | 32px (`2rem`) | Bold (700) | 1.2 | Заголовки экранов |
| `H2` | 24px (`1.5rem`) | Bold (700) | 1.3 | Заголовки панелей/блоков |
| `H3` | 18px (`1.125rem`) | SemiBold (600) | 1.4 | Заголовки карточек |
| `Body Large` | 16px (`1rem`) | Regular (400) | 1.5 | Крупный текст, описание вакансий |
| `Body Base` | 14px (`0.875rem`) | Regular (400) | 1.5 | Основной текст публикаций |
| `Caption` | 12px (`0.75rem`) | Regular (400) / Medium (500) | 1.4 | Метаданные, даты, статус СБП |
| `Micro` | 10px (`0.625rem`) | SemiBold (600) | 1.2 | Тэги, бейджи, логины |

---

## 5.4 Компоненты дизайн-системы

### 5.4.1 Стекломорфная панель (Glassmorphic Card)
Карточки товаров, постов и вакансий должны иметь полупрозрачный фон, размытие и легкое неоновое свечение по границам.
```css
.glass-panel {
  background: rgba(13, 20, 38, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 5.4.2 Неоновые кнопки (Neon & Glow Buttons)
1.  **Основная кнопка действия (Glow Button):**
    Имеет градиентный фон от `--accent-cyan` к `--accent-purple`, при наведении увеличивает радиус свечения.
    ```css
    .glow-btn {
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
      color: #fff;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
      transition: all 0.3s ease;
    }
    .glow-btn:hover {
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.6), 0 0 30px rgba(139, 92, 246, 0.4);
      transform: translateY(-1px);
    }
    ```
2.  **Второстепенная кнопка (Ghost Button):**
    Прозрачный фон, тонкая рамка `--border`, плавное подсвечивание рамки при наведении.
    ```css
    .ghost-btn {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 12px;
      transition: all 0.2s ease;
    }
    .ghost-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--accent-cyan);
    }
    ```

### 5.4.3 Формы ввода (Form Inputs)
Поля ввода логина, промптов AI и параметров вакансий.
```css
input[type="text"], input[type="password"], select {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: #fff;
  font-family: inherit;
  transition: all 0.2s ease;
}
input:focus, select:focus {
  outline: none;
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.15);
  background: rgba(255, 255, 255, 0.06);
}
```

### 5.4.4 Тэги и бейджи (Pills & Badges)
Маленькие индикаторы категорий, ролей и статусов.
```css
.glass-pill {
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.04);
  font-size: 11px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
```

---

## 5.5 Анимации и микровзаимодействия (Animations)

1.  **Плавное дыхание (Pulse Glow):**
    Применяется для индикаторов статуса TOTP, активных WebRTC трансляций и важных Escrow-сделок в реальном времени.
    ```css
    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
      }
      50% {
        box-shadow: 0 0 20px rgba(6, 182, 212, 0.8);
      }
    }
    .pulsing-glow {
      animation: pulse-glow 2s infinite ease-in-out;
    }
    ```
2.  **Загрузка данных (Skeleton Shimmer):**
    Анимация заполнителя при загрузке постов ленты или карточек маркетплейса.
    ```css
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
    .skeleton-shimmer {
      position: relative;
      overflow: hidden;
    }
    .skeleton-shimmer::after {
      content: "";
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.04) 20%,
        rgba(255, 255, 255, 0.08) 60%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmer 1.6s infinite;
    }
    ```
