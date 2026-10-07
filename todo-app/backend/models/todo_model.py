from sqlmodel import SQLModel, Field, Relationship, DateTime
from typing import Optional
from datetime import datetime, timezone


class TodoBase(SQLModel):
    title: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    completed: bool = Field(default=False)


class Todo(TodoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), sa_type=DateTime(timezone=True))


class TodoCreate(TodoBase):
    pass


class TodoUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    completed: Optional[bool] = Field(default=None)


class TodoPublic(TodoBase):
    id: int
    created_at: datetime
    updated_at: datetime