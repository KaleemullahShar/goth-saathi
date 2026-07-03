"""
SQLAlchemy models. Mirrors the entity design in PRD Section 18
(scoped down to the tables Phase 1 needs: users, villages, departments,
complaints + status history + media, announcements, notifications).
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, Integer
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class RoleEnum(str, enum.Enum):
    citizen = "citizen"
    government_officer = "government_officer"
    village_admin = "village_admin"


class ComplaintCategory(str, enum.Enum):
    road = "road"
    garbage = "garbage"
    water = "water"
    electricity = "electricity"
    street_light = "street_light"
    drainage = "drainage"
    public_safety = "public_safety"
    other = "other"


class ComplaintStatus(str, enum.Enum):
    submitted = "submitted"
    under_review = "under_review"
    in_progress = "in_progress"
    resolved = "resolved"
    rejected = "rejected"


class Village(Base):
    __tablename__ = "villages"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    union_council = Column(String, nullable=True)
    district = Column(String, nullable=True)

    departments = relationship("Department", back_populates="village")
    users = relationship("User", back_populates="village")


class Department(Base):
    __tablename__ = "departments"
    id = Column(String, primary_key=True, default=gen_uuid)
    village_id = Column(String, ForeignKey("villages.id"), nullable=False)
    name = Column(String, nullable=False)
    sla_hours = Column(Integer, default=72)

    village = relationship("Village", back_populates="departments")
    officers = relationship("User", back_populates="department")


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.citizen)
    village_id = Column(String, ForeignKey("villages.id"), nullable=True)
    department_id = Column(String, ForeignKey("departments.id"), nullable=True)
    preferred_language = Column(String, default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    village = relationship("Village", back_populates="users")
    department = relationship("Department", back_populates="officers")
    complaints = relationship(
        "Complaint", back_populates="citizen",
        foreign_keys="Complaint.citizen_id"
    )


class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(String, primary_key=True, default=gen_uuid)
    citizen_id = Column(String, ForeignKey("users.id"), nullable=False)
    village_id = Column(String, ForeignKey("villages.id"), nullable=False)
    department_id = Column(String, ForeignKey("departments.id"), nullable=True)
    category = Column(Enum(ComplaintCategory), nullable=False)
    description_text = Column(Text, nullable=False)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.submitted)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    location_label = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    citizen = relationship("User", back_populates="complaints", foreign_keys=[citizen_id])
    department = relationship("Department")
    village = relationship("Village")
    status_history = relationship(
        "ComplaintStatusHistory", back_populates="complaint",
        cascade="all, delete-orphan"
    )


class ComplaintStatusHistory(Base):
    __tablename__ = "complaint_status_history"
    id = Column(String, primary_key=True, default=gen_uuid)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    old_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    changed_by = Column(String, ForeignKey("users.id"), nullable=False)
    note = Column(Text, nullable=True)
    changed_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="status_history")


class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(String, primary_key=True, default=gen_uuid)
    village_id = Column(String, ForeignKey("villages.id"), nullable=False)
    posted_by = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    related_entity_type = Column(String, nullable=True)
    related_entity_id = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
