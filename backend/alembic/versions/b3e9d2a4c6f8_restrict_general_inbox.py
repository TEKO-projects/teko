"""keep personal mail out of the shared CMS inbox

Revision ID: b3e9d2a4c6f8
Revises: a8d3f5b7c2e1
Create Date: 2026-10-31 18:00:00.000000

Antes de que existieran los buzones todo el correo recibido quedó como "general"
y los administradores lo veían completo, incluido el de otras personas. Aquí se
saca de General el correo que pertenece a alguien con buzón y se enlaza a su
buzón. Se queda en General lo dirigido a la dirección general o a direcciones
sin dueño.
"""
import re
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.core.config import settings


# revision identifiers, used by Alembic.
revision: str = 'b3e9d2a4c6f8'
down_revision: Union[str, Sequence[str], None] = 'a8d3f5b7c2e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ADDRESS_RE = re.compile(r"[\w.+'-]+@[\w-]+(?:\.[\w-]+)+")


def _addresses(*fields) -> set[str]:
    found: set[str] = set()
    for field in fields:
        if field:
            found.update(match.lower() for match in ADDRESS_RE.findall(field))
    return found


def upgrade() -> None:
    """Upgrade schema (solo datos)."""
    general = (settings.RESEND_FROM_EMAIL or "").strip().lower()
    if not general:
        # Sin la dirección general no se puede distinguir su correo del de las demás: no se toca nada.
        print("RESEND_FROM_EMAIL vacío: no se reclasificó el correo general.")
        return

    conn = op.get_bind()
    owners = {address.lower(): mailbox_id for mailbox_id, address in conn.execute(sa.text("SELECT id, address FROM mailboxes"))}
    rows = conn.execute(sa.text(
        "SELECT id, to_email, cc, bcc, is_read FROM email_messages WHERE direction = 'inbound' AND is_general = :yes"
    ), {"yes": True}).all()

    moved = linked = 0
    for message_id, to_email, cc, bcc, is_read in rows:
        recipients = _addresses(to_email, cc, bcc)
        mailbox_ids = sorted({owners[address] for address in recipients if address in owners})
        if general in recipients or not mailbox_ids:
            continue
        conn.execute(sa.text("UPDATE email_messages SET is_general = :no WHERE id = :id"), {"no": False, "id": message_id})
        moved += 1
        for mailbox_id in mailbox_ids:
            exists = conn.execute(sa.text(
                "SELECT 1 FROM mailbox_messages WHERE mailbox_id = :m AND email_message_id = :e"
            ), {"m": mailbox_id, "e": message_id}).first()
            if not exists:
                conn.execute(sa.text(
                    "INSERT INTO mailbox_messages (mailbox_id, email_message_id, is_read) VALUES (:m, :e, :r)"
                ), {"m": mailbox_id, "e": message_id, "r": bool(is_read)})
                linked += 1
    print(f"Correo reclasificado: {moved} salieron de General, {linked} enlazados a su buzón.")


def downgrade() -> None:
    """Los datos reclasificados no se devuelven a General a propósito: era la fuga."""
