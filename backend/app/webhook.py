"""
Manejador de webhooks de WhatsApp (Twilio, Meta)
Recibe mensajes, procesa con Claude, almacena conversación
"""

import logging
import httpx
from fastapi import APIRouter, Request, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from db.database import get_db
from db.models import Agent, Conversation, Message
from app.security import create_access_token
import base64
import os

logger = logging.getLogger("agentkit")

router = APIRouter(tags=["webhook"])


# ============= TWILIO WEBHOOK =============


def parse_twilio_webhook(form_data: dict) -> dict:
    """
    Parsea mensaje de Twilio
    Formato: From, To, Body, MessageSid
    """
    return {
        "provider": "twilio",
        "phone_number": form_data.get("From", "").replace("whatsapp:", ""),
        "message_text": form_data.get("Body", ""),
        "message_id": form_data.get("MessageSid", ""),
    }


async def send_twilio_message(
    account_sid: str,
    auth_token: str,
    from_number: str,
    to_number: str,
    message: str
) -> bool:
    """Envía mensaje por Twilio WhatsApp"""
    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"

    auth = base64.b64encode(f"{account_sid}:{auth_token}".encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}

    data = {
        "From": f"whatsapp:{from_number}",
        "To": f"whatsapp:{to_number}",
        "Body": message,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=data, headers=headers)
            return response.status_code == 201
    except Exception as e:
        logger.error(f"Error enviando mensaje Twilio: {e}")
        return False


# ============= META WEBHOOK =============


def parse_meta_webhook(body: dict) -> dict | None:
    """
    Parsea mensaje de Meta Cloud API
    Retorna None si no hay mensaje nuevo
    """
    try:
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})

                # Solo procesar mensajes entrantes
                for msg in value.get("messages", []):
                    if msg.get("type") == "text":
                        return {
                            "provider": "meta",
                            "phone_number": msg.get("from", ""),
                            "message_text": msg.get("text", {}).get("body", ""),
                            "message_id": msg.get("id", ""),
                        }
    except Exception as e:
        logger.error(f"Error parseando Meta webhook: {e}")

    return None


async def send_meta_message(
    access_token: str,
    phone_number_id: str,
    to_number: str,
    message: str
) -> bool:
    """Envía mensaje por Meta Cloud API"""
    url = f"https://graph.facebook.com/v21.0/{phone_number_id}/messages"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"body": message},
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            return response.status_code == 200
    except Exception as e:
        logger.error(f"Error enviando mensaje Meta: {e}")
        return False


# ============= MAIN WEBHOOK HANDLER =============


@router.get("/webhook/{agent_id}")
async def webhook_get(agent_id: int, request: Request):
    """
    Verificación GET del webhook (requerido por Meta Cloud API)
    """
    db = request.state.db if hasattr(request.state, "db") else None

    # Obtener agente
    stmt = select(Agent).where(Agent.id == agent_id)
    if db:
        result = await db.execute(stmt)
        agent = result.scalars().first()

        if agent and agent.whatsapp_provider == "meta" and agent.meta_verify_token:
            # Meta verification
            verify_token = request.query_params.get("hub.verify_token")
            challenge = request.query_params.get("hub.challenge")

            if verify_token == agent.meta_verify_token:
                return int(challenge) if challenge else None

    return {"status": "ok"}


@router.post("/webhook/{agent_id}")
async def webhook_post(
    agent_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Manejador principal de webhooks de WhatsApp
    Soporta Twilio y Meta Cloud API
    """

    # Obtener agente
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalars().first()

    if not agent or not agent.is_active:
        raise HTTPException(status_code=404, detail="Agente no encontrado")

    try:
        # Determinar proveedor y parsear mensaje
        if agent.whatsapp_provider == "twilio":
            form_data = await request.form()
            form_dict = dict(form_data)
            msg_data = parse_twilio_webhook(form_dict)

        elif agent.whatsapp_provider == "meta":
            body = await request.json()
            msg_data = parse_meta_webhook(body)

        else:
            raise HTTPException(status_code=400, detail="Proveedor no soportado")

        # Si no hay mensaje, retornar OK
        if not msg_data:
            return {"status": "ok"}

        phone_number = msg_data["phone_number"]
        message_text = msg_data["message_text"]
        message_id = msg_data["message_id"]

        logger.info(f"[{agent.name}] Mensaje de {phone_number}: {message_text}")

        # Obtener o crear conversación
        stmt = select(Conversation).where(
            Conversation.agent_id == agent_id,
            Conversation.phone_number == phone_number
        )
        result = await db.execute(stmt)
        conversation = result.scalars().first()

        if not conversation:
            conversation = Conversation(
                agent_id=agent_id,
                phone_number=phone_number,
            )
            db.add(conversation)
            await db.flush()

        # Guardar mensaje del usuario
        user_msg = Message(
            conversation_id=conversation.id,
            role="user",
            content=message_text,
            whatsapp_message_id=message_id,
        )
        db.add(user_msg)
        await db.flush()

        # Obtener historial de conversación
        stmt = select(Message).where(
            Message.conversation_id == conversation.id
        ).order_by(Message.created_at.desc()).limit(20)
        result = await db.execute(stmt)
        messages = result.scalars().all()
        messages.reverse()  # Orden cronológico

        # Preparar historial para Claude
        history = [
            {"role": msg.role, "content": msg.content}
            for msg in messages[:-1]  # Excluir el mensaje actual (ya lo agregamos)
        ]

        # Generar respuesta con Claude
        response_text = await generate_response_with_claude(
            agent.system_prompt,
            message_text,
            history
        )

        # Guardar respuesta del agente
        assistant_msg = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=response_text,
        )
        db.add(assistant_msg)

        # Actualizar last_message_at
        conversation.last_message_at = datetime.utcnow()

        await db.commit()

        # Enviar respuesta por WhatsApp
        sent = False
        if agent.whatsapp_provider == "twilio":
            sent = await send_twilio_message(
                agent.twilio_account_sid,
                agent.twilio_auth_token,
                agent.twilio_phone_number,
                phone_number,
                response_text
            )
        elif agent.whatsapp_provider == "meta":
            sent = await send_meta_message(
                agent.meta_access_token,
                agent.meta_phone_number_id,
                phone_number,
                response_text
            )

        if sent:
            logger.info(f"[{agent.name}] Respuesta enviada a {phone_number}")
        else:
            logger.error(f"[{agent.name}] Error enviando respuesta a {phone_number}")

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Error procesando webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= CLAUDE API =============


async def generate_response_with_claude(
    system_prompt: str,
    user_message: str,
    history: list[dict]
) -> str:
    """
    Genera respuesta usando Claude API
    """
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    messages = history + [
        {"role": "user", "content": user_message}
    ]

    try:
        response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=system_prompt,
            messages=messages
        )

        return response.content[0].text

    except Exception as e:
        logger.error(f"Error Claude API: {e}")
        return "Lo siento, estoy teniendo problemas técnicos. Por favor intenta de nuevo."
