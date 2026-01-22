from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class UserBase(SQLModel):
    email: str = Field(index=True, unique=True, max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(UserBase):
    password: str = Field(min_length=6, description="Password must be at least 6 characters long (no maximum length)")


class UserLogin(SQLModel):
    email: str
    password: str


class UserPublic(UserBase):
    id: int
    created_at: datetime


class ForgotPasswordRequest(SQLModel):
    email: str


