"""export jobs

Revision ID: 0007_export_jobs
Revises: 0006_nullable_lithology_code
Create Date: 2026-05-23
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0007_export_jobs"
down_revision: Union[str, None] = "0006_nullable_lithology_code"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "export_jobs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=False),
        sa.Column("export_type", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=80), nullable=False),
        sa.Column("file_path", sa.String(length=500), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("summary", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_export_jobs_borehole_id"), "export_jobs", ["borehole_id"])
    op.create_index(op.f("ix_export_jobs_export_type"), "export_jobs", ["export_type"])
    op.create_index(op.f("ix_export_jobs_status"), "export_jobs", ["status"])


def downgrade() -> None:
    op.drop_index(op.f("ix_export_jobs_status"), table_name="export_jobs")
    op.drop_index(op.f("ix_export_jobs_export_type"), table_name="export_jobs")
    op.drop_index(op.f("ix_export_jobs_borehole_id"), table_name="export_jobs")
    op.drop_table("export_jobs")
