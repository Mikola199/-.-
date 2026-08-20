# 7. Документация по развёртыванию (EQUHUB Deployment Guide)

Данный документ содержит полное руководство по развертыванию Единой цифровой платформы **EQUHUB** в локальной среде разработки и на продакшн-серверах под управлением **Kubernetes**.

---

## 7.1 Локальное развертывание (Docker Compose Orchestration)

Для быстрого локального запуска всей экосистемы микросервисов и баз данных (включая PostgreSQL, Redis, Elasticsearch, RabbitMQ и S3 MinIO) подготовлен конфигурационный файл `docker-compose.yml`.

### 7.1.1 Файл `docker-compose.yml`

```yaml
version: '3.8'

services:
  # --- БАЗЫ ДАННЫХ И ХРАНИЛИЩА ---
  postgres:
    image: postgres:15-alpine
    container_name: equhub-postgres
    environment:
      POSTGRES_DB: equhub_db
      POSTGRES_USER: equhub_admin
      POSTGRES_PASSWORD: SecretSecurePassword2026
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - equhub-net

  redis:
    image: redis:7-alpine
    container_name: equhub-redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    networks:
      - equhub-net

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.1
    container_name: equhub-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data
    networks:
      - equhub-net

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: equhub-rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    volumes:
      - rmqdata:/var/lib/rabbitmq
    networks:
      - equhub-net

  minio:
    image: minio/minio:RELEASE.2024-01-28T22-35-53Z
    container_name: equhub-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minio_root
      MINIO_ROOT_PASSWORD: MinioSecretPassword2026
    volumes:
      - miniodata:/data
    command: server /data --console-address ":9001"
    networks:
      - equhub-net

  # --- МИКРОСЕРВИСЫ EQUHUB ---
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
      - chat-service
      - market-service
    networks:
      - equhub-net

  auth-service:
    image: ghcr.io/mikola199/equhub/auth-service:latest
    container_name: equhub-auth
    environment:
      - DATABASE_URL=postgresql://equhub_admin:SecretSecurePassword2026@postgres:5432/equhub_db
      - REDIS_HOST=redis
      - JWT_SECRET=EQUHUB_SUPER_SECRET_HS256_TOKEN_SIGNING_KEY_2026
    ports:
      - "8001:8001"
    depends_on:
      - postgres
      - redis
    networks:
      - equhub-net

  chat-service:
    image: ghcr.io/mikola199/equhub/chat-service:latest
    container_name: equhub-chat
    environment:
      - PORT=8004
      - REDIS_URL=redis://redis:6379
    ports:
      - "8004:8004"
    depends_on:
      - redis
    networks:
      - equhub-net

  market-service:
    image: ghcr.io/mikola199/equhub/market-service:latest
    container_name: equhub-market
    environment:
      - PORT=8005
      - DB_URL=postgresql://equhub_admin:SecretSecurePassword2026@postgres:5432/equhub_db
      - ES_URL=http://elasticsearch:9200
    ports:
      - "8005:8005"
    depends_on:
      - postgres
      - elasticsearch
    networks:
      - equhub-net

networks:
  equhub-net:
    driver: bridge

volumes:
  pgdata:
  redisdata:
  esdata:
  rmqdata:
  miniodata:
```

---

## 7.2 Развертывание в Kubernetes (Production Deployment)

Для продакшна используется декларативное развертывание в кластере Kubernetes. Ниже приведен пример манифеста `Deployment` и `Service` для микросервиса **Payment Service** и конфигурации Ingress для маршрутизации.

### 7.2.1 Манифест микросервиса (`payment-service.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
  namespace: equhub
  labels:
    app: payment-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
    spec:
      containers:
      - name: payment-service
        image: ghcr.io/mikola199/equhub/payment-service:v1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8008
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secrets
              key: secret-key
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "200m"
            memory: "256Mi"
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 8008
          initialDelaySeconds: 15
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 8008
          initialDelaySeconds: 20
          periodSeconds: 15
---
apiVersion: v1
kind: Service
metadata:
  name: payment-service
  namespace: equhub
spec:
  selector:
    app: payment-service
  ports:
  - protocol: TCP
    port: 8008
    targetPort: 8008
  type: ClusterIP
```

### 7.2.2 Конфигурация Ingress Маршрутизатора (`ingress.yaml`)

Маршрутизатор с поддержкой SSL-терминации (cert-manager / Let's Encrypt) и маршрутами до микросервисов:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: equhub-ingress
  namespace: equhub
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/enable-cors: "true"
spec:
  tls:
  - hosts:
    - api.equhub.ru
    secretName: equhub-tls-cert
  rules:
  - host: api.equhub.ru
    http:
      paths:
      - path: /api/v1/auth
        pathType: Prefix
        backend:
          service:
            name: auth-service
            port:
              number: 8001
      - path: /api/v1/chats
        pathType: Prefix
        backend:
          service:
            name: chat-service
            port:
              number: 8004
      - path: /api/v1/ads
        pathType: Prefix
        backend:
          service:
            name: market-service
            port:
              number: 8005
      - path: /api/v1/payments
        pathType: Prefix
        backend:
          service:
            name: payment-service
            port:
              number: 8008
```

---

## 7.3 Конфигурация Nginx в качестве API Gateway

Nginx маршрутизирует входящие запросы к микросервисам бэкенда, осуществляет кэширование статики и rate limiting запросов для защиты от DDoS-атак.

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Ограничение частоты запросов (Rate limiting): 100 запросов в секунду с одного IP
    limit_req_zone $binary_remote_addr zone=api_limit_zone:10m rate=100r/s;

    upstream auth_backend {
        server auth-service:8001;
    }

    upstream chat_backend {
        server chat-service:8004;
    }

    upstream market_backend {
        server market-service:8005;
    }

    server {
        listen 80;
        server_name api.equhub.ru;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.equhub.ru;

        ssl_certificate /etc/letsencrypt/live/api.equhub.ru/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.equhub.ru/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Применяем лимиты
        limit_req zone=api_limit_zone burst=50 nodelay;

        location /api/v1/auth/ {
            proxy_pass http://auth_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/v1/chats/ {
            proxy_pass http://chat_backend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
        }

        location /api/v1/ads/ {
            proxy_pass http://market_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```
