"""
AgentKit Platform — Backend FastAPI
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from db.database import init_db
from app.auth.routes import router as auth_router

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agentkit")

PORT = int(os.getenv("PORT", 8000))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup y shutdown del servidor."""
    logger.info(f"🚀 AgentKit Platform iniciando en puerto {PORT}")
    logger.info(f"Ambiente: {ENVIRONMENT}")

    # Inicializar BD
    await init_db()
    logger.info("✅ Base de datos inicializada")

    yield
    logger.info("🛑 AgentKit Platform detenido")


app = FastAPI(
    title="AgentKit Platform API",
    description="Backend para plataforma de agentes WhatsApp",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ENVIRONMENT == "development" else ["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth_router)


@app.get("/")
async def root():
    """Health check."""
    return {
        "status": "ok",
        "service": "agentkit-platform",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    """Healthcheck para Railway/monitores."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=PORT,
        reload=ENVIRONMENT == "development"
    )
