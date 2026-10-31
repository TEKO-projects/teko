from sqlalchemy.orm import Session

from app.models.admin_user import AdminUser


def get_by_email(db: Session, email: str):
    return (
        db.query(AdminUser)
        .filter(AdminUser.email == email)
        .first()
    )

def get_by_id(db: Session, admin_id: int):
    return db.query(AdminUser).filter(AdminUser.id == admin_id).first()


def list_active(db: Session):
    return (
        db.query(AdminUser)
        .filter(AdminUser.is_active.is_(True))
        .order_by(AdminUser.full_name)
        .all()
    )
