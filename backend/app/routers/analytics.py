from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, auth

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
def overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("village_admin", "government_officer")),
):
    def scoped(query):
        if current_user.role == models.RoleEnum.government_officer:
            return query.filter(models.Complaint.department_id == current_user.department_id)
        return query.filter(models.Complaint.village_id == current_user.village_id)

    total = scoped(db.query(models.Complaint)).count()

    by_status = dict(
        scoped(db.query(models.Complaint.status, func.count(models.Complaint.id)))
        .group_by(models.Complaint.status)
        .all()
    )
    by_category = dict(
        scoped(db.query(models.Complaint.category, func.count(models.Complaint.id)))
        .group_by(models.Complaint.category)
        .all()
    )

    resolved = scoped(db.query(models.Complaint)).filter(models.Complaint.status == "resolved").all()
    if resolved:
        avg_resolution_hours = sum(
            (c.resolved_at - c.created_at).total_seconds() / 3600
            for c in resolved if c.resolved_at
        ) / len(resolved)
    else:
        avg_resolution_hours = None

    return {
        "total_complaints": total,
        "by_status": {k.value if hasattr(k, "value") else k: v for k, v in by_status.items()},
        "by_category": {k.value if hasattr(k, "value") else k: v for k, v in by_category.items()},
        "avg_resolution_hours": round(avg_resolution_hours, 1) if avg_resolution_hours else None,
        "resolved_count": len(resolved),
    }
