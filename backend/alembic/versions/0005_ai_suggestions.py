"""ai suggestions

Revision ID: 0005_ai_suggestions
Revises: 0004_import_profiles_source_files
Create Date: 2026-05-23
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0005_ai_suggestions"
down_revision: Union[str, None] = "0004_import_profiles_source_files"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_suggestions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=False),
        sa.Column("validation_issue_id", sa.Integer(), nullable=True),
        sa.Column("suggestion_type", sa.String(length=120), nullable=False),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.Column("recommended_action", sa.Text(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("provider", sa.String(length=80), nullable=False),
        sa.Column("from_depth", sa.Float(), nullable=True),
        sa.Column("to_depth", sa.Float(), nullable=True),
        sa.Column("entity_type", sa.String(length=80), nullable=True),
        sa.Column("entity_id", sa.String(length=120), nullable=True),
        sa.Column("patch", sa.JSON(), nullable=True),
        sa.Column("evidence", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.ForeignKeyConstraint(["validation_issue_id"], ["validation_issues.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ai_suggestions_borehole_id"), "ai_suggestions", ["borehole_id"])
    op.create_index(op.f("ix_ai_suggestions_status"), "ai_suggestions", ["status"])
    op.create_index(op.f("ix_ai_suggestions_suggestion_type"), "ai_suggestions", ["suggestion_type"])
    op.create_index(op.f("ix_ai_suggestions_validation_issue_id"), "ai_suggestions", ["validation_issue_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_ai_suggestions_validation_issue_id"), table_name="ai_suggestions")
    op.drop_index(op.f("ix_ai_suggestions_suggestion_type"), table_name="ai_suggestions")
    op.drop_index(op.f("ix_ai_suggestions_status"), table_name="ai_suggestions")
    op.drop_index(op.f("ix_ai_suggestions_borehole_id"), table_name="ai_suggestions")
    op.drop_table("ai_suggestions")
