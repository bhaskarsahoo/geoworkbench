from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))

    sites: Mapped[list["Site"]] = relationship(back_populates="project", cascade="all, delete-orphan")


class Site(Base):
    __tablename__ = "sites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    code: Mapped[str] = mapped_column(String(80), index=True)
    name: Mapped[str] = mapped_column(String(200))

    project: Mapped[Project] = relationship(back_populates="sites")
    boreholes: Mapped[list["Borehole"]] = relationship(
        back_populates="site", cascade="all, delete-orphan"
    )


class Borehole(Base):
    __tablename__ = "boreholes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), index=True)
    code: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    state: Mapped[str | None] = mapped_column(String(120), nullable=True)
    total_depth: Mapped[float] = mapped_column(Float)
    closure_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_workbook: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_sheet: Mapped[str | None] = mapped_column(String(120), nullable=True)

    site: Mapped[Site] = relationship(back_populates="boreholes")
    lithology_intervals: Mapped[list["LithologyInterval"]] = relationship(
        back_populates="borehole", cascade="all, delete-orphan"
    )
    seam_intervals: Mapped[list["SeamInterval"]] = relationship(
        back_populates="borehole", cascade="all, delete-orphan"
    )
    curves: Mapped[list["Curve"]] = relationship(back_populates="borehole", cascade="all, delete-orphan")
    core_images: Mapped[list["CoreImage"]] = relationship(
        back_populates="borehole", cascade="all, delete-orphan"
    )
    display_layouts: Mapped[list["DisplayLayout"]] = relationship(
        back_populates="borehole", cascade="all, delete-orphan"
    )


class LithologyInterval(Base):
    __tablename__ = "lithology_intervals"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    borehole_id: Mapped[int] = mapped_column(ForeignKey("boreholes.id"), index=True)
    source_row: Mapped[int | None] = mapped_column(Integer, nullable=True)
    from_depth: Mapped[float] = mapped_column(Float, index=True)
    to_depth: Mapped[float] = mapped_column(Float, index=True)
    lithology_code: Mapped[str] = mapped_column(String(80))
    lithology_label: Mapped[str] = mapped_column(String(160))
    display_color: Mapped[str | None] = mapped_column(String(32), nullable=True)
    logged_color: Mapped[str | None] = mapped_column(String(120), nullable=True)
    seam_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    recovery: Mapped[float | None] = mapped_column(Float, nullable=True)
    recovery_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    rqd: Mapped[float | None] = mapped_column(Float, nullable=True)
    structural_features: Mapped[str | None] = mapped_column(Text, nullable=True)
    remark: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_box: Mapped[int | None] = mapped_column(Integer, nullable=True)
    image_file: Mapped[str | None] = mapped_column(String(255), nullable=True)

    borehole: Mapped[Borehole] = relationship(back_populates="lithology_intervals")


class CorrectionAudit(Base):
    __tablename__ = "correction_audits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    borehole_id: Mapped[int] = mapped_column(ForeignKey("boreholes.id"), index=True)
    interval_id: Mapped[str] = mapped_column(ForeignKey("lithology_intervals.id"), index=True)
    entity_type: Mapped[str] = mapped_column(String(80), default="lithology_interval")
    changed_by: Mapped[str] = mapped_column(String(160), default="demo-user")
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    change_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    before_values: Mapped[dict] = mapped_column(JSON)
    after_values: Mapped[dict] = mapped_column(JSON)


class SeamInterval(Base):
    __tablename__ = "seam_intervals"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    borehole_id: Mapped[int] = mapped_column(ForeignKey("boreholes.id"), index=True)
    source_row: Mapped[int | None] = mapped_column(Integer, nullable=True)
    name: Mapped[str] = mapped_column(String(120))
    from_depth: Mapped[float] = mapped_column(Float)
    to_depth: Mapped[float] = mapped_column(Float)
    thickness: Mapped[float | None] = mapped_column(Float, nullable=True)
    lithology_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    lithology_label: Mapped[str | None] = mapped_column(String(160), nullable=True)
    image_box: Mapped[int | None] = mapped_column(Integer, nullable=True)

    borehole: Mapped[Borehole] = relationship(back_populates="seam_intervals")


class Curve(Base):
    __tablename__ = "curves"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    borehole_id: Mapped[int] = mapped_column(ForeignKey("boreholes.id"), index=True)
    key: Mapped[str] = mapped_column(String(80), index=True)
    label: Mapped[str] = mapped_column(String(120))
    unit: Mapped[str] = mapped_column(String(40))
    source_type: Mapped[str] = mapped_column(String(40), default="synthetic")
    color: Mapped[str] = mapped_column(String(32))

    borehole: Mapped[Borehole] = relationship(back_populates="curves")
    samples: Mapped[list["CurveSample"]] = relationship(
        back_populates="curve", cascade="all, delete-orphan"
    )


class CurveSample(Base):
    __tablename__ = "curve_samples"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    curve_id: Mapped[int] = mapped_column(ForeignKey("curves.id"), index=True)
    depth: Mapped[float] = mapped_column(Float, index=True)
    value: Mapped[float] = mapped_column(Float)

    curve: Mapped[Curve] = relationship(back_populates="samples")


class CoreImage(Base):
    __tablename__ = "core_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    borehole_id: Mapped[int] = mapped_column(ForeignKey("boreholes.id"), index=True)
    box_number: Mapped[int] = mapped_column(Integer, index=True)
    name: Mapped[str] = mapped_column(String(160))
    file_path: Mapped[str] = mapped_column(String(255))
    from_depth: Mapped[float | None] = mapped_column(Float, nullable=True)
    to_depth: Mapped[float | None] = mapped_column(Float, nullable=True)

    borehole: Mapped[Borehole] = relationship(back_populates="core_images")


class DisplayLayout(Base):
    __tablename__ = "display_layouts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    borehole_id: Mapped[int | None] = mapped_column(ForeignKey("boreholes.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(160))
    mode: Mapped[str] = mapped_column(String(40), default="runtime")
    settings: Mapped[dict] = mapped_column(JSON)

    borehole: Mapped[Borehole | None] = relationship(back_populates="display_layouts")
