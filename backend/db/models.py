"""
Modelos de la base de datos
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text
from sqlalchemy.orm import relationship
import enum
from db.database import Base


class RoleEnum(str, enum.Enum):
    """Roles de usuario"""
    ADMIN = "admin"
    AGENT = "agent"
    VIEWER = "viewer"


class WhatsAppProviderEnum(str, enum.Enum):
    """Proveedores de WhatsApp soportados"""
    TWILIO = "twilio"
    META = "meta"


class Company(Base):
    """Modelo de empresa"""
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    plan = Column(String(50), default="free")  # free, pro, enterprise
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    agents = relationship("Agent", back_populates="company", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Company {self.name}>"


class User(Base):
    """Modelo de usuario"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    role = Column(String(50), default=RoleEnum.AGENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    company = relationship("Company", back_populates="users")

    def __repr__(self):
        return f"<User {self.email}>"


class Agent(Base):
    """Modelo de agente de WhatsApp"""
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    system_prompt = Column(Text, nullable=False)

    # Configuración de WhatsApp
    whatsapp_provider = Column(Enum(WhatsAppProviderEnum), default=WhatsAppProviderEnum.TWILIO)

    # Credenciales (almacenadas pero no mostradas en respuestas normales)
    twilio_account_sid = Column(String(255), nullable=True)
    twilio_auth_token = Column(String(255), nullable=True)  # Encriptar en producción
    twilio_phone_number = Column(String(20), nullable=True)

    meta_access_token = Column(String(1024), nullable=True)  # Encriptar en producción
    meta_phone_number_id = Column(String(255), nullable=True)
    meta_verify_token = Column(String(255), nullable=True)

    # Webhook
    webhook_url = Column(String(500), nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    company = relationship("Company", back_populates="agents")
    conversations = relationship("Conversation", back_populates="agent", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Agent {self.name}>"


class Conversation(Base):
    """Modelo de conversación con un cliente"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    phone_number = Column(String(20), nullable=False, index=True)

    # Metadata
    client_name = Column(String(255), nullable=True)
    last_message_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    agent = relationship("Agent", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation {self.phone_number}>"


class Message(Base):
    """Modelo de mensaje en una conversación"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)

    role = Column(String(20), nullable=False)  # "user" o "assistant"
    content = Column(Text, nullable=False)

    # Metadata
    whatsapp_message_id = Column(String(255), nullable=True, unique=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message {self.role}>"
