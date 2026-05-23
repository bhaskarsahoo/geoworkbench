"""import profiles and source files

Revision ID: 0004_import_profiles_source_files
Revises: 0003_workflow_simulation
Create Date: 2026-05-21
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0004_import_profiles_source_files"
down_revision: Union[str, None] = "0003_workflow_simulation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "import_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("profile_type", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("mapping", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_import_profiles_name"), "import_profiles", ["name"], unique=True)
    op.create_index(op.f("ix_import_profiles_profile_type"), "import_profiles", ["profile_type"])

    op.create_table(
        "source_files",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=True),
        sa.Column("source_import_id", sa.Integer(), nullable=True),
        sa.Column("file_type", sa.String(length=80), nullable=False),
        sa.Column("original_name", sa.String(length=255), nullable=False),
        sa.Column("storage_path", sa.String(length=500), nullable=False),
        sa.Column("status", sa.String(length=80), nullable=False),
        sa.Column("file_metadata", sa.JSON(), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.ForeignKeyConstraint(["source_import_id"], ["source_imports.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_source_files_borehole_id"), "source_files", ["borehole_id"])
    op.create_index(op.f("ix_source_files_file_type"), "source_files", ["file_type"])
    op.create_index(op.f("ix_source_files_status"), "source_files", ["status"])


def downgrade() -> None:
    op.drop_index(op.f("ix_source_files_status"), table_name="source_files")
    op.drop_index(op.f("ix_source_files_file_type"), table_name="source_files")
    op.drop_index(op.f("ix_source_files_borehole_id"), table_name="source_files")
    op.drop_table("source_files")
    op.drop_index(op.f("ix_import_profiles_profile_type"), table_name="import_profiles")
    op.drop_index(op.f("ix_import_profiles_name"), table_name="import_profiles")
    op.drop_table("import_profiles")
