"""workflow simulation

Revision ID: 0003_workflow_simulation
Revises: 0002_validation_issues
Create Date: 2026-05-21
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003_workflow_simulation"
down_revision: Union[str, None] = "0002_validation_issues"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "boreholes",
        sa.Column(
            "workflow_status",
            sa.String(length=80),
            nullable=False,
            server_default="ready_for_central_review",
        ),
    )
    op.create_index(op.f("ix_boreholes_workflow_status"), "boreholes", ["workflow_status"])

    op.create_table(
        "source_imports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=False),
        sa.Column("import_type", sa.String(length=80), nullable=False),
        sa.Column("source_name", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=80), nullable=False),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("summary", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_source_imports_borehole_id"), "source_imports", ["borehole_id"])
    op.create_index(op.f("ix_source_imports_import_type"), "source_imports", ["import_type"])
    op.create_index(op.f("ix_source_imports_status"), "source_imports", ["status"])

    op.create_table(
        "field_submissions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=False),
        sa.Column("submission_type", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=80), nullable=False),
        sa.Column("submitted_by", sa.String(length=160), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_field_submissions_borehole_id"), "field_submissions", ["borehole_id"])
    op.create_index(op.f("ix_field_submissions_submission_type"), "field_submissions", ["submission_type"])
    op.create_index(op.f("ix_field_submissions_status"), "field_submissions", ["status"])


def downgrade() -> None:
    op.drop_index(op.f("ix_field_submissions_status"), table_name="field_submissions")
    op.drop_index(op.f("ix_field_submissions_submission_type"), table_name="field_submissions")
    op.drop_index(op.f("ix_field_submissions_borehole_id"), table_name="field_submissions")
    op.drop_table("field_submissions")
    op.drop_index(op.f("ix_source_imports_status"), table_name="source_imports")
    op.drop_index(op.f("ix_source_imports_import_type"), table_name="source_imports")
    op.drop_index(op.f("ix_source_imports_borehole_id"), table_name="source_imports")
    op.drop_table("source_imports")
    op.drop_index(op.f("ix_boreholes_workflow_status"), table_name="boreholes")
    op.drop_column("boreholes", "workflow_status")
