from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import Borehole, CoreImage, CorrectionAudit, Curve, LithologyInterval, Project, Site
from app.domains.boreholes.schemas import (
    BoreholeListItem,
    BoreholeWorkbenchOut,
    CoreImageOut,
    CurveOut,
    CurveSampleOut,
    DisplayLayoutOut,
    LithologyIntervalPatch,
)


def list_boreholes(db: Session) -> list[BoreholeListItem]:
    rows = db.execute(
        select(Borehole, Site, Project)
        .join(Site, Borehole.site_id == Site.id)
        .join(Project, Site.project_id == Project.id)
        .order_by(Project.code, Site.code, Borehole.code)
    ).all()
    return [
        BoreholeListItem(
            id=borehole.id,
            code=borehole.code,
            title=borehole.title,
            total_depth=borehole.total_depth,
            workflow_status=borehole.workflow_status,
            site_code=site.code,
            project_code=project.code,
        )
        for borehole, site, project in rows
    ]


def get_workbench(db: Session, borehole_id: int) -> BoreholeWorkbenchOut:
    borehole = db.scalar(
        select(Borehole)
        .where(Borehole.id == borehole_id)
        .options(
            selectinload(Borehole.lithology_intervals),
            selectinload(Borehole.seam_intervals),
            selectinload(Borehole.core_images),
            selectinload(Borehole.display_layouts),
            selectinload(Borehole.validation_issues),
            selectinload(Borehole.source_imports),
            selectinload(Borehole.field_submissions),
            selectinload(Borehole.curves).selectinload(Curve.samples),
        )
    )
    if borehole is None:
        raise ValueError("Borehole not found")

    curves = [
        CurveOut(
            id=curve.id,
            key=curve.key,
            label=curve.label,
            unit=curve.unit,
            source_type=curve.source_type,
            color=curve.color,
            samples=[
                CurveSampleOut(depth=sample.depth, value=sample.value)
                for sample in sorted(curve.samples, key=lambda item: item.depth)
            ],
        )
        for curve in sorted(borehole.curves, key=lambda item: item.key)
    ]

    images = [
        CoreImageOut(
            box_number=image.box_number,
            name=image.name,
            file_path=image.file_path,
            from_depth=image.from_depth,
            to_depth=image.to_depth,
            url=f"/assets/corebox/{image.name}",
        )
        for image in sorted(borehole.core_images, key=lambda item: item.box_number)
    ]

    layout = borehole.display_layouts[0] if borehole.display_layouts else None
    return BoreholeWorkbenchOut(
        id=borehole.id,
        code=borehole.code,
        title=borehole.title,
        state=borehole.state,
        total_depth=borehole.total_depth,
        closure_note=borehole.closure_note,
        source_workbook=borehole.source_workbook,
        source_sheet=borehole.source_sheet,
        workflow_status=borehole.workflow_status,
        lithology_intervals=sorted(borehole.lithology_intervals, key=lambda item: item.from_depth),
        seam_intervals=sorted(borehole.seam_intervals, key=lambda item: item.from_depth),
        curves=curves,
        core_images=images,
        layout=DisplayLayoutOut(
            id=layout.id,
            name=layout.name,
            mode=layout.mode,
            settings=layout.settings,
        )
        if layout
        else None,
        validation_issues=sorted(
            borehole.validation_issues,
            key=lambda item: (
                {"error": 0, "warning": 1, "info": 2}.get(item.severity, 3),
                item.from_depth if item.from_depth is not None else -1,
            ),
        ),
        source_imports=sorted(borehole.source_imports, key=lambda item: item.id),
        field_submissions=sorted(borehole.field_submissions, key=lambda item: item.id),
    )


def update_lithology_interval(
    db: Session, interval_id: str, patch: LithologyIntervalPatch
) -> LithologyInterval:
    interval = db.get(LithologyInterval, interval_id)
    if interval is None:
        raise ValueError("Interval not found")

    updates = patch.model_dump(exclude_unset=True)
    before_values = {field: getattr(interval, field) for field in updates}
    for field, value in updates.items():
        setattr(interval, field, value)

    after_values = {field: getattr(interval, field) for field in updates}
    if before_values != after_values:
        db.add(
            CorrectionAudit(
                borehole_id=interval.borehole_id,
                interval_id=interval.id,
                before_values=before_values,
                after_values=after_values,
            )
        )
    db.add(interval)
    db.commit()
    db.refresh(interval)
    return interval


def find_core_image_for_depth(db: Session, borehole_id: int, depth: float) -> CoreImage | None:
    return db.scalar(
        select(CoreImage)
        .where(CoreImage.borehole_id == borehole_id)
        .where(CoreImage.from_depth <= depth)
        .where(CoreImage.to_depth >= depth)
        .order_by(CoreImage.box_number)
    )
