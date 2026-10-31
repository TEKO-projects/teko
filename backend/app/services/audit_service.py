"""Auditoría de correo: lectura de todo lo recibido y enviado, sin tocar nada.

A diferencia de Correos, aquí no se cambia el estado de leído de nadie ni se
puede responder: solo se consulta.
"""
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.email_message import EmailMessage
from app.models.mailbox import Mailbox, MailboxMessage
from app.repositories import email_message_repository
from app.core.config import settings
from app.schemas.audit import AuditEmailDetail, AuditEmailItem, InboundStatus, InboundWebhookEvent
from app.services import inbound_monitor


def _owners(db: Session, ids: list[int]) -> dict[int, list[str]]:
    if not ids:
        return {}
    rows = (
        db.query(MailboxMessage.email_message_id, Mailbox.address)
        .join(Mailbox, Mailbox.id == MailboxMessage.mailbox_id)
        .filter(MailboxMessage.email_message_id.in_(ids))
        .order_by(Mailbox.address)
        .all()
    )
    owners: dict[int, list[str]] = {}
    for message_id, address in rows:
        owners.setdefault(message_id, []).append(address)
    return owners


def _scope(message: EmailMessage, owners: list[str]) -> str:
    """general: dirección compartida; personal: de un buzón; unassigned: recibido en una dirección sin buzón."""
    if message.is_general:
        return "general"
    return "personal" if owners else "unassigned"


def list_emails(db: Session, *, direction: str | None, search: str | None, mailbox: str | None, limit: int, offset: int) -> list[AuditEmailItem]:
    query = db.query(EmailMessage)
    if direction:
        query = query.filter(EmailMessage.direction == direction)
    if search:
        pattern = f"%{search}%"
        query = query.filter(or_(
            EmailMessage.from_email.ilike(pattern),
            EmailMessage.to_email.ilike(pattern),
            EmailMessage.subject.ilike(pattern),
            EmailMessage.text_body.ilike(pattern),
        ))
    if mailbox == "general":
        query = query.filter(EmailMessage.is_general.is_(True))
    elif mailbox == "unassigned":
        any_link = db.query(MailboxMessage.email_message_id)
        query = query.filter(EmailMessage.direction == "inbound", EmailMessage.is_general.is_(False), EmailMessage.id.notin_(any_link))
    elif mailbox:
        linked = (
            db.query(MailboxMessage.email_message_id)
            .join(Mailbox, Mailbox.id == MailboxMessage.mailbox_id)
            .filter(Mailbox.address == mailbox.lower())
        )
        query = query.filter(EmailMessage.id.in_(linked))

    messages = query.order_by(EmailMessage.created_at.desc(), EmailMessage.id.desc()).offset(offset).limit(limit).all()
    owners = _owners(db, [message.id for message in messages])
    return [
        AuditEmailItem.model_validate(message).model_copy(update={"owners": owners.get(message.id, []), "scope": _scope(message, owners.get(message.id, []))})
        for message in messages
    ]


def get_email(db: Session, email_id: int) -> AuditEmailDetail:
    message = email_message_repository.get_by_id(db, email_id)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Correo no encontrado")
    owners = _owners(db, [message.id])
    return AuditEmailDetail.model_validate(message).model_copy(update={"owners": owners.get(message.id, []), "scope": _scope(message, owners.get(message.id, []))})


def inbound_status(db: Session) -> InboundStatus:
    """Estado de la recepción de correo, para saber si Resend está entregando."""
    inbound = db.query(EmailMessage).filter(EmailMessage.direction == "inbound")
    last = inbound.order_by(EmailMessage.created_at.desc(), EmailMessage.id.desc()).first()
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    return InboundStatus(
        webhook_secret_configured=bool(settings.RESEND_WEBHOOK_SECRET),
        api_key_configured=bool(settings.RESEND_API_KEY),
        general_address=settings.RESEND_FROM_EMAIL or None,
        last_inbound_at=last.created_at if last else None,
        last_inbound_to=last.to_email if last else None,
        last_inbound_error=last.error_message if last else None,
        inbound_24h=inbound.filter(EmailMessage.created_at >= since).with_entities(func.count(EmailMessage.id)).scalar() or 0,
        inbound_total=inbound.with_entities(func.count(EmailMessage.id)).scalar() or 0,
        api_started_at=inbound_monitor.STARTED_AT,
        webhooks=[InboundWebhookEvent(**item) for item in inbound_monitor.recent()],
    )
