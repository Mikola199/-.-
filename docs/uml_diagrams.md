# UML-диаграммы модулей и микросервисов EQUHUB

Настоящий документ содержит спецификацию UML-диаграмм Единой цифровой платформы **EQUHUB** в соответствии с Разделами 3, 10 и 15 (Пункт 2) Требований к программному обеспечению (SRS). Динамика и структура взаимодействия описываются с помощью схем Mermaid.js.

---

## 1. Диаграмма прецедентов использования (Use Case Diagram)

Диаграмма показывает, какие роли пользователей (Соискатель/Покупатель, Работодатель/Продавец, Модератор/Администратор) взаимодействуют со следующими ключевыми модулями:

```mermaid
graph TD
    %% Акторы
    User[Пользователь / Покупатель / Соискатель]
    Merchant[Продавец / Работодатель]
    Admin[Администратор / Арбитр]

    %% Прецеденты Пользователя
    subgraph "Базовые модули"
        A1[Регистрация и Вход / JWT]
        A2[Просмотр новостной ленты]
        A3[Поиск товаров / Фильтры]
        A4[Отклик на вакансию / Создание резюме]
        A5[Общение в мессенджере]
    end

    %% Прецеденты Продавца / Работодателя
    subgraph "Бизнес-инструменты"
        B1[Создание объявления на маркетплейсе]
        B2[Размещение вакансии компании]
        B3[Проведение безопасной сделки / Escrow]
        B4[Запуск WebRTC видеовызова]
    end

    %% Прецеденты Администратора
    subgraph "Администрирование"
        C1[Модерация контента / AI фильтры]
        C2[Разрешение споров / Арбитраж Escrow]
        C3[Блокировка пользователей]
    end

    User --> A1
    User --> A2
    User --> A3
    User --> A4
    User --> A5

    Merchant --> A1
    Merchant --> B1
    Merchant --> B2
    Merchant --> B3
    Merchant --> B4

    Admin --> C1
    Admin --> C2
    Admin --> C3
```

---

## 2. Диаграмма последовательности (Sequence Diagram): Безопасная сделка (Escrow)

Диаграмма иллюстрирует процесс проведения безопасной сделки по шагам (от списания средств с кошелька Покупателя до заморозки в Escrow-оркестраторе и последующего релиза средств Продавцу при успешной доставке):

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Покупатель (Екатерина)
    participant Client as Мобильное приложение (Flutter)
    participant GW as API Gateway (Nginx)
    participant PayS as Payment Service (NestJS)
    participant DB as СУБД PostgreSQL
    participant Notif as Notification Service (RabbitMQ)
    actor Seller as Продавец (Илья)

    Buyer->>Client: Инициировать покупку MacBook Pro (320 000 ₽)
    Client->>GW: POST /api/v1/payments/escrow (JWT Token)
    GW->>PayS: Перенаправление проверенного запроса [Auth OK]

    activate PayS
    PayS->>DB: Проверка баланса кошелька u1
    DB-->>PayS: Баланс достаточен (450 000 ₽)

    PayS->>DB: Списание 320 000 ₽ у покупателя & Заморозка на Escrow счете
    DB-->>PayS: Транзакция успешна [ACID Commit]

    PayS->>Notif: Публикация события 'escrow.held' в RabbitMQ
    deactivate PayS

    activate Notif
    Notif-->>Client: Push-уведомление Покупателю "Оплата заморожена!"
    Notif-->>Seller: Push-уведомление Продавцу "Заказ оплачен, отправляйте товар!"
    deactivate Notif

    Note over Seller, Buyer: Продавец отправляет товар курьером

    Seller->>Client: Отметить товар "Отправлен"
    Client->>GW: PATCH /api/v1/payments/escrow/e1/ship
    GW->>PayS: Перенаправление запроса
    PayS->>DB: Обновление статуса сделки на 'отправлена' (Шаг 3)
    PayS->>Notif: Уведомление покупателю об отправке

    Note over Buyer, Seller: Покупатель получает и проверяет ноутбук

    Buyer->>Client: Подтвердить получение товара
    Client->>GW: POST /api/v1/payments/escrow/e1/release
    GW->>PayS: Перенаправление запроса

    activate PayS
    PayS->>DB: Разблокировать 320 000 ₽ с Escrow и начислить Продавцу (Илья)
    DB-->>PayS: Баланс обновлен [ACID Commit]
    PayS->>Notif: Публикация события 'escrow.completed'
    deactivate PayS

    Notif-->>Seller: "Выплата 320 000 ₽ зачислена на ваш кошелек!"
    Notif-->>Buyer: "Сделка успешно завершена!"
```

---

## 3. Диаграмма компонентов (Component Diagram): Микросервисная архитектура

Диаграмма компонентов отражает декомпозицию системы на бэкенд-сервисы, их взаимодействие через API Gateway и брокеры сообщений:

```mermaid
graph TB
    subgraph "Клиентский слой (Frontend)"
        Flutter[Flutter Mobile App]
        NextJS[Next.js 14 Web Portal]
    end

    subgraph "Единый шлюз (API Gateway)"
        Gateway[Nginx / Kong Gateway]
    end

    subgraph "Микросервисы EQUHUB (Backend)"
        Auth[Auth Service<br>FastAPI / JWT]
        User[User Service<br>NestJS]
        Feed[Feed Service<br>NestJS]
        Chat[Chat & WebRTC Service<br>Go & C++]
        Market[Marketplace Service<br>NestJS]
        Vacancy[Vacancy Service<br>NestJS]
        AI[AI Assistant Service<br>FastAPI / PyTorch]
        Payment[Payment & Escrow Service<br>NestJS]
        Notif[Notification Service<br>RabbitMQ / NestJS]
    end

    subgraph "Базы данных & Брокеры"
        PG[(PostgreSQL 15)]
        Redis[(Redis Key-Value Cache)]
        ES[(Elasticsearch 8)]
        S3[(MinIO S3 Object Storage)]
        Rabbit[RabbitMQ Broker]
    end

    %% Связи Клиент -> Gateway
    Flutter -->|HTTPS / WSS| Gateway
    NextJS -->|HTTPS / WSS| Gateway

    %% Gateway -> Сервисы
    Gateway -->|JWT Validate & Route| Auth
    Gateway -->|Route| User
    Gateway -->|Route| Feed
    Gateway -->|WebSockets / Signal| Chat
    Gateway -->|Route| Market
    Gateway -->|Route| Vacancy
    Gateway -->|Route| AI
    Gateway -->|Route| Payment

    %% Межсервисный обмен через RabbitMQ
    Payment -->|Publish event| Rabbit
    Vacancy -->|Publish event| Rabbit
    Market -->|Publish event| Rabbit
    Rabbit -->|Consume & Send| Notif

    %% Интеграция с СУБД
    Auth --> PG
    Auth --> Redis
    User --> PG
    User --> Redis
    Feed --> PG
    Market --> ES
    Market --> S3
    Market --> PG
    Vacancy --> PG
    Vacancy --> ES
    Payment --> PG
    Payment --> Redis
    Chat --> Redis
    AI --> Redis
```
