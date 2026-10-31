from datetime import datetime

from pydantic import BaseModel

from app.schemas.email_message import EmailMessageDetail, EmailMessageListItem


class AuditEmailItem(EmailMessageListItem):
    # Direcciones institucionales en cuyo buzón está el correo (enviado o recibido).
    owners: list[str] = []
    # "general": dirección compartida del CMS; "personal": de un buzón; "unassigned": recibido en una dirección sin buzón.
    scope: str = "general"


class AuditEmailDetail(EmailMessageDetail):
    owners: list[str] = []
    scope: str = "general"


class InboundWebhookEvent(BaseModel):
    at: datetime
    outcome: str
    event: str | None = None
    detail: str | None = None


class InboundStatus(BaseModel):
    webhook_secret_configured: bool
    api_key_configured: bool
    general_address: str | None = None
    last_inbound_at: datetime | None = None
    last_inbound_to: str | None = None
    last_inbound_error: str | None = None
    inbound_24h: int = 0
    inbound_total: int = 0
    api_started_at: datetime
    webhooks: list[InboundWebhookEvent] = []
