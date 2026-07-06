"""
Seeds a single pilot village with departments and one demo user per role
(citizen, government_officer, village_admin), matching the Phase 1 scope.
Run with: python -m app.seed
"""
from app.database import SessionLocal, engine, Base
from app import models, auth

DEMO_PASSWORD = "GothSaathi123!"


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.Village).first():
            print("Already seeded — skipping.")
            return

        village = models.Village(
            name="Goth Muhammad Panhwar",
            union_council="UC-14 Rohri",
            district="Sukkur",
            tehsil="Rohri",
        )
        db.add(village)
        db.flush()

        dept_names = [
            "Public Works", "Sanitation", "Water & Sanitation",
            "Electricity", "Public Safety", "General Administration",
        ]
        depts = {}
        for name in dept_names:
            d = models.Department(village_id=village.id, name=name, sla_hours=72)
            db.add(d)
            db.flush()
            depts[name] = d

        citizen = models.User(
            full_name="Amina Bhatti",
            email="citizen@gothsaathi.pk",
            password_hash=auth.hash_password(DEMO_PASSWORD),
            role=models.RoleEnum.citizen,
            village_id=village.id,
            preferred_language="en",
        )
        officer = models.User(
            full_name="Bilal Ahmed",
            email="officer@gothsaathi.pk",
            password_hash=auth.hash_password(DEMO_PASSWORD),
            role=models.RoleEnum.government_officer,
            village_id=village.id,
            department_id=depts["Public Works"].id,
            preferred_language="en",
        )
        admin = models.User(
            full_name="Sana Memon",
            email="admin@gothsaathi.pk",
            password_hash=auth.hash_password(DEMO_PASSWORD),
            role=models.RoleEnum.village_admin,
            village_id=village.id,
            preferred_language="en",
        )
        db.add_all([citizen, officer, admin])
        db.commit()

        print("Seed complete.")
        print(f"  Village: {village.name} ({village.id})")
        print("  Demo accounts (password for all: %s):" % DEMO_PASSWORD)
        print("    citizen@gothsaathi.pk   -> Citizen")
        print("    officer@gothsaathi.pk   -> Government Officer (Public Works)")
        print("    admin@gothsaathi.pk     -> Village Administrator")
    finally:
        db.close()


if __name__ == "__main__":
    run()
