"""validation issues

Revision ID: 0002_validation_issues
Revises: 0001_initial_schema
Create Date: 2026-05-21
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002_validation_issues"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "validation_issues",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=120), nullable=False),
        sa.Column("severity", sa.String(length=40), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("from_depth", sa.Float(), nullable=True),
        sa.Column("to_depth", sa.Float(), nullable=True),
        sa.Column("entity_type", sa.String(length=80), nullable=True),
        sa.Column("entity_id", sa.String(length=120), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("issue_metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_validation_issues_borehole_id"), "validation_issues", ["borehole_id"])
    op.create_index(op.f("ix_validation_issues_code"), "validation_issues", ["code"])
    op.create_index(op.f("ix_validation_issues_severity"), "validation_issues", ["severity"])
    op.create_index(op.f("ix_validation_issues_status"), "validation_issues", ["status"])


def downgrade() -> None:
    op.drop_index(op.f("ix_validation_issues_status"), table_name="validation_issues")
    op.drop_index(op.f("ix_validation_issues_severity"), table_name="validation_issues")
    op.drop_index(op.f("ix_validation_issues_code"), table_name="validation_issues")
    op.drop_index(op.f("ix_validation_issues_borehole_id"), table_name="validation_issues")
    op.drop_table("validation_issues")
