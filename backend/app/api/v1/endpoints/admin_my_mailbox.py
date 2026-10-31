from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.mailbox import Mailbox
from app.schemas.email_message import (
    EmailMessageDetail,
    EmailMessageListItem,
    EmailPreview,
    EmailPreviewRequest,
    EmailReadUpdate,
    EmailSendRequest,
)
from app.schemas.mailbox import MyMailbox
from app.security.dependencies import get_current_admin
from app.services import mailbox_service

# Correo institucional del usuario del CMS que inicia sesión. Cada ruta trabaja
# solo sobre su propio buzón: no hay forma de pedir el de otra persona.
router = APIRouter(
    prefix="/admin/my-mailbox",
    tags=["Admin - Mi correo"],
)


def get_my_mailbox(db: Session = Depends(get_db), current_admin=Depends(get_current_admin)) -> Mailbox:
    return mailbox_service.admin_mailbox(db, current_admin.id)


@router.get("", response_model=MyMailbox)
def summary(db: Session = Depends(get_db), current_admin=Depends(get_current_admin)):
    return mailbox_service.admin_mailbox_summary(db, current_admin.id)


@router.get("/messages", response_model=list[EmailMessageListItem])
def list_messages(
    direction: str | None = Query(default=None, pattern="^(inbound|outbound)$"),
    search: str | None = Query(default=None, max_length=200),
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    box: Mailbox = Depends(get_my_mailbox),
):
    return mailbox_service.list_own_messages(db, box, direction=direction, search=search, limit=limit, offset=offset)


@router.post("/messages/preview", response_model=EmailPreview)
def preview(payload: EmailPreviewRequest, db: Session = Depends(get_db), box: Mailbox = Depends(get_my_mailbox)):
    return EmailPreview(html=mailbox_service.preview_for_mailbox(db, box, payload))


@router.get("/messages/{email_id}", response_model=EmailMessageDetail)
def get_message(email_id: int, db: Session = Depends(get_db), box: Mailbox = Depends(get_my_mailbox)):
    return mailbox_service.get_own_message(db, box, email_id)


@router.patch("/messages/{email_id}/read", response_model=EmailMessageDetail)
def mark_read(email_id: int, payload: EmailReadUpdate, db: Session = Depends(get_db), box: Mailbox = Depends(get_my_mailbox)):
    return mailbox_service.mark_own_read(db, box, email_id, payload.is_read)


@router.post("/messages", response_model=EmailMessageDetail, status_code=201)
def send(payload: EmailSendRequest, db: Session = Depends(get_db), box: Mailbox = Depends(get_my_mailbox)):
    return mailbox_service.send_from_mailbox(db, box, payload)
