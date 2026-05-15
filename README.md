# 🤖 AgentKit Platform

Plataforma SaaS para crear, gestionar e intervenir agentes de WhatsApp con IA.

## 🎯 Características

- ✅ **Dashboard administrativo**: Ver conversaciones en vivo
- ✅ **Intervención humana**: Takeover mode para chats activos
- ✅ **Editor de prompts**: Cambiar comportamiento sin redeploy
- ✅ **Integraciones**: Meta Cloud API, Twilio, Shopify
- ✅ **Gestión de usuarios**: Email/contraseña + roles (Admin, Agent, Viewer)
- ✅ **Analytics**: Métricas de conversaciones y resoluciones
- ✅ **Multi-workspace**: Soporte para múltiples empresas

## 🏗️ Arquitectura

```
agentkit-platform/
├── backend/          (FastAPI + SQLAlchemy)
│   ├── app/
│   │   ├── auth/     (JWT, login, registro)
│   │   ├── agents/   (CRUD de agentes)
│   │   ├── webhooks/ (Webhook handler)
│   │   ├── conversations/
│   │   ├── intervention/
│   │   └── integrations/
│   ├── core/         (Brain, Memory, Providers de agentkit)
│   ├── db/           (SQLAlchemy models)
│   └── requirements.txt
│
├── frontend/         (Next.js + TypeScript)
│   ├── app/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── agents/
│   │   └── conversations/
│   └── package.json
│
└── docker-compose.yml
```

## 🚀 Quick Start

### Requisitos
- Docker y Docker Compose
- Python 3.11+
- Node.js 18+
- Cuenta de Anthropic (para Claude API)

### 1. Clonar y configurar
```bash
git clone https://github.com/tu-usuario/agentkit-platform.git
cd agentkit-platform

# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus API keys

# Frontend
cd frontend
cp .env.example .env.local
```

### 2. Arrancar con Docker Compose
```bash
docker-compose up --build
```

Esto levanta:
- PostgreSQL en `localhost:5432`
- Redis en `localhost:6379`
- Backend FastAPI en `localhost:8000`

### 3. Arrancar frontend (en otra terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend en `localhost:3000`

## 📖 Documentación

Ver `/docs` para detalles de:
- Arquitectura
- API endpoints
- Setup de integraciones
- Deploy a producción

## 🛠️ Stack

| Componente | Tech |
|-----------|------|
| Backend | FastAPI, SQLAlchemy, AsyncIO |
| Frontend | Next.js, React, TypeScript, Tailwind |
| Database | PostgreSQL, Redis |
| Auth | JWT |
| IA | Claude API (Anthropic) |
| Deploy | Railway (backend), Vercel (frontend) |

## 🔐 Variables de entorno

Ver `backend/.env.example` y `frontend/.env.example`

Claves principales:
- `ANTHROPIC_API_KEY`: Tu Claude API key
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret (cambiar en producción)

## 🤝 Contribuir

1. Fork el repo
2. Crea una rama (`git checkout -b feature/mi-feature`)
3. Commits (`git commit -am 'Add feature'`)
4. Push (`git push origin feature/mi-feature`)
5. Open PR

## 📝 Licencia

MIT

---

**Hecho con ❤️ por [Tu Nombre]**
