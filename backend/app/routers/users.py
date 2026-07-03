from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api", tags=["reference-data"])


@router.get("/villages", response_model=List[schemas.VillageOut])
def list_villages(db: Session = Depends(get_db)):
    return db.query(models.Village).all()


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
