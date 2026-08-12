# EQUHUB — Единая цифровая платформа

## Документ 7: Спецификация развёртывания (Local & Production Deployment)

### 1. Архитектура развёртывания

Платформа EQUHUB разворачивается локально с использованием **Docker Compose** для быстрого старта разработки, а в промышленной среде — через кластер **Kubernetes (K8s)** для автомасштабирования и высокой отказоустойчивости.

---

### 2. Спецификация локального окружения (`docker-compose.yml`)

Ниже приведена конфигурация для оркестрации всех необходимых баз данных и инфраструктурных компонентов локально. Пароли и секреты вынесены в защищенные переменные окружения, которые должны быть предварительно объявлены в файле `.env` (при отсутствии файла или дефолтных значениях запуск останавливается встроенным скриптом-валидатором):

```yaml
version: '3.8'

services:
  # Реляционная СУБД для хранения транзакций и сущностей
  postgres:
    image: postgres:15-alpine
    container_name: equhub-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      # Защищенный биндинг только на localhost для предотвращения внешнего доступа
      - "127.0.0.1:5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - equhub-net

  # Кэширование сессий, лимитов и WebSocket-подключений
  redis:
    image: redis:7-alpine
    container_name: equhub-redis
    ports:
      # Защищенный биндинг только на localhost
      - "127.0.0.1:6379:6379"
    volumes:
      - redisdata:/data
    networks:
      - equhub-net

  # Полнотекстовый и географический поисковый движок
  elasticsearch:
    image: elasticsearch:8.11.1
    container_name: equhub-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      # Защищенный биндинг только на localhost
      - "127.0.0.1:9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data
    networks:
      - equhub-net

  # S3-совместимое объектное хранилище для аватаров, медиа-постов и резюме
  minio:
    image: minio/minio:RELEASE.2024-01-28T22-41-13Z
    container_name: equhub-minio
    ports:
      # Защищенный биндинг только на localhost
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    command: server /data --console-address ":9001"
    volumes:
      - miniodata:/data
    networks:
      - equhub-net

volumes:
  pgdata:
  redisdata:
  esdata:
  miniodata:

networks:
  equhub-net:
    driver: bridge
```

---

### 3. Маршрутизация на API Gateway (Nginx Configuration)

Конфигурационный файл Nginx перенаправляет внешние запросы клиентов на соответствующие порты микросервисов:

```nginx
server {
    listen 80;
    server_name api.equhub.ru;

    # Auth Service (FastAPI)
    location /api/v1/auth {
        proxy_pass http://auth-service:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # User Service (NestJS)
    location /api/v1/users {
        proxy_pass http://user-service:8002;
        proxy_set_header Host $host;
    }

    # Chat Service (Go & C++)
    location /api/v1/chats {
        proxy_pass http://chat-service:8004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # Marketplace Service (NestJS)
    location /api/v1/ads {
        proxy_pass http://market-service:8005;
        proxy_set_header Host $host;
    }

    # Vacancy Service (NestJS)
    location /api/v1/jobs {
        proxy_pass http://vacancy-service:8006;
        proxy_set_header Host $host;
    }
}
```

---

### 4. Развертывание в Kubernetes (K8s)

В промышленной среде каждый микросервис упаковывается в `Deployment` со следующими параметрами:
*   **ReplicaSet:** Минимально 2 реплики для обеспечения отказоустойчивости (High Availability).
*   **Horizontal Pod Autoscaler (HPA):** Настраивается на автомасштабирование при достижении утилизации CPU более 75%.
*   **Liveness Probe (Проверка жизнеспособности):** Перезапускает зависший/упавший контейнер. Проверка выполняется каждые 15 секунд:
    ```yaml
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 15
    ```
*   **Readiness Probe (Проверка готовности к приему трафика):** Разрешает перенаправление трафика со стороны API Gateway на под только после полного прогрева и готовности коннекторов к БД.
    ```yaml
    readinessProbe:
      httpGet:
        path: /readiness
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 10
    ```
*   **Ingress Controller:** Используется Nginx Ingress с автоматическим получением SSL-сертификатов Let's Encrypt через Cert-Manager.
