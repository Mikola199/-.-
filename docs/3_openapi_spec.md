# 3. Спецификация OpenAPI 3.0 (Swagger) EQUHUB

```yaml
openapi: 3.0.3
info:
  title: EQUHUB Platform API
  description: Полная OpenAPI 3.0 спецификация API единой цифровой платформы EQUHUB.
  version: 1.0.0
servers:
  - url: https://api.equhub.ru/v1
    description: Production API Gateway
  - url: http://localhost:8000/v1
    description: Local Dev API Gateway

paths:
  /auth/register:
    post:
      summary: Регистрация нового пользователя
      tags:
        - Authorization
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, first_name, last_name]
              properties:
                email:
                  type: string
                  format: email
                  example: user@equhub.ru
                password:
                  type: string
                  format: password
                  minLength: 8
                  example: SecurePass123!
                first_name:
                  type: string
                  example: Екатерина
                last_name:
                  type: string
                  example: Смирнова
      responses:
        '201':
          description: Пользователь успешно зарегистрирован
        '400':
          description: Ошибка валидации данных или email занят

  /auth/login:
    post:
      summary: Вход в систему и получение JWT
      tags:
        - Authorization
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                  example: user@equhub.ru
                password:
                  type: string
                  format: password
                  example: SecurePass123!
      responses:
        '200':
          description: Успешная аутентификация
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                    example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                  refresh_token:
                    type: string
                  expires_in:
                    type: integer
                    example: 900

  /users/{id}:
    get:
      summary: Получение профиля пользователя
      tags:
        - Users
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Публичный профиль найден
        '404':
          description: Пользователь не найден

  /ads:
    get:
      summary: Поиск объявлений маркетплейса
      tags:
        - Marketplace
      parameters:
        - name: query
          in: query
          schema:
            type: string
        - name: category
          in: query
          schema:
            type: string
        - name: city
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Список объявлений

    post:
      summary: Создание нового объявления
      security:
        - BearerAuth: []
      tags:
        - Marketplace
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title, description, price, category, city]
              properties:
                title:
                  type: string
                  example: Apple MacBook Pro M3 Max
                description:
                  type: string
                price:
                  type: number
                  example: 320000
                category:
                  type: string
                  example: Техника
                city:
                  type: string
                  example: Москва
      responses:
        '201':
          description: Объявление размещено

  /jobs:
    get:
      summary: Поиск вакансий и резюме
      tags:
        - Jobs
      parameters:
        - name: type
          in: query
          schema:
            type: string
            enum: [vacancy, resume]
        - name: sector
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Список вакансий / резюме

  /ai/analyze:
    post:
      summary: AI Анализ и автомодерация контента
      tags:
        - AI Service
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text:
                  type: string
                  example: Продам схему быстрого заработка
      responses:
        '200':
          description: Результат AI обработки и модерации

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```
