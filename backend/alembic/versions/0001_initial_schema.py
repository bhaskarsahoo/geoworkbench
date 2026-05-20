"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-05-21
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_projects_code"), "projects", ["code"], unique=True)

    op.create_table(
        "sites",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sites_code"), "sites", ["code"], unique=False)
    op.create_index(op.f("ix_sites_project_id"), "sites", ["project_id"], unique=False)

    op.create_table(
        "boreholes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("site_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=80), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("state", sa.String(length=120), nullable=True),
        sa.Column("total_depth", sa.Float(), nullable=False),
        sa.Column("closure_note", sa.Text(), nullable=True),
        sa.Column("source_workbook", sa.String(length=255), nullable=True),
        sa.Column("source_sheet", sa.String(length=120), nullable=True),
        sa.ForeignKeyConstraint(["site_id"], ["sites.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_boreholes_code"), "boreholes", ["code"], unique=True)
    op.create_index(op.f("ix_boreholes_site_id"), "boreholes", ["site_id"], unique=False)

    op.create_table(
        "core_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=False),
        sa.Column("box_number", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("file_path", sa.String(length=255), nullable=False),
        sa.Column("from_depth", sa.Float(), nullable=True),
        sa.Column("to_depth", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_core_images_borehole_id"), "core_images", ["borehole_id"], unique=False)
    op.create_index(op.f("ix_core_images_box_number"), "core_images", ["box_number"], unique=False)

    op.create_table(
        "curves",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(length=80), nullable=False),
        sa.Column("label", sa.String(length=120), nullable=False),
        sa.Column("unit", sa.String(length=40), nullable=False),
        sa.Column("source_type", sa.String(length=40), nullable=False),
        sa.Column("color", sa.String(length=32), nullable=False),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_curves_borehole_id"), "curves", ["borehole_id"], unique=False)
    op.create_index(op.f("ix_curves_key"), "curves", ["key"], unique=False)

    op.create_table(
        "display_layouts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("mode", sa.String(length=40), nullable=False),
        sa.Column("settings", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "lithology_intervals",
        sa.Column("id", sa.String(length=80), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=False),
        sa.Column("source_row", sa.Integer(), nullable=True),
        sa.Column("from_depth", sa.Float(), nullable=False),
        sa.Column("to_depth", sa.Float(), nullable=False),
        sa.Column("lithology_code", sa.String(length=80), nullable=False),
        sa.Column("lithology_label", sa.String(length=160), nullable=False),
        sa.Column("display_color", sa.String(length=32), nullable=True),
        sa.Column("logged_color", sa.String(length=120), nullable=True),
        sa.Column("seam_name", sa.String(length=120), nullable=True),
        sa.Column("recovery", sa.Float(), nullable=True),
        sa.Column("recovery_percent", sa.Float(), nullable=True),
        sa.Column("rqd", sa.Float(), nullable=True),
        sa.Column("structural_features", sa.Text(), nullable=True),
        sa.Column("remark", sa.Text(), nullable=True),
        sa.Column("image_box", sa.Integer(), nullable=True),
        sa.Column("image_file", sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_lithology_intervals_borehole_id"),
        "lithology_intervals",
        ["borehole_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_lithology_intervals_from_depth"),
        "lithology_intervals",
        ["from_depth"],
        unique=False,
    )
    op.create_index(
        op.f("ix_lithology_intervals_to_depth"),
        "lithology_intervals",
        ["to_depth"],
        unique=False,
    )

    op.create_table(
        "seam_intervals",
        sa.Column("id", sa.String(length=80), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=False),
        sa.Column("source_row", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("from_depth", sa.Float(), nullable=False),
        sa.Column("to_depth", sa.Float(), nullable=False),
        sa.Column("thickness", sa.Float(), nullable=True),
        sa.Column("lithology_code", sa.String(length=80), nullable=True),
        sa.Column("lithology_label", sa.String(length=160), nullable=True),
        sa.Column("image_box", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_seam_intervals_borehole_id"), "seam_intervals", ["borehole_id"], unique=False
    )

    op.create_table(
        "curve_samples",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("curve_id", sa.Integer(), nullable=False),
        sa.Column("depth", sa.Float(), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["curve_id"], ["curves.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_curve_samples_curve_id"), "curve_samples", ["curve_id"], unique=False)
    op.create_index(op.f("ix_curve_samples_depth"), "curve_samples", ["depth"], unique=False)

    op.create_table(
        "correction_audits",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("borehole_id", sa.Integer(), nullable=False),
        sa.Column("interval_id", sa.String(length=80), nullable=False),
        sa.Column("entity_type", sa.String(length=80), nullable=False),
        sa.Column("changed_by", sa.String(length=160), nullable=False),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("change_reason", sa.Text(), nullable=True),
        sa.Column("before_values", sa.JSON(), nullable=False),
        sa.Column("after_values", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["borehole_id"], ["boreholes.id"]),
        sa.ForeignKeyConstraint(["interval_id"], ["lithology_intervals.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_correction_audits_borehole_id"),
        "correction_audits",
        ["borehole_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_correction_audits_interval_id"),
        "correction_audits",
        ["interval_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_correction_audits_interval_id"), table_name="correction_audits")
    op.drop_index(op.f("ix_correction_audits_borehole_id"), table_name="correction_audits")
    op.drop_table("correction_audits")
    op.drop_index(op.f("ix_curve_samples_depth"), table_name="curve_samples")
    op.drop_index(op.f("ix_curve_samples_curve_id"), table_name="curve_samples")
    op.drop_table("curve_samples")
    op.drop_index(op.f("ix_seam_intervals_borehole_id"), table_name="seam_intervals")
    op.drop_table("seam_intervals")
    op.drop_index(op.f("ix_lithology_intervals_to_depth"), table_name="lithology_intervals")
    op.drop_index(op.f("ix_lithology_intervals_from_depth"), table_name="lithology_intervals")
    op.drop_index(op.f("ix_lithology_intervals_borehole_id"), table_name="lithology_intervals")
    op.drop_table("lithology_intervals")
    op.drop_table("display_layouts")
    op.drop_index(op.f("ix_curves_key"), table_name="curves")
    op.drop_index(op.f("ix_curves_borehole_id"), table_name="curves")
    op.drop_table("curves")
    op.drop_index(op.f("ix_core_images_box_number"), table_name="core_images")
    op.drop_index(op.f("ix_core_images_borehole_id"), table_name="core_images")
    op.drop_table("core_images")
    op.drop_index(op.f("ix_boreholes_site_id"), table_name="boreholes")
    op.drop_index(op.f("ix_boreholes_code"), table_name="boreholes")
    op.drop_table("boreholes")
    op.drop_index(op.f("ix_sites_project_id"), table_name="sites")
    op.drop_index(op.f("ix_sites_code"), table_name="sites")
    op.drop_table("sites")
    op.drop_index(op.f("ix_projects_code"), table_name="projects")
    op.drop_table("projects")

