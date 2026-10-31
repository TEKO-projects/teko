from pydantic import BaseModel

from app.schemas.email_message import EmailMessageDetail, EmailMessageListItem


class AuditEmailItem(EmailMessageListItem):
    # Direcciones institucionales en cuyo buzón está el correo (enviado o recibido).
    owners: list[str] = []
    # "general" si es de la dirección compartida del CMS; "personal" si es de un buzón.
    scope: str = "general"


class AuditEmailDetail(EmailMessageDetail):
    owners: list[str] = []
    scope: str = "general"
