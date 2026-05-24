import csv
import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.db.models import Borehole, DisplayLayout, Project, Site
from app.db.session import SessionLocal
from app.domains.display_layouts.defaults import default_borehole_layout
from app.services.geophysical_pdf_import import import_digitized_pdf_curves


ROOT = Path(__file__).resolve().parents[2]
PDF_PATH = ROOT / "SPNG-05-Composite.pdf"
OUTPUT_DIR = ROOT / "runtime-data" / "geophysical-pdf" / "SPNG-05"
CURVE_ORDER = ["calp_incl", "ngamma", "sp", "res", "dens", "spr"]


def ensure_spng_borehole(db) -> Borehole:
    borehole = db.scalar(select(Borehole).where(Borehole.code == "SPNG-05"))
    if borehole is not None:
        return borehole

    project = db.scalar(select(Project).where(Project.code == "RAHAM-COAL"))
    if project is None:
        project = Project(code="RAHAM-COAL", name="Raham Coal Block")
        db.add(project)
        db.flush()

    site = db.scalar(select(Site).where(Site.code == "SPNG").where(Site.project_id == project.id))
    if site is None:
        site = Site(project_id=project.id, code="SPNG", name="North Karanpura Coalfield")
        db.add(site)
        db.flush()

    borehole = Borehole(
        site_id=site.id,
        code="SPNG-05",
        title="SPNG-05 Composite Geophysical Log",
        state="Jharkhand",
        total_depth=393.0,
        closure_note="Digitized from Pinnacle composite PDF export for demo review.",
        source_workbook=PDF_PATH.name,
        source_sheet="Pinnacle Composite PDF",
        workflow_status="geophysical_pdf_digitized",
    )
    borehole.display_layouts.append(
        DisplayLayout(name="Geophysical Review", mode="runtime", settings=default_borehole_layout())
    )
    db.add(borehole)
    db.commit()
    db.refresh(borehole)
    return borehole


def write_outputs(result: dict) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    summary = {key: value for key, value in result.items() if key != "digitized_curves"}
    summary["curves"] = [
        {
            "key": curve["key"],
            "label": curve["label"],
            "unit": curve["unit"],
            "samples": len(curve["samples"]),
            "stats": curve["stats"],
        }
        for curve in result["digitized_curves"]
    ]
    (OUTPUT_DIR / "spng-05-pdf-profile.json").write_text(
        json.dumps(summary, indent=2), encoding="utf-8"
    )

    with (OUTPUT_DIR / "spng-05-digitized-curves.csv").open(
        "w", encoding="utf-8", newline=""
    ) as handle:
        writer = csv.writer(handle)
        writer.writerow(["curve_key", "curve_label", "unit", "depth", "value", "point_count"])
        for curve in result["digitized_curves"]:
            for sample in curve["samples"]:
                writer.writerow(
                    [
                        curve["key"],
                        curve["label"],
                        curve["unit"],
                        sample["depth"],
                        sample["value"],
                        sample["point_count"],
                    ]
                )


def curve_scale(samples: list[dict]) -> dict:
    values = [sample["value"] for sample in samples]
    if not values:
        return {"mode": "manual", "min": 0, "max": 100}
    return {
        "mode": "manual",
        "min": int(min(values)),
        "max": max(int(max(values)) + 1, int(min(values)) + 1),
    }


def update_spng_display_layout(db, borehole: Borehole, result: dict) -> None:
    layout = borehole.display_layouts[0] if borehole.display_layouts else None
    if layout is None:
        layout = DisplayLayout(borehole_id=borehole.id, name="Geophysical Review", mode="runtime")

    settings = default_borehole_layout()
    settings["widgets"]["log-widget"]["title"] = "SPNG-05 Composite Log"
    settings["widgets"]["log-widget"]["tracks"] = [
        {"id": "depth", "type": "depthAxis", "title": "Depth", "visible": True, "width": 70},
        {
            "id": "curves",
            "type": "curve",
            "title": "Geophysical Curves",
            "visible": True,
            "width": 520,
            "curves": [
                {
                    "curveKey": curve["key"],
                    "label": curve["label"],
                    "unit": curve["unit"],
                    "color": curve["color"],
                    "visible": True,
                    "scale": curve_scale(curve["samples"]),
                    "normalization": {"enabled": True, "method": "linear-track-scale"},
                }
                for curve in sorted(
                    result["digitized_curves"],
                    key=lambda item: CURVE_ORDER.index(item["key"])
                    if item["key"] in CURVE_ORDER
                    else 999,
                )
            ],
        },
        {
            "id": "remarks",
            "type": "remarks",
            "title": "Interpretation Notes",
            "visible": True,
            "width": 180,
        },
    ]
    layout.name = "SPNG-05 Geophysical Review"
    layout.mode = "runtime"
    layout.settings = settings
    db.add(layout)
    db.commit()


def main() -> None:
    if not PDF_PATH.exists():
        raise FileNotFoundError(f"Missing PDF: {PDF_PATH}")

    db = SessionLocal()
    try:
        borehole = ensure_spng_borehole(db)
        result = import_digitized_pdf_curves(db, borehole, PDF_PATH)
        db.refresh(borehole, attribute_names=["display_layouts"])
        update_spng_display_layout(db, borehole, result)
        write_outputs(result)
        print(
            f"Imported {len(result['digitized_curves'])} digitized PDF curve(s) "
            f"into borehole {borehole.code}."
        )
        for curve in result["digitized_curves"]:
            print(f"- {curve['key']}: {len(curve['samples'])} samples, {curve['stats']}")
        print(f"Wrote profile and CSV to {OUTPUT_DIR.relative_to(ROOT)}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
