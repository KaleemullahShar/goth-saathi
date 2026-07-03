# Goth Saathi — Phase 1 Prototype

A working local build of the **Phase 1 civic backbone** described in the Goth Saathi
PRD: authentication, RBAC, the full complaint report → route → track → resolve
loop, village announcements, and in-app notifications — for three roles
(**Citizen**, **Government Officer**, **Village Administrator**).

There is **no AI in this build**. That's intentional — see PRD Section 20.1:
Phase 1 exists to prove the civic workflow backbone works end-to-end before
layering the multi-agent AI system on top in Phase 2.

## Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite (stand-in for PostgreSQL — same
  schema shape as PRD Section 18, zero external infra required to run it)
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS, styled to
  the design tokens in PRD Section 9
- **Auth:** JWT (email + password). Google OAuth is specified in the PRD but
  not implemented here — it requires a registered OAuth app/client ID which is
  environment-specific and out of scope for a local prototype.

## Project layout

```
goth-saathi/
├── backend/
│   ├── app/
│   │   ├── main.py            FastAPI app + router wiring
│   │   ├── models.py          SQLAlchemy models (users, complaints, etc.)
│   │   ├── schemas.py         Pydantic request/response schemas
│   │   ├── auth.py            JWT + password hashing + RBAC dependency
│   │   ├── seed.py            Creates 1 pilot village + 3 demo accounts
│   │   └── routers/           auth, users, complaints, announcements,
│   │                          notifications, analytics
│   ├── requirements.txt
│   └── uploads/                complaint photos land here
└── frontend/
    └── src/
        ├── app/
        │   ├── login/, register/
        │   ├── citizen/        dashboard, complaints, announcements
        │   ├── officer/        department-scoped complaint queue
        │   └── admin/          village-wide analytics, complaints,
        │                       announcements, users
        ├── components/         Button, Card, StatusBadge, Navbar, etc.
        └── lib/                api client, auth context, shared types
```

## Running it locally

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed              # creates goth_saathi.db + demo accounts
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000` (interactive docs at `/docs`).

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. It talks to the backend at
`http://localhost:8000` via `NEXT_PUBLIC_API_BASE` in `.env.local` — change
that if you run the backend elsewhere.

## Demo accounts

The seed script creates one pilot village ("Goth Muhammad Panhwar, UC-14
Rohri") with six departments, and one account per role. Password is the same
for all three:

| Role | Email | Password |
|---|---|---|
| Citizen | `citizen@gothsaathi.pk` | `GothSaathi123!` |
| Government Officer (Public Works) | `officer@gothsaathi.pk` | `GothSaathi123!` |
| Village Administrator | `admin@gothsaathi.pk` | `GothSaathi123!` |

The login page has one-click buttons that fill these in for you.

## Suggested walkthrough

1. **Log in as the citizen.** Report an issue (try "Street Light" — it auto-
   routes to the Electricity department) with a description and optionally a
   photo. Track its status on the complaint detail page.
2. **Log in as the officer.** You'll only see complaints routed to your
   department (Public Works) — the street light complaint above won't appear
   here, since it's an Electricity issue. Try creating a "Road Damage"
   complaint as the citizen to see it land in the officer's queue, then walk
   it through Submitted → Under Review → In Progress → Resolved.
3. **Log in as the admin.** See the village-wide analytics (category
   breakdown, status breakdown, resolution time), post an announcement, and
   confirm the citizen account receives a notification for it.
4. **Check RBAC:** try hitting `http://localhost:8000/api/complaints` as the
   officer via `/docs` — you'll only get complaints scoped to their
   department, never another department's or another village's, because
   scoping is enforced server-side (PRD Section 15.2), not just hidden in the
   UI.

## What's simplified vs. the full PRD

These are deliberate Phase 1 scoping decisions, not oversights:

- **3 roles implemented** (Citizen, Government Officer, Village Admin) of the
  8 in the PRD — Farmer/Student/Teacher/Healthcare Worker/NGO dashboards are
  Phase 3 per the roadmap.
- **SQLite instead of PostgreSQL** — same schema shape, zero setup. Swapping
  the `DATABASE_URL` in `backend/app/database.py` to a Postgres connection
  string is close to a drop-in change since the app uses SQLAlchemy ORM
  throughout, not raw SQLite-specific SQL.
- **No AI agents** — categorization, duplicate detection, and priority
  scoring are Phase 2 work; category → department routing here is a fixed
  lookup table (see `CATEGORY_DEPARTMENT_MAP` in
  `backend/app/routers/complaints.py`), which is explicitly the pre-AI
  fallback the PRD describes.
- **Notifications are in-app only** (bell icon, polled every 15s) — no real
  push/email/SMS delivery, since those need external provider accounts.
  The data model (`notifications` table) matches PRD Section 18.5 so wiring
  in a real provider later doesn't require a schema change.
- **Self-service registration for all 3 roles** — the PRD specifies
  Officer/Admin accounts should be invite-only in production (Section 10.9);
  registration is left open here so you can try every role without needing
  an invite system built first. This is called out on the register page.
- **Google OAuth not implemented** — email/password only, since OAuth needs
  a registered client ID per deployment.
- A few `npm audit` warnings remain in dev-tooling transitive dependencies
  (require Next 15 to fully clear); not addressed here since they don't
  affect this prototype's runtime security posture.

## Where this fits in the roadmap

This is the **Phase 1 exit criteria** from the PRD: *"a citizen in the pilot
village can report a complaint with a photo, an Officer can see and update
it, and the citizen receives a notification on status change — with zero AI
involvement."* That's what's running here. Phase 2 (multi-agent AI,
RAG-grounded answers, OCR, voice, multilingual support) builds on top of this
backbone without needing to change it.
