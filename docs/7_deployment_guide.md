# 7. Документация по Развёртыванию EQUHUB

## 7.1 Развёртывание через Docker Compose (Локальная / Staging среда)

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: equhub-postgres
    environment:
      POSTGRES_DB: equhub_db
      POSTGRES_USER: equhub_user
      POSTGRES_PASSWORD: secret_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: equhub-redis
    ports:
      - "6379:6379"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: equhub-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  web-frontend:
    build: .
    container_name: equhub-web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=super_secret_hs256_key
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

### Инструкция по запуску
```bash
# 1. Сборка и запуск контейнеров
docker-compose up -d --build

# 2. Проверка статуса сервисов
docker-compose ps
```

---

## 7.2 Конфигурация Nginx Reverse Proxy (Production)

```nginx
server {
    listen 80;
    server_name api.equhub.ru equhub.ru;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name equhub.ru;

    ssl_certificate /etc/letsencrypt/live/equhub.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/equhub.ru/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
