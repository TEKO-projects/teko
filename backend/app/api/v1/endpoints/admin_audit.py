from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.audit import AuditEmailDetail, AuditEmailItem
from app.security.dependencies import get_current_admin
from app.services import audit_service

# Solo lectura. Cualquier administrador del CMS puede auditar el correo de todos.
router = APIRouter(
    prefix="/admin/audit",
    tags=["Admin - Auditoría"],
)


@router.get("/emails", response_model=list[AuditEmailItem])
def list_emails(
    direction: str | None = Query(default=None, pattern="^(inbound|outbound)$"),
    search: str | None = Query(default=None, max_length=200),
    mailbox: str | None = Query(default=None, max_length=320, description="'general' o la dirección de un buzón"),
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    return audit_service.list_emails(db, direction=direction, search=search, mailbox=mailbox, limit=limit, offset=offset)


@router.get("/emails/{email_id}", response_model=AuditEmailDetail)
def get_email(email_id: int, db: Session = Depends(get_db), current_admin=Depends(get_current_admin)):
    return audit_service.get_email(db, email_id)
