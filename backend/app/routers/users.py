from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api", tags=["reference-data"])


@router.get("/villages", response_model=List[schemas.VillageOut])
def list_villages(
    district: str | None = None,
    tehsil: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Village)
    if district:
        q = q.filter(models.Village.district == district)
    if tehsil:
        q = q.filter(models.Village.tehsil == tehsil)
    return q.order_by(models.Village.name).all()


@router.post("/villages", response_model=schemas.VillageOut)
def create_village(payload: schemas.VillageCreate, db: Session = Depends(get_db)):
    """
    Public (no-auth) endpoint used during registration when a citizen's
    village isn't already listed. Get-or-create by (name, district, tehsil)
    so re-submitting the same village name doesn't create duplicates.
    """
    existing = (
        db.query(models.Village)
        .filter(
            models.Village.name == payload.name,
            models.Village.district == payload.district,
            models.Village.tehsil == payload.tehsil,
        )
        .first()
    )
    if existing:
        return existing

    village = models.Village(
        name=payload.name,
        district=payload.district,
        tehsil=payload.tehsil,
        union_council=payload.union_council,
    )
    db.add(village)
    db.commit()
    db.refresh(village)
    return village


@router.get("/departments", response_model=List[schemas.DepartmentOut])
def list_departments(village_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Department)
    if village_id:
        q = q.filter(models.Department.village_id == village_id)
    return q.all()


@router.get("/admin/users", response_model=List[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("village_admin")),
):
    return db.query(models.User).filter(models.User.village_id == current_user.village_id).all()
