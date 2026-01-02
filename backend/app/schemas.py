from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class JournalBase(BaseModel):
    """Base schema for Journal with common attributes"""
    client_id: str
    prompt: str
    text: str
    timestamp: int  # Milliseconds since epoch

class JournalCreate(JournalBase):
    """Schema for creating a new journal entry"""
    pass

class JournalUpdate(BaseModel):
    """Schema for updating an existing journal entry"""
    prompt: Optional[str] = None
    text: Optional[str] = None
    timestamp: Optional[int] = None

class Journal(JournalBase):
    """Schema for journal response (includes server fields)"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows ORM model conversion

class JournalListResponse(BaseModel):
    """Schema for list of journals response"""
    journals: list[Journal]
    count: int
