# EQUHUB — Единая цифровая платформа

## Документ 6: Спецификация CI/CD-конвейера (Непрерывная интеграция и доставка)

### 1. Архитектура CI/CD

Автоматизация процессов сборки, тестирования и развертывания платформы EQUHUB реализована на базе **GitHub Actions**. В соответствии с жесткими корпоративными требованиями безопасности, все сторонние действия (GitHub Actions) привязаны строго к полным **коммит-SHA (SHA-1)**, а не к тегам версий.

*Обратите внимание: приведенная ниже конфигурация представляет собой демонстрационный и иллюстративный пример полной производственной конфигурации конвейера.*

---

### 2. Спецификация конвейера сборки и проверки

Конвейер делится на три последовательные стадии:
1.  **Linter & Formatter (Статический анализ):**
    *   Проверка синтаксиса TypeScript/Next.js с помощью `eslint`.
    *   Проверка Python-кода с помощью `flake8` или `black`.
2.  **Type Checking & Tests (Верификация кода):**
    *   Проверка типов в Next.js: `npx tsc --noEmit`.
    *   Запуск юнит-тестов бэкенда Python через `pytest` в изолированном окружении.
3.  **Docker Build & Push (Упаковка и доставка):**
    *   Автоматическая сборка Docker-образов для микросервисов.
    *   Публикация готовых образов в приватный реестр Docker Registry.

---

### 3. Листинг конфигурационного файла GitHub Actions (`.github/workflows/main.yml`)

Ниже приведен эталонный рабочий процесс интеграции, защищенный от атак подмены тегов:

```yaml
name: Python & Node.js CI/CD Pipeline

on:
  push:
    branches: ["main", "develop"]
  pull_request:
    branches: ["main"]

jobs:
  # Проверка TypeScript фронтенда
  frontend-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

      - name: Set up Node.js
        uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdeb5c4 # v4.0.2
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Run ESLint
        run: npm run lint

      - name: TypeScript Type Check
        run: npx tsc --noEmit

  # Проверка Python бэкенда и тестов
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

      - name: Set up Python
        uses: actions/setup-python@42375524e23c412d93fb67b49958b491fce71c38 # v5.4.0
        with:
          python-version: "3.11"
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install flake8 pytest playwright python-jose passlib bcrypt
          python -m playwright install --with-deps

      - name: Run Python Linter (flake8)
        run: flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics

      - name: Run Pytest suite
        run: pytest -v
```

---

### 4. Стратегия CD (Непрерывная Доставка)

После успешного выполнения всех тестов в ветке `main`, запускается CD-процесс:
1.  **Сборка Docker образов:** Для каждого микросервиса (Auth, User, Feed, Chat, Market, Vacancy, AI, Payments) собирается легковесный alpine-образ.
2.  **Деплой на Стенд:** Выполняется отправка сигнала в кластер Kubernetes (через Helm-чарты или kubectl rollout) или перезапуск контейнеров на сервере через Docker Compose.
3.  **Проверка жизнеспособности (Liveness/Readiness Probes):** Gateway перенаправляет трафик на новые реплики только после того, как эндпоинты `/health` вернут код `200 OK`.
