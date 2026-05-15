"""
Esquemas Pydantic para validación de requests/responses
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ============= AUTH =============

class UserRegisterRequest(BaseModel):
    """Request para registro de usuario"""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Mínimo 8 caracteres")
    full_name: str = Field(..., min_length=2)
    company_name: str = Field(..., min_length=2)


class UserLoginRequest(BaseModel):
    """Request para login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Response con datos del usuario"""
    id: int
    email: str
    full_name: Optional[str]
    role: str
    company_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Response con token JWT"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    """Request para refrescar token"""
    refresh_token: str


# ============= COMPANY =============

class CompanyResponse(BaseModel):
    """Response con datos de empresa"""
    id: int
    name: str
    plan: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============= AGENTS =============

class AgentCreateRequest(BaseModel):
    """Request para crear agente"""
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    system_prompt: str = Field(..., min_length=10, description="Instrucciones para el agente")
    whatsapp_provider: str = Field(default="twilio", pattern="^(twilio|meta)$")


class AgentUpdateRequest(BaseModel):
    """Request para actualizar agente"""
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None


class TwilioConfigRequest(BaseModel):
    """Request para configurar Twilio"""
    account_sid: str = Field(..., min_length=1)
    auth_token: str = Field(..., min_length=1)
    phone_number: str = Field(..., min_length=1)


class MetaConfigRequest(BaseModel):
    """Request para configurar Meta"""
    access_token: str = Field(..., min_length=1)
    phone_number_id: str = Field(..., min_length=1)
    verify_token: str = Field(..., min_length=1)


class AgentResponse(BaseModel):
    """Response con datos del agente"""
    id: int
    name: str
    description: Optional[str]
    system_prompt: str
    whatsapp_provider: str
    is_active: bool
    webhook_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Response con un mensaje"""
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    """Response con datos de conversación"""
    id: int
    agent_id: int
    phone_number: str
    client_name: Optional[str]
    last_message_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationDetailResponse(ConversationResponse):
    """Response con conversación y sus mensajes"""
    messages: list[MessageResponse] = []
