# AgentKit Platform — Instrucciones para Claude Code

> Sistema de instrucciones para el desarrollo de la plataforma SaaS de agentes WhatsApp

---

## 📋 Visión General

**AgentKit Platform** es una plataforma SaaS que permite a cualquier empresa crear, gestionar e intervenir agentes de WhatsApp con IA.

### Stack
- **Backend**: FastAPI + SQLAlchemy (Python 3.11+)
- **Frontend**: Next.js + TypeScript + Tailwind
- **Database**: PostgreSQL
- **IA**: Claude API (Anthropic)
- **Deploy**: Railway (backend) + Vercel (frontend)

---

## 🏗️ Estructura del Proyecto

```
agentkit-platform/
├── backend/              (FastAPI)
│   ├── app/
│   │   ├── auth/         # JWT, login, registro
│   │   ├── agents/       # CRUD de agentes
│   │   ├── webhooks/     # Webhook handler (Meta/Twilio)
│   │   ├── conversations/# Historial, WebSockets
│   │   ├── intervention/ # Takeover mode (humano)
│   │   ├── integrations/ # Shopify, etc.
│   │   └── main.py       # App principal
│   ├── core/             # Brain, Memory, Providers (de agentkit)
│   ├── db/               # SQLAlchemy models
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/             (Next.js)
│   ├── app/
│   │   ├── dashboard/    # Vista principal
│   │   ├── login/        # Auth
│   │   ├── agents/       # CRUD agentes
│   │   ├── conversations/# Panel de chat
│   │   └── ...
│   ├── components/
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml
└── README.md
```

---

## ✅ Reglas de Desarrollo

1. **Habla siempre en español** (código, comentarios, mensajes)
2. **NUNCA hardcodees API keys** — siempre via `.env`
3. **Usa async/await** en Python — todo debe ser asyncio-compatible
4. **SQLAlchemy async** — importar de `sqlalchemy.ext.asyncio`
5. **Tipos**: TypeScript obligatorio en frontend, type hints en backend
6. **Tests**: Escribir tests antes de features grandes
7. **No refactorices sin pedir** — mantener pragmatismo
8. **Logs claros**: `logger.info()` para eventos importantes
9. **CORS**: Desarrollado con `*`, producción con dominio específico
10. **Contraseñas**: Siempre hashear con `passlib[bcrypt]`

---

## 📊 Modelos de Base de Datos (Objetivo)

```python
# users.py
User:
  - id (pk)
  - email (unique)
  - password_hash
  - company_id (fk)
  - role (admin | agent | viewer)
  - created_at
  - updated_at

Company:
  - id (pk)
  - name
  - plan (free | pro | enterprise)
  - created_at

Agent:
  - id (pk)
  - company_id (fk)
  - name
  - prompt
  - whatsapp_provider (meta | twilio)
  - status (active | inactive)
  - created_at

Conversation:
  - id (pk)
  - agent_id (fk)
  - phone_number
  - created_at
  - updated_at

Message:
  - id (pk)
  - conversation_id (fk)
  - role (user | assistant | human_agent)
  - content
  - timestamp

Integration:
  - id (pk)
  - company_id (fk)
  - type (meta | twilio | shopify)
  - config (JSON, cifrado)
  - created_at

Intervention:
  - id (pk)
  - conversation_id (fk)
  - user_id (fk)
  - started_at
  - ended_at
```

---

## 🎯 Fases de Desarrollo

### **Fase 1: MVP Mínimo** (2-3 semanas)
- [x] Estructura base (hecho)
- [ ] Auth backend (JWT + login/signup)
- [ ] Dashboard frontend (login page)
- [ ] Webhooks (Meta/Twilio)
- [ ] WebSocket para conversaciones en vivo
- [ ] Intervención humana básica (takeover)

### **Fase 2: Admin Completo** (1-2 semanas)
- [ ] CRUD de agentes
- [ ] Editor de prompts
- [ ] Gestión de usuarios
- [ ] Integraciones (Shopify)
- [ ] Analytics básicos

### **Fase 3: Escalabilidad** (1-2 semanas)
- [ ] Multi-workspace
- [ ] Role-based access
- [ ] API pública
- [ ] Logs y auditoría

---

## 🚀 Comandos Útiles

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker-compose up --build

# Tests
pytest backend/

# Migrations (cuando agregues BD)
alembic init migrations
alembic revision --autogenerate -m "Initial"
alembic upgrade head
```

---

## 🔑 Prioridades

1. **Funcionalidad > Perfección**: MVP funcional antes que código perfecto
2. **Seguridad > Comodidad**: Nunca exponer keys ni passwords
3. **Async > Sync**: Todo debe ser async en FastAPI
4. **Tests > Refactoring**: Si no hay tests, no refactorices
5. **Documentación > Código**: Código claro > código comentado

---

## 📞 Preguntas frecuentes

**P: ¿Dónde pongo el código de agentkit?**
→ En `backend/core/` (brain.py, memory.py, providers/, etc.)

**P: ¿Cómo hago WebSocket?**
→ FastAPI: `from fastapi import WebSocket` + `app.websocket("/ws")`

**P: ¿Dónde guardo las conversaciones?**
→ En PostgreSQL, tabla `messages`, indexada por `conversation_id`

**P: ¿Cómo intervengo un chat?**
→ Usuario hace click en "Intervenir" → role pasa a "human_agent" → escribe directamente

---

## 📝 Checklist del Siguiente Paso

- [ ] Crear repo en GitHub
- [ ] Conectar con Railway
- [ ] Implementar auth backend (JWT)
- [ ] Página de login frontend
- [ ] WebSocket para chats en vivo
