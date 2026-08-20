# 2. UML-диаграммы модулей и сервисов (EQUHUB)

Данный документ содержит UML-диаграммы компонентов и последовательности, описывающие внутреннее устройство и интеграцию микросервисов платформы **EQUHUB**.

---

## 2.1 Диаграмма компонентов (System Component Diagram)

Диаграмма иллюстрирует взаимодействие между Flutter-клиентами, API Gateway (Nginx), микросервисами бэкенда (FastAPI, NestJS, Go/C++), очередями сообщений RabbitMQ, кэш-слоем Redis, СУБД PostgreSQL, а также Elasticsearch и хранилищем файлов MinIO S3.

```mermaid
graph TD
    Client[Мобильные и Web клиенты: Flutter / React] -->|HTTPS / WSS| GW[API Gateway: Nginx / Kong]

    subgraph "Микросервисы (EQUHUB Services)"
        GW -->|8001| AuthSvc[Auth Service: FastAPI]
        GW -->|8002| UserSvc[User Service: NestJS]
        GW -->|8003| FeedSvc[Feed Service: NestJS]
        GW -->|8004| ChatSvc[Chat Service: Go / C++]
        GW -->|8005| MarketSvc[Marketplace Svc: NestJS]
        GW -->|8006| VacancySvc[Vacancy Svc: NestJS]
        GW -->|8007| AISvc[AI Service: FastAPI / PyTorch]
        GW -->|8008| PaySvc[Payment Svc: NestJS]
        GW -->|8009| NotificationSvc[Notification Svc: NestJS]
    end

    subgraph "Асинхронные коммуникации"
        FeedSvc -.->|Publish| RMQ[RabbitMQ Broker]
        MarketSvc -.->|Publish| RMQ
        VacancySvc -.->|Publish| RMQ
        PaySvc -.->|Publish| RMQ
        RMQ -.->|Consume| NotificationSvc
    end

    subgraph "Слой баз данных и хранилищ"
        AuthSvc -->|Session Cache| Redis[(Redis 7)]
        UserSvc -->|Read/Write| PG[(PostgreSQL 15)]
        FeedSvc -->|Read/Write| PG
        MarketSvc -->|Read/Write| PG
        VacancySvc -->|Read/Write| PG
        PaySvc -->|Read/Write| PG

        MarketSvc -->|Index Ads| ES[(Elasticsearch 8)]
        VacancySvc -->|Index Jobs| ES

        FeedSvc -->|Upload Media| S3[(MinIO S3 Storage)]
        MarketSvc -->|Upload Photos| S3
    end

    style GW fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff
    style ChatSvc fill:#164e63,stroke:#22d3ee,stroke-width:2px,color:#fff
    style AuthSvc fill:#0f172a,stroke:#3b82f6,stroke-width:1px,color:#fff
    style PaySvc fill:#581c87,stroke:#a855f7,stroke-width:2px,color:#fff
    style RMQ fill:#7c2d12,stroke:#ea580c,stroke-width:1px,color:#fff
```

---

## 2.2 Диаграмма последовательности: Авторизация (JWT Auth Flow)

Процесс регистрации, авторизации, генерации токенов JWT (HS256) и последующего доступа к защищенному API через Gateway.

```mermaid
sequenceDiagram
    autonumber
    actor User as Пользователь (Клиент)
    participant GW as API Gateway (Nginx)
    participant Auth as Auth Service (FastAPI)
    participant Redis as Кэш (Redis)
    participant DB as СУБД (PostgreSQL)

    User->>GW: POST /api/v1/auth/login {email, password}
    GW->>Auth: Перенаправление запроса на порт 8001
    Auth->>DB: SELECT password_hash, 2fa_secret FROM users WHERE email = ?
    DB-->>Auth: Данные пользователя найдены
    Note over Auth: Валидация пароля (passlib/bcrypt)

    rect rgb(15, 23, 42)
        Note over Auth: Если 2FA включена, запрашивается TOTP-код
        Auth-->>User: 403 Required 2FA Code
        User->>GW: POST /api/v1/auth/login/2fa {code, session_id}
        GW->>Auth: Валидация кода TOTP
    end

    Auth->>Redis: Сохранение сессии сеанса в Redis
    Note over Auth: Генерация JWT Access Token (HS256) & Refresh Token
    Auth-->>User: 200 OK {access_token, refresh_token, profile_summary}

    Note over User, GW: Запрос к закрытому ресурсу (например, кошельку)
    User->>GW: GET /api/v1/payments/wallet (Headers: Authorization: Bearer <JWT>)
    Note over GW: Проверка подписи JWT на Gateway или вызов Auth Svc
    GW->>Auth: Верификация Access Token
    Auth-->>GW: Token Valid (User ID: u1, Roles: ['user'])
    GW->>User: 200 OK {wallet_balance: 450000.00}
```

