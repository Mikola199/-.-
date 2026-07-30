# Руководство по развертыванию EQUHUB (Docker & Kubernetes)

Настоящий документ содержит инструкции по локальному развертыванию с помощью Docker Compose и промышленному развертыванию в кластере Kubernetes Единой цифровой платформы **EQUHUB** в соответствии с Разделами 12, 13 и 15 (Пункт 7) Требований к программному обеспечению (SRS).

---

## 1. Локальное развертывание через Docker Compose

Для быстрого развертывания всех микросервисов и баз данных в окружении разработки (Development) используется конфигурационный файл `docker-compose.yml` в корне репозитория.

### 1.1 Пример файла `docker-compose.yml`

```yaml
version: '3.8'

services:
  # --- БАЗЫ ДАННЫХ И ИНФРАСТРУКТУРА ---
  postgres:
    image: postgres:15-alpine
    container_name: equhub_postgres
    environment:
      POSTGRES_USER: equhub_admin
      POSTGRES_PASSWORD: SecretPassword123
      POSTGRES_DB: equhub_main
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: equhub_redis
    ports:
      - "6379:6379"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.1
    container_name: equhub_elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: equhub_rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"

  minio:
    image: minio/minio:RELEASE.2023-11-20T22-40-07Z
    container_name: equhub_minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadminpassword
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"

  # --- МИКРОСЕРВИСЫ EQUHUB ---
  api-gateway:
    image: nginx:alpine
    container_name: equhub_api_gateway
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - auth-service
      - chat-service
      - payment-service

  auth-service:
    build:
      context: ./services/auth
    environment:
      - DATABASE_URL=postgresql://equhub_admin:SecretPassword123@postgres:5432/equhub_main
      - REDIS_URL=redis://redis:6379/0
      - JWT_SECRET=HS256_SuperSecretSigningKey_2026
    depends_on:
      - postgres
      - redis

  payment-service:
    build:
      context: ./services/payments
    environment:
      - DATABASE_URL=postgresql://equhub_admin:SecretPassword123@postgres:5432/equhub_main
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
```

### 1.2 Запуск локального окружения
1. Убедитесь, что у вас установлен Docker и Docker Compose.
2. Склонируйте репозиторий и перейдите в корень.
3. Выполните команду для сборки и запуска в фоновом режиме:
   ```bash
   docker compose up -d --build
   ```
4. Для просмотра логов любого сервиса выполните:
   ```bash
   docker compose logs -f auth-service
   ```

---

## 2. Развертывание в Kubernetes (Production)

Для промышленного развертывания (Production) используется оркестратор **Kubernetes**. Описание подов, сервисов, балансировщиков и дисковых томов представлено ниже.

### 2.1 Пример манифеста деплоя микросервиса (`auth-service-deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: equhub
  labels:
    app: auth-service
spec:
  replicas: 3 # Горизонтальное масштабирование
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: registry.equhub.ru/backend/auth-service:v1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: equhub-secrets
              key: pg-db-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: equhub-secrets
              key: jwt-secret-key
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "200m"
            memory: "256Mi"
        readinessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 15
          periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service-svc
  namespace: equhub
spec:
  selector:
    app: auth-service
  ports:
  - protocol: TCP
    port: 8001
    targetPort: 8001
```

---

## 3. Конфигурация Nginx API Gateway с поддержкой SSL

Ниже приведен эталонный файл конфигурации `nginx.conf`, обеспечивающий единую точку входа (Reverse Proxy), терминацию защищенного SSL/TLS соединения, ограничение частоты запросов (Rate Limiting) и поддержку проксирования вебсокетов (WebSockets).

```nginx
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Настройки лимитов запросов (Rate Limiting)
    limit_req_zone $binary_remote_addr zone=api_limit_zone:10m rate=10r/s;

    # SSL Параметры
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    server {
        listen 80;
        server_name api.equhub.ru;
        return 301 https://$host$request_uri; # Редирект на HTTPS
    }

    server {
        listen 443 ssl http2;
        server_name api.equhub.ru;

        ssl_certificate /etc/letsencrypt/live/api.equhub.ru/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.equhub.ru/privkey.pem;

        # Защита от DDoS и спам запросов
        limit_req zone=api_limit_zone burst=20 nodelay;

        # Проксирование авторизации
        location /api/v1/auth/ {
            proxy_pass http://auth-service-svc.equhub.svc.cluster.local:8001/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Проксирование платежей и безопасных сделок
        location /api/v1/payments/ {
            proxy_pass http://payment-service-svc.equhub.svc.cluster.local:8008/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Мессенджер Go & WebSockets
        location /api/v1/chats/ws {
            proxy_pass http://chat-service-svc.equhub.svc.cluster.local:8004;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```
