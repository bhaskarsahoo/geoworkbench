import math
import random
import shutil
import sys
from dataclasses import dataclass
from pathlib import Path

from openpyxl import Workbook
from sqlalchemy import select
from sqlalchemy.orm import selectinload

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.models import (  # noqa: E402
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
from app.db.session import SessionLocal  # noqa: E402
from app.domains.display_layouts.defaults import default_borehole_layout  # noqa: E402
from app.services.validation.borehole_validation import (  # noqa: E402
    replace_validation_issues,
    validate_borehole,
)


PROJECT_CODE = "DEMO-COAL-BLOCK"
PROJECT_NAME = "Synthetic Coal Block Demo"
SITE_CODE = "SYN-JALATAP"
SITE_NAME = "Synthetic Jalatap-Shardhapur Sector"


@dataclass(frozen=True)
class Zone:
    key: str
    label: str
    code: str
    top: float
    base: float
    color: str
    marker: str | None = None


@dataclass(frozen=True)
class BoreholeSpec:
    code: str
    x: float
    y: float
    rl: float
    total_depth: float
    marker_shift: float
    status: str
    scenario: str


BASE_ZONES = [
    Zone("overburden", "Weathered overburden", "OB", 0, 28, "#c6b18a"),
    Zone("sandstone_1", "Fine grained sandstone", "SS", 28, 72, "#d8b365"),
    Zone("shale_1", "Grey shale", "SH", 72, 114, "#7f8c8d"),
    Zone("coal_a", "Coal", "COAL", 114, 128, "#1f2933", "Seam A"),
    Zone("siltstone_1", "Siltstone", "SLT", 128, 174, "#b8a77a"),
    Zone("claystone_1", "Claystone", "CLAY", 174, 212, "#8ca0a6"),
    Zone("coal_b", "Coal with shale parting", "COAL", 212, 236, "#111827", "Seam B"),
    Zone("carbonaceous_shale", "Carbonaceous shale", "CARBSHL", 236, 272, "#394047"),
    Zone("sandstone_2", "Medium grained sandstone", "SS", 272, 326, "#d4a257"),
    Zone("coal_c", "Coal", "COAL", 326, 342, "#111111", "Seam C"),
    Zone("shale_2", "Dark grey shale", "SH", 342, 388, "#59666c"),
    Zone("basement", "Lower sandstone", "SS", 388, 430, "#c9964a"),
]


SPECS = [
    BoreholeSpec("DMBH-01", 1000, 1000, 226.4, 420, -3.0, "central_correction", "clean_reference"),
    BoreholeSpec("DMBH-02", 1320, 1015, 224.9, 425, 2.0, "field_submitted", "mobile_incremental"),
    BoreholeSpec("DMBH-03", 1640, 990, 223.1, 418, 7.5, "merge_review", "excel_conflict"),
    BoreholeSpec("DMBH-04", 1960, 1028, 222.6, 410, 15.0, "imported_with_warnings", "curve_gap"),
    BoreholeSpec("DMBH-05", 2280, 995, 221.8, 432, 24.0, "ready_for_approval", "fault_offset"),
]


def shifted_zones(spec: BoreholeSpec) -> list[Zone]:
    zones: list[Zone] = []
    for zone in BASE_ZONES:
        top = max(0, zone.top + spec.marker_shift)
        base = min(spec.total_depth, zone.base + spec.marker_shift)
        if base <= 0 or top >= spec.total_depth or base <= top:
            continue
        if spec.code == "DMBH-05" and zone.marker in {"Seam B", "Seam C"}:
            top += 8.0
            base += 8.0
        if spec.code == "DMBH-03" and zone.key == "coal_b":
            top += 1.5
            base += 1.5
        zones.append(
            Zone(
                key=zone.key,
                label=zone.label,
                code=zone.code,
                top=round(top, 2),
                base=round(min(base, spec.total_depth), 2),
                color=zone.color,
                marker=zone.marker,
            )
        )
    return zones


def interval_rows(spec: BoreholeSpec) -> list[dict]:
    rows: list[dict] = []
    box_size = 20.0
    rng = random.Random(spec.code)
    for index, zone in enumerate(shifted_zones(spec), start=1):
        top = zone.top
        base = zone.base
        if spec.code == "DMBH-03" and zone.key == "siltstone_1":
            base -= 2.0
        if spec.code == "DMBH-03" and zone.key == "claystone_1":
            top -= 1.0
        code = zone.code
        label = zone.label
        remark = ""
        if spec.code == "DMBH-04" and zone.key == "coal_c":
            code = "SH"
            label = "Dark grey shale"
            remark = "Curve response suggests possible coal interval - review required"
        if zone.key == "claystone_1":
            remark = "Soft clay band, possible washout"
        if zone.key == "carbonaceous_shale":
            remark = "Carbonaceous shale with occasional coal streaks"
        thickness = base - top
        recovery_percent = max(42, min(100, 86 + rng.uniform(-18, 10)))
        if zone.code == "COAL":
            recovery_percent -= 8
        rqd = max(0.15, min(0.95, recovery_percent / 100 - rng.uniform(0.05, 0.24)))
        if spec.code == "DMBH-02" and zone.key == "carbonaceous_shale":
            rqd = None
        seam_name = zone.marker
        if spec.code == "DMBH-02" and zone.key == "coal_b":
            seam_name = None
            remark = "Coal interval logged from mobile; seam pick pending"
        rows.append(
            {
                "id": f"{spec.code.lower()}-lith-{index:03d}",
                "source_row": index + 10,
                "from_depth": round(top, 2),
                "to_depth": round(base, 2),
                "lithology_code": code,
                "lithology_label": label,
                "display_color": zone.color,
                "logged_color": "black" if zone.code == "COAL" else None,
                "seam_name": seam_name,
                "recovery": round(thickness * recovery_percent / 100, 2),
                "recovery_percent": round(recovery_percent, 1),
                "rqd": round(rqd, 3) if rqd is not None else None,
                "structural_features": "Inclined fractures" if zone.key in {"claystone_1", "carbonaceous_shale"} else None,
                "remark": remark,
                "image_box": int(top // box_size) + 1,
            }
        )
    return rows


def lithology_at_depth(spec: BoreholeSpec, depth: float) -> Zone | None:
    for zone in shifted_zones(spec):
        if zone.top <= depth <= zone.base:
            return zone
    return None


def curve_value(spec: BoreholeSpec, curve_key: str, depth: float) -> float | None:
    if spec.code == "DMBH-04" and depth > 352 and curve_key in {"ngam", "density"}:
        return None
    zone = lithology_at_depth(spec, depth)
    rng = random.Random(f"{spec.code}:{curve_key}:{round(depth, 1)}")
    noise = rng.uniform(-1, 1)
    if zone is None:
        lith_key = "unknown"
    else:
        lith_key = zone.key

    coal = lith_key.startswith("coal")
    shale = "shale" in lith_key or lith_key == "claystone_1"
    sandstone = "sandstone" in lith_key

    if curve_key == "ngam":
        base = 32 if coal else 64 if sandstone else 108 if shale else 82
        return max(5, base + math.sin(depth / 9) * 8 + noise * 7)
    if curve_key == "resistivity":
        base = 92 if coal else 48 if sandstone else 18 if shale else 31
        return max(1, base + math.cos(depth / 14) * 7 + noise * 5)
    if curve_key == "density":
        base = 1.55 if coal else 2.32 if sandstone else 2.48 if shale else 2.18
        return max(1.05, base + math.sin(depth / 21) * 0.08 + noise * 0.04)
    if curve_key == "caliper":
        washout = 35 if lith_key == "claystone_1" else 12 if shale else 0
        return max(90, 120 + washout + math.sin(depth / 17) * 8 + noise * 4)
    if curve_key == "sp":
        base = -42 if sandstone else -12 if coal else 6
        return base + math.sin(depth / 23) * 9 + noise * 5
    if curve_key == "inclination":
        return 1.2 + (depth / max(spec.total_depth, 1)) * (2.0 if spec.code != "DMBH-05" else 7.5) + noise * 0.12
    return 0


def write_core_svg(path: Path, spec: BoreholeSpec, box_number: int, from_depth: float, to_depth: float) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    height = 640
    width = 240
    segments = []
    for zone in shifted_zones(spec):
        overlap_top = max(from_depth, zone.top)
        overlap_base = min(to_depth, zone.base)
        if overlap_base <= overlap_top:
            continue
        y = (overlap_top - from_depth) / (to_depth - from_depth) * height
        h = max(2, (overlap_base - overlap_top) / (to_depth - from_depth) * height)
        segments.append((y, h, zone.color, zone.label, zone.code))
    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        '<rect width="100%" height="100%" fill="#f7f1e6"/>',
        '<rect x="16" y="10" width="208" height="620" rx="12" fill="#d6c8ad" stroke="#756b5b" stroke-width="2"/>',
    ]
    for y, h, color, label, code in segments:
        lines.append(f'<rect x="28" y="{12 + y:.2f}" width="184" height="{h:.2f}" fill="{color}" opacity="0.96"/>')
        if h > 34:
            text_color = "#ffffff" if color.lower() in {"#111111", "#111827", "#1f2933", "#394047"} else "#1f2937"
            lines.append(
                f'<text x="38" y="{30 + y:.2f}" font-family="Arial" font-size="14" fill="{text_color}">{code}</text>'
            )
            if "fracture" in label.lower() or code in {"CLAY", "CARBSHL"}:
                lines.append(
                    f'<path d="M42 {24 + y:.2f} L198 {y + h:.2f}" stroke="#fef3c7" stroke-width="2" opacity="0.65"/>'
                )
    lines.extend(
        [
            f'<text x="18" y="22" font-family="Arial" font-size="13" font-weight="700" fill="#111827">{spec.code} Box {box_number}</text>',
            f'<text x="18" y="618" font-family="Arial" font-size="12" fill="#111827">{from_depth:.1f}m - {to_depth:.1f}m</text>',
            "</svg>",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def write_las(path: Path, spec: BoreholeSpec) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    curves = [
        ("DEPT", "M", "DEPTH"),
        ("SP", "MV", "SP"),
        ("RES", "OHMM", "Resistivity"),
        ("NGAM", "API", "Natural Gamma"),
        ("DENS", "G/CC", "Density"),
        ("CAL", "MM", "Caliper"),
        ("INC", "DEG", "Inclination"),
    ]
    lines = [
        "~VERSION INFORMATION",
        "VERS. 2.0 : CWLS LOG ASCII STANDARD",
        "WRAP. NO : ONE LINE PER DEPTH STEP",
        "~WELL INFORMATION",
        f"STRT.M {0.0:.3f} : FIRST INDEX VALUE",
        f"STOP.M {spec.total_depth:.3f} : LAST INDEX VALUE",
        "STEP.M 0.500 : STEP",
        "NULL. -99999 : NULL VALUE",
        f"WELL. {spec.code} : WELL",
        f"FLD. {SITE_NAME} : FIELD",
        "CTRY. INDIA : COUNTRY",
        "STAT. ODISHA : STATE",
        "~CURVE INFORMATION",
    ]
    for mnemonic, unit, description in curves:
        lines.append(f"{mnemonic}.{unit} : {description}")
    lines.extend(["~OTHER", "Synthetic demo LAS generated for workflow demonstration.", "~A"])
    depth = 0.0
    while depth <= spec.total_depth + 0.001:
        values = [
            depth,
            curve_value(spec, "sp", depth),
            curve_value(spec, "resistivity", depth),
            curve_value(spec, "ngam", depth),
            curve_value(spec, "density", depth),
            curve_value(spec, "caliper", depth),
            curve_value(spec, "inclination", depth),
        ]
        lines.append(" ".join(f"{(-99999 if value is None else value):.3f}" for value in values))
        depth += 0.5
    path.write_text("\n".join(lines), encoding="utf-8")


def write_excel(path: Path, spec: BoreholeSpec, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Descriptive Lithology"
    sheet.append(["Project", PROJECT_CODE, "Borehole", spec.code, "RL", spec.rl])
    sheet.append(["X", spec.x, "Y", spec.y, "Water Level", 18.5 + spec.marker_shift / 10])
    sheet.append([])
    sheet.append(
        [
            "From",
            "To",
            "Lithology Code",
            "Lithology",
            "Colour",
            "Recovery",
            "Recovery %",
            "RQD",
            "Seam",
            "Structural Features",
            "Remarks",
            "Core Box",
        ]
    )
    for row in rows:
        sheet.append(
            [
                row["from_depth"],
                row["to_depth"],
                row["lithology_code"],
                row["lithology_label"],
                row["logged_color"],
                row["recovery"],
                row["recovery_percent"],
                None if row["rqd"] is None else row["rqd"] * 100,
                row["seam_name"],
                row["structural_features"],
                row["remark"],
                row["image_box"],
            ]
        )
    workbook.save(path)


def seed_borehole(site: Site, spec: BoreholeSpec, output_root: Path, core_static_root: Path) -> Borehole:
    rows = interval_rows(spec)
    write_excel(output_root / spec.code / f"{spec.code}-descriptive-log.xlsx", spec, rows)
    write_las(output_root / spec.code / f"{spec.code}-geophysical.las", spec)

    borehole = Borehole(
        site=site,
        code=spec.code,
        title=f"{spec.code} Synthetic Coal Borehole",
        state="Odisha",
        total_depth=spec.total_depth,
        closure_note=f"Synthetic demo scenario: {spec.scenario}",
        source_workbook=f"{spec.code}-descriptive-log.xlsx",
        source_sheet="Descriptive Lithology",
        workflow_status=spec.status,
    )
    for row in rows:
        borehole.lithology_intervals.append(
            LithologyInterval(
                id=row["id"],
                source_row=row["source_row"],
                from_depth=row["from_depth"],
                to_depth=row["to_depth"],
                lithology_code=row["lithology_code"],
                lithology_label=row["lithology_label"],
                display_color=row["display_color"],
                logged_color=row["logged_color"],
                seam_name=row["seam_name"],
                recovery=row["recovery"],
                recovery_percent=row["recovery_percent"],
                rqd=row["rqd"],
                structural_features=row["structural_features"],
                remark=row["remark"],
                image_box=row["image_box"],
                image_file=f"demo-coal-block/{spec.code}/box-{row['image_box']:03d}.svg",
            )
        )
    for row in rows:
        if row["seam_name"]:
            borehole.seam_intervals.append(
                SeamInterval(
                    id=f"{row['id']}-seam",
                    source_row=row["source_row"],
                    name=row["seam_name"],
                    from_depth=row["from_depth"],
                    to_depth=row["to_depth"],
                    thickness=round(row["to_depth"] - row["from_depth"], 2),
                    lithology_code=row["lithology_code"],
                    lithology_label=row["lithology_label"],
                    image_box=row["image_box"],
                )
            )

    box_count = math.ceil(spec.total_depth / 20)
    for box_number in range(1, box_count + 1):
        from_depth = round((box_number - 1) * 20, 2)
        to_depth = round(min(spec.total_depth, box_number * 20), 2)
        image_name = f"demo-coal-block/{spec.code}/box-{box_number:03d}.svg"
        write_core_svg(core_static_root / image_name, spec, box_number, from_depth, to_depth)
        borehole.core_images.append(
            CoreImage(
                box_number=box_number,
                name=image_name,
                file_path=image_name,
                from_depth=from_depth,
                to_depth=to_depth,
            )
        )

    curve_specs = [
        ("ngam", "Natural Gamma", "API", "#ef4444"),
        ("resistivity", "Resistivity", "ohm.m", "#2563eb"),
        ("density", "Density", "g/cc", "#16a34a"),
        ("caliper", "Caliper", "mm", "#d97706"),
        ("sp", "Spontaneous Potential", "mV", "#7c3aed"),
        ("inclination", "Inclination", "deg", "#0f766e"),
    ]
    for key, label, unit, color in curve_specs:
        curve = Curve(key=key, label=label, unit=unit, color=color, source_type="synthetic_las")
        depth = 0.0
        while depth <= spec.total_depth + 0.001:
            value = curve_value(spec, key, depth)
            if value is not None:
                curve.samples.append(CurveSample(depth=round(depth, 2), value=round(value, 3)))
            depth += 1.0
        borehole.curves.append(curve)

    layout = default_borehole_layout()
    curve_track = next(
        track for track in layout["widgets"]["log-widget"]["tracks"] if track["type"] == "curve"
    )
    curve_track["title"] = "LAS Curves"
    curve_track["width"] = 320
    curve_track["curves"] = [
        {"curveKey": key, "label": label, "unit": unit, "color": color, "visible": True}
        for key, label, unit, color in curve_specs[:5]
    ]
    layout["widgets"]["log-widget"]["tracks"].insert(
        3,
        {"id": "core-images", "type": "images", "title": "Core Images", "visible": True, "width": 120},
    )
    borehole.display_layouts.append(
        DisplayLayout(name="Synthetic Review Display", mode="runtime", settings=layout)
    )

    borehole.source_imports.extend(
        [
            SourceImport(
                import_type="excel",
                source_name=f"{spec.code}-descriptive-log.xlsx",
                status="profiled",
                summary={
                    "template": "synthetic_descriptive_v1",
                    "scenario": spec.scenario,
                    "collar_x": spec.x,
                    "collar_y": spec.y,
                    "rl_m": spec.rl,
                    "water_level_m": round(18.5 + spec.marker_shift / 10, 2),
                },
            ),
            SourceImport(
                import_type="las",
                source_name=f"{spec.code}-geophysical.las",
                status="parsed",
                summary={"curve_count": len(curve_specs), "step_m": 0.5},
            ),
            SourceImport(
                import_type="core_images",
                source_name=f"{spec.code} core image set",
                status="mapped",
                summary={"image_count": box_count, "mapping": "synthetic_depth_manifest"},
            ),
        ]
    )
    if spec.scenario == "mobile_incremental":
        borehole.field_submissions.append(
            FieldSubmission(
                submission_type="mobile_form",
                status="synced",
                submitted_by="site-geologist",
                payload={"interval_count": len(rows), "mode": "incremental", "requires_merge": True},
            )
        )
    return borehole


def main() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    output_root = repo_root / "sample-data" / "demo-coal-block" / "boreholes"
    core_static_root = repo_root / "MTSE-65(PBH 62)"
    core_output_root = core_static_root / "demo-coal-block"

    if output_root.exists():
        shutil.rmtree(output_root)
    if core_output_root.exists():
        shutil.rmtree(core_output_root)
    output_root.mkdir(parents=True, exist_ok=True)

    db = SessionLocal()
    try:
        existing = db.scalar(
            select(Project)
            .where(Project.code == PROJECT_CODE)
            .options(selectinload(Project.sites).selectinload(Site.boreholes))
        )
        if existing is not None:
            db.delete(existing)
            db.commit()

        project = Project(code=PROJECT_CODE, name=PROJECT_NAME)
        site = Site(code=SITE_CODE, name=SITE_NAME, project=project)
        db.add(project)
        db.flush()

        boreholes = [seed_borehole(site, spec, output_root, core_static_root) for spec in SPECS]
        db.add_all(boreholes)
        db.flush()
        for borehole in boreholes:
            replace_validation_issues(borehole, validate_borehole(borehole))
        db.commit()
        print(f"Seeded {len(boreholes)} synthetic demo boreholes for {PROJECT_CODE}.")
        print(f"Wrote generated Excel/LAS fixtures under {output_root}.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
