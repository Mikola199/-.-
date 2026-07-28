# ER-диаграмма базы данных EQUHUB

Настоящий документ содержит детальное описание реляционной структуры базы данных PostgreSQL для Единой цифровой платформы EQUHUB, соответствующей разделу 4 Спецификации Требований (SRS).

---

## 1. Описание основных сущностей и полей

### 1.1 Users (Пользователи)
Сущность хранит основные учетные данные для авторизации и безопасности.
* `id` (UUID, PK) — Уникальный идентификатор пользователя.
* `email` (VARCHAR(255), Unique, Indexed) — Электронная почта.
* `password_hash` (VARCHAR(255)) — Хэш пароля (с использованием passlib/bcrypt).
* `phone` (VARCHAR(50), Nullable) — Номер телефона.
* `is_two_factor_enabled` (BOOLEAN) — Статус двухфакторной аутентификации (по умолчанию FALSE).
* `created_at` (TIMESTAMP) — Дата регистрации.
* `updated_at` (TIMESTAMP) — Дата обновления.

### 1.2 Profiles (Профили)
Хранит публичные и приватные данные пользователя. Связана "один-к-одному" с `Users`.
* `user_id` (UUID, PK, FK -> Users.id) — Идентификатор пользователя.
* `name` (VARCHAR(150)) — Имя и фамилия.
* `avatar_url` (VARCHAR(512), Nullable) — Ссылка на аватар в MinIO S3.
* `cover_url` (VARCHAR(512), Nullable) — Ссылка на обложку профиля.
* `bio` (TEXT, Nullable) — Биография / описание.
* `city` (VARCHAR(100)) — Город проживания.
* `interests` (TEXT[], Nullable) — Список интересов (массив строк).
* `rating` (DECIMAL(3,2)) — Рейтинг пользователя (по умолчанию 5.00).
* `achievements` (JSONB, Nullable) — Достижения и награды.

### 1.3 Wallets (Кошельки)
Хранит баланс пользователя для безопасных сделок. Связана "один-к-одному" с `Users`.
* `id` (UUID, PK) — Уникальный идентификатор кошелька.
* `user_id` (UUID, FK -> Users.id) — Владелец кошелька.
* `balance` (DECIMAL(15,2)) — Доступный баланс в рублях.
* `held_balance` (DECIMAL(15,2)) — Замороженные средства (в Escrow).
* `updated_at` (TIMESTAMP) — Время последнего обновления.

### 1.4 EscrowTransactions (Безопасные сделки)
Связывает покупателя, продавца, объявление и статус холдирования средств.
* `id` (UUID, PK) — Идентификатор сделки.
* `title` (VARCHAR(255)) — Наименование сделки.
* `buyer_id` (UUID, FK -> Users.id) — Покупатель.
* `seller_id` (UUID, FK -> Users.id) — Продавец.
* `ad_id` (UUID, Nullable, FK -> MarketplaceAds.id) — Связанное объявление.
* `amount` (DECIMAL(15,2)) — Сумма сделки.
* `status` (VARCHAR(50)) — Статус: `created` (создана), `funded` (оплачена), `shipped` (отправлена), `completed` (завершена), `disputed` (спор).
* `step` (INTEGER) — Шаг сделки (1-4).
* `created_at` (TIMESTAMP) — Дата создания.
* `updated_at` (TIMESTAMP) — Дата изменения статуса.

### 1.5 Jobs (Вакансии & Резюме)
Общая таблица для вакансий и резюме с флагом типа.
* `id` (UUID, PK) — Идентификатор записи.
* `type` (VARCHAR(20)) — Тип записи: `vacancy` или `resume`.
* `title` (VARCHAR(255)) — Заголовок объявления.
* `description` (TEXT) — Описание вакансии или резюме.
* `company` (VARCHAR(255), Nullable) — Компания (для вакансий).
* `author_id` (UUID, FK -> Users.id) — Автор объявления.
* `salary` (DECIMAL(15,2)) — Предлагаемая или желаемая зарплата.
* `city` (VARCHAR(100)) — Локация работы.
* `sector` (VARCHAR(100)) — Сектор рынка (например, `IT`, `HR`, `Sales`).
* `requirements` (TEXT, Nullable) — Требования / Квалификация.
* `created_at` (TIMESTAMP) — Дата публикации.

---

## 2. Логические связи (Relationships)

1. `Users.id` 1 <---> 1 `Profiles.user_id` (Каскадное удаление)
2. `Users.id` 1 <---> 1 `Wallets.user_id`
3. `Users.id` 1 <---> N `Jobs.author_id`
4. `Users.id` 1 (Покупатель) <---> N `EscrowTransactions.buyer_id`
5. `Users.id` 1 (Продавец) <---> N `EscrowTransactions.seller_id`
