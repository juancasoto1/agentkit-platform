"""
Rutas para gestión de agentes de WhatsApp
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.schemas import (
    AgentCreateRequest,
    AgentUpdateRequest,
    TwilioConfigRequest,
    MetaConfigRequest,
    AgentResponse,
)
from app.auth.utils import get_current_user
from db.database import get_db
from db.models import Agent, User, Company
import logging
import os

logger = logging.getLogger("agentkit")

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("", response_model=AgentResponse)
async def create_agent(
    request: AgentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Crear nuevo agente de WhatsApp"""

    # Verificar que el usuario sea admin de la empresa
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo admins pueden crear agentes"
        )

    # Crear agente
    agent = Agent(
        company_id=current_user.company_id,
        name=request.name,
        description=request.description,
        system_prompt=request.system_prompt,
        whatsapp_provider=request.whatsapp_provider,
    )

    db.add(agent)
    await db.commit()
    await db.refresh(agent)

    logger.info(f"Agente creado: {agent.name} (ID: {agent.id})")

    return agent


@router.get("", response_model=list[AgentResponse])
async def list_agents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Listar agentes de la empresa del usuario"""

    stmt = select(Agent).where(Agent.company_id == current_user.company_id)
    result = await db.execute(stmt)
    agents = result.scalars().all()

    return agents


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obtener detalles de un agente"""

    stmt = select(Agent).where(
        Agent.id == agent_id,
        Agent.company_id == current_user.company_id
    )
    result = await db.execute(stmt)
    agent = result.scalars().first()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agente no encontrado"
        )

    return agent


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: int,
    request: AgentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Actualizar agente"""

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo admins pueden actualizar agentes"
        )

    stmt = select(Agent).where(
        Agent.id == agent_id,
        Agent.company_id == current_user.company_id
    )
    result = await db.execute(stmt)
    agent = result.scalars().first()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agente no encontrado"
        )

    # Actualizar campos
    if request.name is not None:
        agent.name = request.name
    if request.description is not None:
        agent.description = request.description
    if request.system_prompt is not None:
        agent.system_prompt = request.system_prompt

    await db.commit()
    await db.refresh(agent)

    logger.info(f"Agente actualizado: {agent.name}")

    return agent


@router.post("/{agent_id}/configure/twilio")
async def configure_twilio(
    agent_id: int,
    request: TwilioConfigRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Configurar credenciales de Twilio para un agente"""

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo admins pueden configurar agentes"
        )

    stmt = select(Agent).where(
        Agent.id == agent_id,
        Agent.company_id == current_user.company_id
    )
    result = await db.execute(stmt)
    agent = result.scalars().first()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agente no encontrado"
        )

    # Guardar credenciales
    # TODO: Encriptar credenciales en producción
    agent.twilio_account_sid = request.account_sid
    agent.twilio_auth_token = request.auth_token
    agent.twilio_phone_number = request.phone_number
    agent.whatsapp_provider = "twilio"

    # Generar webhook URL
    agent.webhook_url = f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/webhook/{agent.id}"

    await db.commit()
    await db.refresh(agent)

    logger.info(f"Twilio configurado para agente: {agent.name}")

    return {
        "status": "configured",
        "webhook_url": agent.webhook_url,
        "phone_number": agent.twilio_phone_number
    }


@router.post("/{agent_id}/configure/meta")
async def configure_meta(
    agent_id: int,
    request: MetaConfigRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Configurar credenciales de Meta para un agente"""

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo admins pueden configurar agentes"
        )

    stmt = select(Agent).where(
        Agent.id == agent_id,
        Agent.company_id == current_user.company_id
    )
    result = await db.execute(stmt)
    agent = result.scalars().first()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agente no encontrado"
        )

    # Guardar credenciales
    # TODO: Encriptar credenciales en producción
    agent.meta_access_token = request.access_token
    agent.meta_phone_number_id = request.phone_number_id
    agent.meta_verify_token = request.verify_token
    agent.whatsapp_provider = "meta"

    # Generar webhook URL
    agent.webhook_url = f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/webhook/{agent.id}"

    await db.commit()
    await db.refresh(agent)

    logger.info(f"Meta configurado para agente: {agent.name}")

    return {
        "status": "configured",
        "webhook_url": agent.webhook_url,
        "verify_token": agent.meta_verify_token
    }


@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Eliminar un agente"""

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo admins pueden eliminar agentes"
        )

    stmt = select(Agent).where(
        Agent.id == agent_id,
        Agent.company_id == current_user.company_id
    )
    result = await db.execute(stmt)
    agent = result.scalars().first()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agente no encontrado"
        )

    await db.delete(agent)
    await db.commit()

    logger.info(f"Agente eliminado: {agent.name}")

    return {"status": "deleted"}
