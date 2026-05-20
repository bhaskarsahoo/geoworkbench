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
    LithologyInterval,
    Project,
    SeamInterval,
    Site,
)
from app.db.session import SessionLocal
from app.domains.display_layouts.defaults import default_borehole_layout


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


def main() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    source_path = repo_root / "sample-data" / "pbh-62-normalized.json"
    data = json.loads(source_path.read_text())

    db = SessionLocal()
    try:
        existing = db.query(Borehole).filter(Borehole.code == data["borehole"]["id"]).first()
        if existing:
            print("PBH-62 demo data already seeded.")
            return

        project = Project(code="DEMO-COAL", name="Demo Coal Block")
        site = Site(code=data["borehole"]["projectCode"], name="MTSE-65", project=project)
        borehole = Borehole(
            site=site,
            code=data["borehole"]["id"],
            title=data["borehole"]["title"],
            state=data["borehole"].get("state"),
            total_depth=data["borehole"]["totalDepth"],
            closure_note=data["borehole"].get("closureNote"),
            source_workbook=data["borehole"].get("sourceWorkbook"),
            source_sheet=data["borehole"].get("sourceSheet"),
        )
        db.add(project)
        db.flush()

        for item in data["lithologyIntervals"]:
            borehole.lithology_intervals.append(
                LithologyInterval(
                    id=item["id"],
                    source_row=item.get("sourceRow"),
                    from_depth=item["fromDepth"],
                    to_depth=item["toDepth"],
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
            borehole.seam_intervals.append(
                SeamInterval(
                    id=item["id"],
                    source_row=item.get("sourceRow"),
                    name=item["name"],
                    from_depth=item["fromDepth"],
                    to_depth=item["toDepth"],
                    thickness=item.get("thickness"),
                    lithology_code=item.get("lithologyCode"),
                    lithology_label=item.get("lithologyLabel"),
                    image_box=item.get("imageBox"),
                )
            )

        total_depth = data["borehole"]["totalDepth"]
        depth_per_box = total_depth / max(len(data["coreImages"]), 1)
        for item in data["coreImages"]:
            box_number = item["boxNumber"]
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

        db.add(borehole)
        db.commit()
        print("Seeded PBH-62 demo project, borehole, intervals, images, layout, and synthetic curves.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
