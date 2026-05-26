# NeoSuperApp 🚀

Enterprise-grade SuperApp ecosystem combining the power of **Telegram**, **Avito**, and **WhatsApp**.

## Modules
- **Messenger:** Realtime messaging with WebSocket support (Go-based).
- **Marketplace:** Scalable platform for listings with AI-enhanced discovery.
- **Jobs:** Integrated recruitment platform for vacancies and resumes.
- **AI Ecosystem:** Automated moderation and personalized recommendations.

## Architecture
- **Monorepo:** Managed with npm workspaces.
- **Microservices:** Multi-language backend (Python, Go, Node.js).
- **Frontend:** Next.js 14 (App Router) + TypeScript.
- **Infrastructure:** Docker Compose & Kubernetes ready.

## Project Structure
- `apps/web`: Next.js frontend and API Gateway.
- `services/auth-service`: FastAPI authentication service.
- `services/market-service`: Express marketplace service.
- `services/chat-service`: Go WebSocket chat service.
- `services/ai-service`: FastAPI AI tools.
- `infrastructure/`: Docker and Kubernetes configurations.

## Getting Started

### Local Development
```bash
npm install
npm run dev --prefix apps/web
```

### Docker Orchestration
```bash
cd infrastructure/docker
docker-compose up --build
```

Откройте: `http://localhost:3000`

## Масштабирование (рекомендации)

- Подключить PostgreSQL (Prisma/Drizzle) и вынести доменную логику в сервисы.
- Добавить Redis для кэша и очередей модерации/уведомлений.
- Интегрировать реальный AI-пайплайн (OpenAI/Vision + anti-fraud rules).
- Добавить E2E и интеграционные тесты, rate-limit, аудит логов и RBAC.
