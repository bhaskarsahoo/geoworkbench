import json
import math
import random
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.models import (
    Borehole,
    CoreImage,
    Curve,
    CurveSample,
    DisplayLayout,
    FieldSubmission,
    LithologyInterval,
    Project,
    SeamInterval,
    Site,
    SourceImport,
)
from app.db.session import SessionLocal
from app.domains.display_layouts.defaults import default_borehole_layout
from app.services.validation.borehole_validation import replace_validation_issues, validate_borehole


def synthetic_curve_value(curve_key: str, depth: float) -> float:
    rng = random.Random(f"{curve_key}:{round(depth, 1)}")
    coal_zone_drop = 22 if 320 <= depth <= 565 and curve_key == "gamma" else 0
    if curve_key == "gamma":
        return max(5, 75 + math.sin(depth / 18) * 28 - coal_zone_drop + rng.uniform(-8, 8))
    if curve_key == "resistivity":
        return max(1, 26 + math.cos(depth / 22) * 14 + (18 if 320 <= depth <= 565 else 0) + rng.uniform(-4, 4))
    if curve_key == "density":
        return max(1.1, 2.1 + math.sin(depth / 31) * 0.22 - (0.24 if 320 <= depth <= 565 else 0) + rng.uniform(-0.04, 0.04))
    return 0


def create_demo_borehole(
    site: Site,
    data: dict,
    borehole_code: str,
    title_suffix: str,
    workflow_status: str,
    max_depth: float | None = None,
    include_images: bool = True,
    include_curves: bool = True,
) -> Borehole:
    total_depth = data["borehole"]["totalDepth"] if max_depth is None else max_depth
    borehole = Borehole(
        site=site,
        code=borehole_code,
        title=f"{data['borehole']['title']} {title_suffix}".strip(),
        state=data["borehole"].get("state"),
        total_depth=total_depth,
        closure_note=data["borehole"].get("closureNote") if max_depth is None else "FIELD LOGGING IN PROGRESS",
        source_workbook=data["borehole"].get("sourceWorkbook"),
        source_sheet=data["borehole"].get("sourceSheet"),
        workflow_status=workflow_status,
    )

    for item in data["lithologyIntervals"]:
        if item["fromDepth"] <= total_depth:
            to_depth = min(item["toDepth"], total_depth)
            borehole.lithology_intervals.append(
                LithologyInterval(
                    id=f"{borehole_code.lower()}-{item['id']}",
                    source_row=item.get("sourceRow"),
                    from_depth=item["fromDepth"],
                    to_depth=to_depth,
                    lithology_code=item["lithologyCode"],
                    lithology_label=item["lithologyLabel"],
                    display_color=item.get("displayColor"),
                    logged_color=item.get("loggedColor"),
                    seam_name=item.get("seamName"),
                    recovery=item.get("recovery"),
                    recovery_percent=item.get("recoveryPercent"),
                    rqd=item.get("rqd"),
                    structural_features=item.get("structuralFeatures"),
                    remark=item.get("remark"),
                    image_box=item.get("imageBox"),
                    image_file=item.get("imageFile"),
                )
            )

    for item in data["seamIntervals"]:
        if item["fromDepth"] <= total_depth:
            borehole.seam_intervals.append(
                SeamInterval(
                    id=f"{borehole_code.lower()}-{item['id']}",
                    source_row=item.get("sourceRow"),
                    name=item["name"],
                    from_depth=item["fromDepth"],
                    to_depth=min(item["toDepth"], total_depth),
                    thickness=item.get("thickness"),
                    lithology_code=item.get("lithologyCode"),
                    lithology_label=item.get("lithologyLabel"),
                    image_box=item.get("imageBox"),
                )
            )

    if include_images:
        depth_per_box = total_depth / max(len(data["coreImages"]), 1)
        for item in data["coreImages"]:
            box_number = item["boxNumber"]
            if max_depth is not None and (box_number - 1) * depth_per_box > total_depth:
                continue
            from_depth = round((box_number - 1) * depth_per_box, 2)
            to_depth = round(min(total_depth, box_number * depth_per_box), 2)
            borehole.core_images.append(
                CoreImage(
                    box_number=box_number,
                    name=item["name"],
                    file_path=item["file"],
                    from_depth=from_depth,
                    to_depth=to_depth,
                )
            )

    if include_curves:
        curves = [
            ("gamma", "Gamma", "API", "#d97706"),
            ("resistivity", "Resistivity", "ohm.m", "#2563eb"),
            ("density", "Density", "g/cc", "#059669"),
        ]
        for key, label, unit, color in curves:
            curve = Curve(key=key, label=label, unit=unit, color=color, source_type="synthetic")
            depth = 0.0
            while depth <= total_depth:
                curve.samples.append(
                    CurveSample(depth=round(depth, 2), value=round(synthetic_curve_value(key, depth), 3))
                )
                depth += 0.5
            borehole.curves.append(curve)

    borehole.display_layouts.append(
        DisplayLayout(name="Central Correction", mode="runtime", settings=default_borehole_layout())
    )
    return borehole


