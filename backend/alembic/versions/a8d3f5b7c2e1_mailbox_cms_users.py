"""mailboxes for cms users

Revision ID: a8d3f5b7c2e1
Revises: a7c3e9d1b254
Create Date: 2026-10-31 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a8d3f5b7c2e1'
down_revision: Union[str, Sequence[str], None] = 'a7c3e9d1b254'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('mailboxes') as batch:
        batch.alter_column('planner_user_id', existing_type=sa.String(length=64), nullable=True)
        batch.add_column(sa.Column('admin_user_id', sa.Integer(), nullable=True))
        batch.create_foreign_key('fk_mailboxes_admin_user_id', 'admin_users', ['admin_user_id'], ['id'], ondelete='SET NULL')
    op.create_index(op.f('ix_mailboxes_admin_user_id'), 'mailboxes', ['admin_user_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DELETE FROM mailboxes WHERE planner_user_id IS NULL")
    op.drop_index(op.f('ix_mailboxes_admin_user_id'), table_name='mailboxes')
    with op.batch_alter_table('mailboxes') as batch:
        batch.drop_constraint('fk_mailboxes_admin_user_id', type_='foreignkey')
        batch.drop_column('admin_user_id')
        batch.alter_column('planner_user_id', existing_type=sa.String(length=64), nullable=False)
