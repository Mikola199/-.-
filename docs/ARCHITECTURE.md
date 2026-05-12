# GLock Connect Architecture

## Overview
GLock Connect is a highly scalable communication platform designed for messaging, VoIP, dating, and social networking.

## Tech Stack
- **Backend**: Python FastAPI (Microservices)
- **Realtime Core**: C++ (WebSocket Engine, WebRTC)
- **Frontend**: Next.js (Web), Flutter (Mobile), Electron (Desktop)
- **Database**: PostgreSQL (Users/Business data), Redis (Presence/Cache), Kafka (Event bus)
- **Infrastructure**: Docker, Kubernetes

## Service Directory
- `backend/auth-service`: Handles JWT-based authentication and user sessions.
- `backend/api-gateway`: Unified entry point for all REST API calls.
- `realtime/websocket-core`: High-performance C++ engine for real-time messaging.
- `frontend/web`: Modern web interface built with React and Next.js.

## Deployment
Use `docker-compose up` for local development. Kubernetes manifests are provided in `infrastructure/kubernetes` for production deployment.
