from sqlalchemy.orm import Session
from app import models


def create_notification(
    db: Session,
    user_id: str,
    category: str,
    title: str,
    body: str,
    related_entity_type: str | None = None,
    related_entity_id: str | None = None,
):
    """
    Phase 1 simplification of the Notification Agent (PRD Section 13): writes
    directly to the notifications table on the same request rather than
    going through an async event queue + Celery worker. The event-driven
    architecture in PRD 17.7 is the intended production design once
    notification volume/channels justify the added infrastructure.
    """
    n = models.Notification(
        user_id=user_id,
        category=category,
        title=title,
        body=body,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id,
    )
    db.add(n)
    db.commit()
    return n
