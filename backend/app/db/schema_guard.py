"""Red de seguridad del esquema de PostgreSQL al arrancar la API.

Las migraciones de Alembic son la vía normal. Pero si la base que usa el servicio
quedó atrás de lo que el código espera (por ejemplo, la migración se corrió contra
otra base, o la tabla de versiones no coincide con las columnas reales), cualquier
consulta que toque la columna que falta devuelve 500, incluido el correo entrante.

Esto añade lo que falte, sin tocar datos y de forma idempotente (IF NOT EXISTS),
sobre la misma base que usa el servicio. Solo cubre lo agregado por las migraciones
f2a6c1d8b9e0 (plantillas) y a8d3f5b7c2e1 (buzones de usuarios del CMS).
"""
import logging

from sqlalchemy import text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

STATEMENTS = [
    # a8d3f5b7c2e1: buzones para usuarios del CMS
    "ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS admin_user_id INTEGER",
    "ALTER TABLE mailboxes ALTER COLUMN planner_user_id DROP NOT NULL",
    "CREATE UNIQUE INDEX IF NOT EXISTS ix_mailboxes_admin_user_id ON mailboxes (admin_user_id)",
    """DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mailboxes_admin_user_id') THEN
           ALTER TABLE mailboxes ADD CONSTRAINT fk_mailboxes_admin_user_id
             FOREIGN KEY (admin_user_id) REFERENCES admin_users (id) ON DELETE SET NULL;
         END IF;
       END $$""",
    # f2a6c1d8b9e0: plantillas por ocasión y firmas con estilo
    "ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS occasion VARCHAR(40)",
    "ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS kicker VARCHAR(80)",
    "ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS headline VARCHAR(160)",
    "ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS button_label VARCHAR(40)",
    "ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS button_url VARCHAR(500)",
    "ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS signature_style VARCHAR(12) NOT NULL DEFAULT 'texto'",
    "ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS signature_card JSON",
]


def ensure_schema(engine: Engine) -> int:
    """Aplica lo que falte. Devuelve cuántas sentencias cambiaron algo (según un chequeo previo)."""
    if engine.dialect.name != "postgresql":
        return 0
    with engine.connect() as probe:
        mailbox_cols = {row[0] for row in probe.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'mailboxes'"))}
        template_cols = {row[0] for row in probe.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'email_templates'"))}
    missing = []
    if mailbox_cols and "admin_user_id" not in mailbox_cols:
        missing.append("mailboxes.admin_user_id")
    if template_cols and "signature_style" not in template_cols:
        missing.append("email_templates.signature_style")
    if not missing:
        return 0
    logger.warning("Esquema atrasado respecto al código (%s): se repara al arrancar.", ", ".join(missing))
    with engine.begin() as conn:
        for statement in STATEMENTS:
            conn.execute(text(statement))
    return len(missing)
