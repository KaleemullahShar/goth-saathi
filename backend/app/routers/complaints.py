import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models, schemas, auth
from app.notifications_util import create_notification

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads")
UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Category -> default department name mapping. In production this is a
# configurable per-village table (PRD 11.2); hardcoded here for the demo.
CATEGORY_DEPARTMENT_MAP = {
    "road": "Public Works",
    "drainage": "Public Works",
    "garbage": "Sanitation",
    "water": "Water & Sanitation",
    "electricity": "Electricity",
    "street_light": "Electricity",
    "public_safety": "Public Safety",
    "other": "General Administration",
}

VALID_TRANSITIONS = {
    "submitted": {"under_review", "rejected"},
    "under_review": {"in_progress", "rejected"},
    "in_progress": {"resolved", "under_review"},
    "resolved": {"in_progress"},  # allow reopen
    "rejected": {"under_review"},  # allow reconsideration
}


def _serialize(c: models.Complaint) -> schemas.ComplaintOut:
    out = schemas.ComplaintOut.model_validate(c)
    out.citizen_name = c.citizen.full_name if c.citizen else None
    out.department_name = c.department.name if c.department else None
    history = []
    for h in sorted(c.status_history, key=lambda x: x.changed_at):
        item = schemas.StatusHistoryOut.model_validate(h)
        changer = None
        if h.changed_by:
            u = next((u for u in [c.citizen] if u and u.id == h.changed_by), None)
            changer = u.full_name if u else None
        item.changed_by_name = changer
        history.append(item)
    out.status_history = history
    return out


@router.post("", response_model=schemas.ComplaintOut)
def create_complaint(
    payload: schemas.ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("citizen")),
):
    if payload.category not in [c.value for c in models.ComplaintCategory]:
        raise HTTPException(status_code=400, detail="Invalid category.")
    if not current_user.village_id:
        raise HTTPException(status_code=400, detail="User has no assigned village.")

    dept_name = CATEGORY_DEPARTMENT_MAP.get(payload.category, "General Administration")
    dept = (
        db.query(models.Department)
        .filter(
            models.Department.village_id == current_user.village_id,
            models.Department.name == dept_name,
        )
        .first()
    )

    complaint = models.Complaint(
        citizen_id=current_user.id,
        village_id=current_user.village_id,
        department_id=dept.id if dept else None,
        category=payload.category,
        description_text=payload.description_text,
        location_lat=payload.location_lat,
        location_lng=payload.location_lng,
        location_label=payload.location_label,
        status="submitted",
    )
    db.add(complaint)
    db.flush()

    history = models.ComplaintStatusHistory(
        complaint_id=complaint.id,
        old_status=None,
        new_status="submitted",
        changed_by=current_user.id,
        note="Complaint submitted by citizen.",
    )
    db.add(history)
    db.commit()
    db.refresh(complaint)

    # Notify department officers in this village (Phase 1 simplification:
    # notify all officers of the matched department rather than a routing agent)
    if dept:
        officers = (
            db.query(models.User)
            .filter(models.User.department_id == dept.id)
            .all()
        )
        for officer in officers:
            create_notification(
                db, officer.id, "complaint_update",
                "New complaint in your queue",
                f'A new "{payload.category.replace("_", " ")}" complaint was submitted.',
                "complaint", complaint.id,
            )

    return _serialize(complaint)


@router.post("/{complaint_id}/photo", response_model=schemas.ComplaintOut)
def upload_photo(
    complaint_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("citizen")),
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint or complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    allowed_ext = {".jpg", ".jpeg", ".png", ".webp"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail="Only jpg/png/webp images are allowed.")

    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(file.file.read())

    complaint.photo_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(complaint)
    return _serialize(complaint)


@router.get("", response_model=List[schemas.ComplaintOut])
def list_complaints(
    status_filter: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    q = db.query(models.Complaint).options(
        joinedload(models.Complaint.citizen),
        joinedload(models.Complaint.department),
        joinedload(models.Complaint.status_history),
    )

    # Server-side RBAC scoping (PRD 19) — never trust a client filter as the
    # security boundary.
    if current_user.role == models.RoleEnum.citizen:
        q = q.filter(models.Complaint.citizen_id == current_user.id)
    elif current_user.role == models.RoleEnum.government_officer:
        q = q.filter(models.Complaint.department_id == current_user.department_id)
    elif current_user.role == models.RoleEnum.village_admin:
        q = q.filter(models.Complaint.village_id == current_user.village_id)

    if status_filter:
        q = q.filter(models.Complaint.status == status_filter)
    if category:
        q = q.filter(models.Complaint.category == category)

    complaints = q.order_by(models.Complaint.created_at.desc()).all()
    return [_serialize(c) for c in complaints]


@router.get("/{complaint_id}", response_model=schemas.ComplaintOut)
def get_complaint(
    complaint_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    complaint = (
        db.query(models.Complaint)
        .options(
            joinedload(models.Complaint.citizen),
            joinedload(models.Complaint.department),
            joinedload(models.Complaint.status_history),
        )
        .filter(models.Complaint.id == complaint_id)
        .first()
    )
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if current_user.role == models.RoleEnum.citizen and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this complaint.")
    if current_user.role == models.RoleEnum.government_officer and complaint.department_id != current_user.department_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this complaint.")
    if current_user.role == models.RoleEnum.village_admin and complaint.village_id != current_user.village_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this complaint.")

    return _serialize(complaint)


@router.patch("/{complaint_id}/status", response_model=schemas.ComplaintOut)
def update_status(
    complaint_id: str,
    payload: schemas.ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("government_officer", "village_admin")),
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if current_user.role == models.RoleEnum.government_officer and complaint.department_id != current_user.department_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this complaint.")
    if current_user.role == models.RoleEnum.village_admin and complaint.village_id != current_user.village_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this complaint.")

    if payload.new_status not in [s.value for s in models.ComplaintStatus]:
        raise HTTPException(status_code=400, detail="Invalid status.")

    allowed_next = VALID_TRANSITIONS.get(complaint.status.value, set())
    if payload.new_status not in allowed_next:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{complaint.status.value}' to '{payload.new_status}'.",
        )

    old_status = complaint.status.value
    complaint.status = payload.new_status
    if payload.department_id:
        complaint.department_id = payload.department_id
    if payload.new_status == "resolved":
        from datetime import datetime
        complaint.resolved_at = datetime.utcnow()

    history = models.ComplaintStatusHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status=payload.new_status,
        changed_by=current_user.id,
        note=payload.note,
    )
    db.add(history)
    db.commit()
    db.refresh(complaint)

    create_notification(
        db, complaint.citizen_id, "complaint_update",
        "Your complaint status changed",
        f'Your complaint is now "{payload.new_status.replace("_", " ")}".'
        + (f' Note: {payload.note}' if payload.note else ''),
        "complaint", complaint.id,
    )

    complaint = (
        db.query(models.Complaint)
        .options(
            joinedload(models.Complaint.citizen),
            joinedload(models.Complaint.department),
            joinedload(models.Complaint.status_history),
        )
        .filter(models.Complaint.id == complaint_id)
        .first()
    )
    return _serialize(complaint)