def add_workflow_records(borehole: Borehole, mode: str) -> None:
    if mode == "batch":
        borehole.source_imports.extend(
            [
                SourceImport(import_type="excel", source_name="PBH log workbook", status="parsed"),
                SourceImport(import_type="core_images", source_name="Corebox image folder", status="parsed"),
                SourceImport(import_type="curves", source_name="Synthetic LAS substitute", status="parsed"),
            ]
        )
    if mode == "mobile_partial":
        borehole.field_submissions.extend(
            [
                FieldSubmission(
                    submission_type="mobile_form",
                    status="synced",
                    submitted_by="site-geologist",
                    payload={"depth_from": 0, "depth_to": borehole.total_depth, "intervals": len(borehole.lithology_intervals)},
                ),
                FieldSubmission(
                    submission_type="corebox_photos",
                    status="sync_pending",
                    submitted_by="site-geologist",
                    payload={"message": "Some images pending upload"},
                ),
            ]
        )
    if mode == "excel_pending_review":
        borehole.source_imports.append(
            SourceImport(import_type="excel", source_name="Uploaded field workbook", status="parsed_with_warnings")
        )
    if mode == "images_only":
        borehole.source_imports.append(
            SourceImport(import_type="core_images", source_name="Corebox image folder", status="parsed")
        )


def main() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    source_path = repo_root / "sample-data" / "pbh-62-normalized.json"
    data = json.loads(source_path.read_text())

    db = SessionLocal()
    try:
        existing = db.query(Borehole).filter(Borehole.code == data["borehole"]["id"]).first()
        if existing:
            print("PBH demo data already seeded.")
            return

        project = Project(code="DEMO-COAL", name="Demo Coal Block")
        site = Site(code=data["borehole"]["projectCode"], name="MTSE-65", project=project)
        db.add(project)
        db.flush()

        boreholes = [
            create_demo_borehole(site, data, "PBH-62", "", "ready_for_central_review"),
            create_demo_borehole(site, data, "PBH-63", "(field logging in progress)", "logging_in_progress", max_depth=220),
            create_demo_borehole(site, data, "PBH-64", "(mobile partial sync)", "field_submitted", max_depth=360, include_images=False),
            create_demo_borehole(site, data, "PBH-65", "(images uploaded, curves pending)", "imported_with_warnings", include_curves=False),
        ]

        add_workflow_records(boreholes[0], "batch")
        add_workflow_records(boreholes[1], "mobile_partial")
        add_workflow_records(boreholes[2], "excel_pending_review")
        add_workflow_records(boreholes[3], "images_only")

        db.add_all(boreholes)
        db.flush()
        for borehole in boreholes:
            replace_validation_issues(borehole, validate_borehole(borehole))
        db.commit()
        print("Seeded PBH demo project with batch and mobile-style borehole workflow states.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
