import secrets

from sqlalchemy.orm import Session

from app.models.admin_user import AdminUser
from app.repositories import admin_user_repository, mailbox_repository
from app.security.hashing import hash_password, verify_password
from app.security.jwt import create_access_token
from app.services import planner_client

# "Mantener sesión iniciada": el token dura 30 días en vez de ACCESS_TOKEN_EXPIRE_MINUTES.
REMEMBER_MINUTES = 60 * 24 * 30


class AccessDenied(Exception):
    """La cuenta existe pero no tiene acceso al CMS."""


def issue_token(admin: AdminUser, remember: bool = False) -> str:
    return create_access_token(subject=admin.email, minutes=REMEMBER_MINUTES if remember else None)


def _login_local(db: Session, email: str, password: str, remember: bool):
    admin = admin_user_repository.get_by_email(db, email)

    if not admin:
        return None

    if not admin.is_active:
        return None

    if not verify_password(password, admin.password_hash):
        return None

    return issue_token(admin, remember)


def login(db: Session, email: str, password: str, remember: bool = False):
    if planner_client.enabled():
        return _login_via_planner(db, email, password, remember)

    return _login_local(db, email, password, remember)


def _link_planner_mailbox(db: Session, admin: AdminUser, planner_user_id: str) -> None:
    """Quien entra con su cuenta del Planner ve su propio buzón en Correos > Mi correo."""
    if not planner_user_id or mailbox_repository.get_by_admin_user(db, admin.id):
        return
    mailbox = mailbox_repository.get_by_planner_user(db, planner_user_id)
    if mailbox and mailbox.admin_user_id is None:
        mailbox.admin_user_id = admin.id
        mailbox_repository.save(db, mailbox)


def _login_via_planner(db: Session, email: str, password: str, remember: bool):
    try:
        result, remote = planner_client.verify_login(email, password)
    except planner_client.PlannerError:
        # Sin el Planner, igual entran los administradores creados aquí con contraseña propia.
        token = _login_local(db, email, password, remember)
        if token is None:
            raise
        return token
    if result == "forbidden":
        raise AccessDenied()
    if result != "ok":
        # Los administradores que se crean en el CMS tienen contraseña propia y no existen en el Planner.
        return _login_local(db, email, password, remember)

    admin = admin_user_repository.get_by_email(db, remote["email"])
    if not admin:
        # La contraseña real vive en el Planner; la local es aleatoria para que no sea un acceso alterno.
        admin = AdminUser(email=remote["email"], full_name=remote["name"], password_hash=hash_password(secrets.token_urlsafe(32)), role="admin", is_active=True)
        db.add(admin)
        db.commit()
        db.refresh(admin)
    elif not admin.is_active:
        return None

    _link_planner_mailbox(db, admin, str(remote.get("id") or ""))
    return issue_token(admin, remember)
