# OpenAPI (Swagger) Спецификация API EQUHUB

Настоящий документ содержит детальное описание REST API конечных точек Единой цифровой платформы EQUHUB, соответствующий разделу 10 и 15 Спецификации Требований (SRS).

---

## 1. Базовый URL
* Локальный: `http://localhost:8000/api/v1`
* Продакшн: `https://api.equhub.ru/v1`

---

## 2. Спецификация эндпоинтов

### 2.1 Авторизация (Auth Service - Port 8001)

#### `POST /auth/register`
Регистрация нового пользователя в системе.
* **Request Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "phone": "+79991112233"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "user_id": "4a7b54a8-6b8c-4d32-8e1f-72f10b5c92da"
  }
  ```

#### `POST /auth/login`
Вход в систему с получением JWT токенов.
* **Request Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 900
  }
  ```

---

### 2.2 Работа: Вакансии & Резюме (Vacancy Service - Port 8006)

#### `GET /jobs`
Получение отфильтрованного списка вакансий и резюме.
* **Query Parameters:**
  * `type` (string, optional) — `vacancy` или `resume`.
  * `sector` (string, optional) — Сектор рынка (например, `IT`, `HR`).
  * `query` (string, optional) — Полнотекстовый поиск по заголовку и требованиям.
* **Response (200 OK):**
  ```json
  [
    {
      "id": "j1",
      "type": "vacancy",
      "title": "Senior NestJS Backend Developer",
      "description": "Ищем бэкендера...",
      "company": "EQUHUB Tech",
      "author": "Мария Кравцова (HR)",
      "salary": 350000,
      "city": "Москва",
      "sector": "IT",
      "requirements": "Опыт разработки NestJS от 5 лет."
    }
  ]
  ```

#### `POST /jobs`
Опубликовать новое объявление о вакансии или резюме.
* **Headers:**
  * `Authorization: Bearer <access_token>`
* **Request Body (JSON):**
  ```json
  {
    "type": "vacancy",
    "title": "Middle Go Developer",
    "description": "Разработка ядра реального времени...",
    "salary": 250000,
    "city": "Санкт-Петербург",
    "sector": "IT",
    "requirements": "Знание Go, WebSockets, gRPC."
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "j99",
    "status": "published",
    "created_at": "2026-02-14T15:30:00Z"
  }
  ```

---

### 2.3 Безопасные сделки (Payment Service - Port 8008)

#### `POST /payments/escrow`
Создать безопасную сделку (заморозить средства покупателя).
* **Headers:**
  * `Authorization: Bearer <access_token>`
* **Request Body (JSON):**
  ```json
  {
    "ad_id": "l1",
    "title": "MacBook Pro M3 Max",
    "price": 320000,
    "seller_id": "u55"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "deal_id": "e1",
    "status": "funded",
    "held_amount": 320000,
    "step": 2
  }
  ```
