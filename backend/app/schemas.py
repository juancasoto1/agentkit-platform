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
