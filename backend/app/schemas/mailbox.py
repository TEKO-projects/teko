from datetime import datetime

from pydantic import BaseModel, Field, model_validator

# Parte local de la dirección: letras, números y . _ - entre ellas (john.marte, ana_p).
LOCAL_PART = r"^[a-z0-9]+(?:[._-][a-z0-9]+)*$"


class MailboxCreate(BaseModel):
    local_part: str = Field(min_length=1, max_length=64, pattern=LOCAL_PART)
    display_name: str = Field(min_length=1, max_length=150)
    signature: str | None = Field(default=None, max_length=2_000)
    # Dueño del correo: un empleado del Planner o un usuario del CMS, uno solo.
    planner_user_id: str | None = Field(default=None, min_length=1, max_length=64)
    admin_user_id: int | None = Field(default=None, ge=1)

    @model_validator(mode="after")
    def _one_owner(self):
        if (self.planner_user_id is None) == (self.admin_user_id is None):
            raise ValueError("Elige un empleado del Planner o un usuario del CMS.")
        return self


class MailboxUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=150)
    signature: str | None = Field(default=None, max_length=2_000)
    is_active: bool | None = None


class MailboxRead(BaseModel):
    id: int
    address: str
    display_name: str
    signature: str | None
    is_active: bool
    planner_user_id: str | None = None
    admin_user_id: int | None = None
    planner_user_name: str
    planner_user_email: str
    created_at: datetime
    updated_at: datetime
    total_messages: int = 0
    unread_messages: int = 0
    # Solo al habilitar: si se pudo enviar el aviso al correo personal del empleado.
    notice_sent: bool | None = None

    model_config = {"from_attributes": True}


class PlannerUser(BaseModel):
    id: str
    name: str
    email: str
    role: str
    job_title: str | None = None
    mailbox_address: str | None = None


class CmsUser(BaseModel):
    id: int
    name: str
    email: str
    role: str
    mailbox_address: str | None = None


class MailDomain(BaseModel):
    domain: str


class OwnMailbox(BaseModel):
    address: str
    display_name: str
    signature: str | None
    unread: int


class MyMailbox(BaseModel):
    """Estado del correo institucional del usuario del CMS que consulta."""

    enabled: bool
    address: str | None = None
    display_name: str | None = None
    signature: str | None = None
    unread: int = 0


class OwnMailboxUpdate(BaseModel):
    signature: str | None = Field(default=None, max_length=2_000)


class MailboxRequestRead(BaseModel):
    id: int
    planner_user_id: str
    planner_user_name: str
    planner_user_email: str
    status: str
    created_at: datetime
    resolved_at: datetime | None
    # Buzón que ya existe para ese empleado (deshabilitado), para ofrecer "Habilitar".
    mailbox_id: int | None = None
    mailbox_address: str | None = None

    model_config = {"from_attributes": True}


class MailboxRequestUpdate(BaseModel):
    status: str = Field(pattern="^dismissed$")


class OwnMailAccess(BaseModel):
    enabled: bool
    address: str | None = None
    request_status: str | None = None
    requested_at: datetime | None = None
