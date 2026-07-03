from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth
from app.notifications_util import create_notification

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


@router.post("", response_model=schemas.AnnouncementOut)
def create_announcement(
    payload: schemas.AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("village_admin", "government_officer")),
):
    ann = models.Announcement(
        village_id=current_user.village_id,
        posted_by=current_user.id,
        title=payload.title,
        body=payload.body,
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)

    # Notify every citizen in the village (Phase 1 simplification of the
    # Notification Agent's batching/preference logic — PRD Section 13.3).
    citizens = (
        db.query(models.User)
        .filter(
            models.User.village_id == current_user.village_id,
            models.User.role == models.RoleEnum.citizen,
        )
        .all()
    )
    for c in citizens:
        create_notification(
            db, c.id, "announcement",
            f"New announcement: {payload.title}",
            payload.body[:140],
            "announcement", ann.id,
        )

    out = schemas.AnnouncementOut.model_validate(ann)
    out.posted_by_name = current_user.full_name
    return out


@router.get("", response_model=List[schemas.AnnouncementOut])
def list_announcements(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    anns = (
        db.query(models.Announcement)
        .filter(models.Announcement.village_id == current_user.village_id)
        .order_by(models.Announcement.created_at.desc())
        .all()
    )
    results = []
    for a in anns:
        out = schemas.AnnouncementOut.model_validate(a)
        poster = db.query(models.User).filter(models.User.id == a.posted_by).first()
        out.posted_by_name = poster.full_name if poster else None
        results.append(out)
    return results
