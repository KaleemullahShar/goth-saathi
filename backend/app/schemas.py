from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ---------- Auth ----------

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "citizen"
    village_id: Optional[str] = None
    department_id: Optional[str] = None
    preferred_language: str = "en"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    village_id: Optional[str]
    department_id: Optional[str]
    preferred_language: str

    class Config:
        from_attributes = True


# ---------- Villages / Departments ----------

class VillageOut(BaseModel):
    id: str
    name: str
    union_council: Optional[str]
    district: Optional[str]

    class Config:
        from_attributes = True


class DepartmentOut(BaseModel):
    id: str
    village_id: str
    name: str
    sla_hours: int

    class Config:
        from_attributes = True


# ---------- Complaints ----------

class ComplaintCreate(BaseModel):
    category: str
    description_text: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    location_label: Optional[str] = None


class ComplaintStatusUpdate(BaseModel):
    new_status: str
    note: Optional[str] = None
    department_id: Optional[str] = None


class StatusHistoryOut(BaseModel):
    id: str
    old_status: Optional[str]
    new_status: str
    note: Optional[str]
    changed_at: datetime
    changed_by_name: Optional[str] = None

    class Config:
        from_attributes = True


class ComplaintOut(BaseModel):
    id: str
    citizen_id: str
    citizen_name: Optional[str] = None
    village_id: str
    department_id: Optional[str]
    department_name: Optional[str] = None
    category: str
    description_text: str
    status: str
    location_lat: Optional[float]
    location_lng: Optional[float]
    location_label: Optional[str]
    photo_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    status_history: List[StatusHistoryOut] = []

    class Config:
        from_attributes = True


# ---------- Announcements ----------

class AnnouncementCreate(BaseModel):
    title: str
    body: str


class AnnouncementOut(BaseModel):
    id: str
    village_id: str
    posted_by: str
    posted_by_name: Optional[str] = None
    title: str
    body: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Notifications ----------

class NotificationOut(BaseModel):
    id: str
    category: str
    title: str
    body: str
    related_entity_type: Optional[str]
    related_entity_id: Optional[str]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
