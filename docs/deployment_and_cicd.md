# Документация по развёртыванию и CI/CD-конвейеру EQUHUB

Настоящий документ описывает архитектуру развёртывания, конфигурацию Docker, Kubernetes и структуру CI/CD конвейера для Единой цифровой платформы EQUHUB, соответствующий разделам 12 и 15 Спецификации Требований (SRS).

---

## 1. Контейнеризация (Docker)

Все микросервисы EQUHUB упакованы в легковесные контейнеры Docker. Ниже представлен пример Dockerfile для сервисов на NestJS:

```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["node", "dist/main"]
```

---

## 2. Оркестрация для локальной разработки (Docker Compose)

Файл `docker-compose.yml` в корне репозитория оркеструет запуск бэкенда и баз данных:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: equhub-db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: equhub
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: SecretPassword123
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: equhub-cache
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: equhub-broker
    ports:
      - "5672:5672"
      - "15672:15672"

  api-gateway:
    image: nginx:alpine
    container_name: equhub-gateway
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - auth-service
      - vacancy-service

  auth-service:
    build: ./services/auth
    ports:
      - "8001:8001"
    environment:
      - JWT_SECRET=HS256_SuperSecret_Key_EQUHUB
      - DATABASE_URL=postgresql://admin:SecretPassword123@postgres:5432/equhub

  vacancy-service:
    build: ./services/vacancy
    ports:
      - "8006:8006"
    depends_on:
      - postgres
      - rabbitmq

volumes:
  pgdata:
```

---

## 3. Оркестрация в Продакшне (Kubernetes)

Развёртывание в высокодоступный кластер (например, Yandex Managed Service for Kubernetes или AWS EKS) осуществляется с помощью декларативных манифестов:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vacancy-service-deployment
  namespace: equhub
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vacancy-service
  template:
    metadata:
      labels:
        app: vacancy-service
    spec:
      containers:
      - name: vacancy-service
        image: registry.equhub.ru/vacancy-service:latest
        ports:
        - containerPort: 8006
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "250m"
            memory: "256Mi"
```

---

## 4. CI/CD-конвейер (GitHub Actions)

Конвейер автоматизирует тестирование, линтинг, сборку Docker-образов и их публикацию в приватный Registry при каждом слиянии в ветку `main`.

Все GitHub Actions жестко зафиксированы по полному хэшу SHA для обеспечения безопасности цепочки поставок ПО:

```yaml
name: EQUHUB Continuous Integration

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

      - name: Install Node.js
        uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5fc # v4.0.2
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Check TypeScript Compilation
        run: npx tsc --noEmit

      - name: Run ESLint Checks
        run: npm run lint
```
