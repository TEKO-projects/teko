"""Recuperación y cambio de contraseña de administradores del CMS.

El enlace de recuperación es un JWT firmado de 30 minutos que no se guarda en la base
de datos. Lleva una huella del hash de contraseña actual, así que queda inservible en
cuanto la contraseña cambia (un solo uso). El correo se manda directo por Resend y NO
se archiva: no debe quedar el enlace en Enviados ni en Auditoría.
"""
import hashlib
import logging
import threading
import time
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from urllib.parse import quote

from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.admin_user import AdminUser
from app.repositories import admin_user_repository
from app.security.hashing import hash_password
from app.security.jwt import ALGORITHM
from app.services import resend_client
from app.services.email_renderer import render_email
from app.services.resend_client import ResendError

logger = logging.getLogger(__name__)

RESET_TTL = timedelta(minutes=30)
THROTTLE_SECONDS = 60
MIN_LENGTH = 8

_last_request: dict[str, float] = {}
_lock = threading.Lock()


def _fingerprint(admin: AdminUser) -> str:
    return hashlib.sha256(admin.password_hash.encode()).hexdigest()[:24]


def validate_new_password(password: str) -> None:
    if len(password) < MIN_LENGTH:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"La contraseña necesita al menos {MIN_LENGTH} caracteres.")
    if len(password) > 128:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "La contraseña es demasiado larga (máximo 128).")


def _throttled(email: str) -> bool:
    now = time.monotonic()
    with _lock:
        if now - _last_request.get(email, -THROTTLE_SECONDS) < THROTTLE_SECONDS:
            return True
        _last_request[email] = now
        if len(_last_request) > 5000:
            for key in [k for k, t in _last_request.items() if now - t > THROTTLE_SECONDS]:
                _last_request.pop(key, None)
    return False


def create_reset_token(admin: AdminUser) -> str:
    payload = {"sub": admin.email, "pur": "pwreset", "fp": _fingerprint(admin), "exp": datetime.now(timezone.utc) + RESET_TTL}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def _reset_email(admin: AdminUser, link: str) -> tuple[str, str]:
    template = SimpleNamespace(
        name="TEKO", logo_url="https://teko.do/email/teko-logo-white.png", header_background="#0a0e1a", accent_color="#0047ff",
        occasion="Seguridad", kicker="CMS de TEKO", headline="Restablece tu *contraseña*.",
        button_label="Crear nueva contraseña", button_url=link,
        signature="Equipo TEKO", signature_style="texto", signature_card=None,
        footer_text="Si no pediste este cambio, ignora este correo: tu contraseña sigue igual.", social_links=[],
    )
    first_name = (admin.full_name or "").split()[0] if admin.full_name else ""
    greeting = f"Hola {first_name}," if first_name else "Hola,"
    body = (
        f"{greeting}\n\n"
        "Recibimos una solicitud para restablecer la contraseña de tu cuenta del CMS. "
        "El enlace funciona una sola vez y vence en 30 minutos.\n\n"
        f"Si el botón no abre, copia este enlace en tu navegador: {link}"
    )
    return render_email(body=body, subject="Restablece tu contraseña", template=template)


def request_reset(db: Session, email: str) -> None:
    """Siempre termina igual para quien pregunta: no se revela si el correo existe."""
    email = email.strip()
    if not email or _throttled(email.lower()):
        return
    admin = admin_user_repository.get_by_email(db, email)
    if not admin or not admin.is_active:
        return
    if not settings.RESEND_FROM_EMAIL:
        logger.error("No se puede enviar la recuperación de contraseña: falta RESEND_FROM_EMAIL")
        return
    link = f"{settings.CMS_APP_URL.rstrip('/')}?reset={quote(create_reset_token(admin), safe='')}"
    html, text = _reset_email(admin, link)
    try:
        resend_client.send_email(
            sender=f"{settings.RESEND_FROM_NAME} <{settings.RESEND_FROM_EMAIL}>",
            to=[admin.email], subject="Restablece tu contraseña", html=html, text=text,
        )
    except ResendError:
        logger.exception("No se pudo enviar la recuperación de contraseña")


def reset_password(db: Session, token: str, password: str) -> None:
    invalid = HTTPException(status.HTTP_400_BAD_REQUEST, "El enlace no es válido o ya venció. Pide uno nuevo.")
    validate_new_password(password)
    try:
        data = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise invalid from None
    if data.get("pur") != "pwreset":
        raise invalid
    admin = admin_user_repository.get_by_email(db, data.get("sub", ""))
    if not admin or not admin.is_active or data.get("fp") != _fingerprint(admin):
        raise invalid
    admin.password_hash = hash_password(password)
    db.commit()


def set_password(db: Session, target: AdminUser, password: str) -> None:
    validate_new_password(password)
    target.password_hash = hash_password(password)
    db.commit()
