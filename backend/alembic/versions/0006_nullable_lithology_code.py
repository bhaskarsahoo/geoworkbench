"""nullable lithology code

Revision ID: 0006_nullable_lithology_code
Revises: 0005_ai_suggestions
Create Date: 2026-05-23
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0006_nullable_lithology_code"
down_revision: Union[str, None] = "0005_ai_suggestions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("lithology_intervals") as batch_op:
        batch_op.alter_column(
            "lithology_code",
            existing_type=sa.String(length=80),
            nullable=True,
        )


def downgrade() -> None:
    with op.batch_alter_table("lithology_intervals") as batch_op:
        batch_op.alter_column(
            "lithology_code",
            existing_type=sa.String(length=80),
            nullable=False,
        )