---

## 2.3 Диаграмма последовательности: Безопасная сделка (Escrow / Secure Deal Flow)

Сквозной процесс покупки MacBook Pro на маркетплейсе с холдированием средств в Escrow и доставкой.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Покупатель (Екатерина)
    actor Seller as Продавец (Илья)
    participant Market as Marketplace Service
    participant Pay as Payment Service
    participant Chat as Chat Service
    participant Notif as Notification Service

    Buyer->>Market: Нажатие кнопки "Купить с безопасной сделкой"
    Market->>Pay: POST /escrow/create {ad_id: 'l1', buyer_id: 'u1'}
    Pay-->>Market: Сделка e1 создана (Статус: создана, Шаг 1)
    Market-->>Buyer: Экран оплаты сделки

    Buyer->>Pay: Оплата сделки e1 из Wallet {amount: 320000.00}
    Note over Pay: Проверка баланса кошелька Екатерины. Баланс достаточен.
    Pay->>Pay: Холдирование средств (перенос 320,000 ₽ на escrow_frozen)
    Pay->>Pay: Изменение статуса сделки (Статус: оплачена, Шаг 2)

    Pay->>Notif: Отправка события 'escrow.funded' в RabbitMQ
    Notif-->>Seller: PUSH-уведомление "Оплата получена! Упакуйте и отправьте товар."
    Notif-->>Buyer: PUSH-уведомление "Средства успешно заморожены в Escrow."

    Seller->>Chat: Сообщение покупателю "Товар упакован и передан курьеру"
    Chat-->>Buyer: Мгновенное WebSocket сообщение в чате

    Seller->>Pay: POST /escrow/ship {deal_id: 'e1'} (Передано в доставку)
    Pay->>Pay: Смена статуса (Статус: отправлена, Шаг 3)
    Pay->>Notif: Событие 'escrow.shipped'
    Notif-->>Buyer: PUSH "Ваш заказ в пути. Подтвердите получение по прибытии."

    Buyer->>Pay: POST /escrow/receive {deal_id: 'e1'} (Товар успешно получен)
    Pay->>Pay: Смена статуса (Статус: завершена, Шаг 4)
    Pay->>Pay: Разморозка 320,000 ₽ с Escrow-счета
    Pay->>Pay: Зачисление 320,000 ₽ на кошелек продавца (Ильи)
    Pay->>Notif: Событие 'escrow.completed'
    Notif-->>Seller: PUSH "Сделка завершена. На ваш баланс зачислено 320,000 ₽!"
```

---

## 2.4 Диаграмма последовательности: Отклик на вакансию (Vacancy Recruitment Flow)

Как соискатель (Екатерина) находит и откликается на вакансию от EQUHUB Tech в новом MVP модуле Работа.

```mermaid
sequenceDiagram
    autonumber
    actor Applicant as Соискатель (Екатерина)
    actor Recruiter as Рекрутер (Мария)
    participant Vacancy as Vacancy Service
    participant Chat as Chat Service
    participant Notif as Notification Service

    Applicant->>Vacancy: Поиск вакансий (GET /jobs?sector=IT&query=NestJS)
    Vacancy-->>Applicant: Список подходящих вакансий (включая j1)

    Applicant->>Vacancy: Откликнуться на вакансию j1 (Резюме: j3)
    Vacancy->>Vacancy: Запись отклика в PostgreSQL (job_applications)

    Vacancy->>Notif: Публикация события 'job.applied' в RabbitMQ
    Notif-->>Recruiter: PUSH/Email: "Новый отклик на вакансию Senior NestJS Developer!"

    Recruiter->>Vacancy: Просмотр отклика и резюме Екатерины Смирновой
    Note over Recruiter: Резюме оценено высоко
    Recruiter->>Chat: Инициализация чата-собеседования с Екатериной
    Chat->>Chat: Создание чата c12 (is_group=false)
    Chat-->>Applicant: Приглашение на собеседование в EQUHUB Messenger
    Applicant->>Chat: Принятие приглашения, переписка
```
