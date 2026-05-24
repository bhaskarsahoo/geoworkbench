import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy.orm import selectinload

from app.db.models import Borehole
from app.db.session import SessionLocal
from app.services.geophysical_pdf_import import import_digitized_pdf_curves


ROOT = Path(__file__).resolve().parents[2]
PDF_PATH = ROOT / "SPNG-05-Composite.pdf"
TARGET_BOREHOLE_CODE = "PBH-62"
CURVE_ORDER = ["calp_incl", "ngamma", "sp", "res", "dens", "spr"]


def update_curve_track(borehole: Borehole, result: dict) -> None:
    layout = borehole.display_layouts[0] if borehole.display_layouts else None
    if layout is None:
        raise RuntimeError(f"Borehole {borehole.code} does not have a display layout.")

    widgets = layout.settings.setdefault("widgets", {})
    log_widget = widgets.setdefault("log-widget", {"type": "logWidget", "title": "Borehole Log"})
    tracks = log_widget.setdefault("tracks", [])
    curve_track = next((track for track in tracks if track.get("type") == "curve"), None)
    if curve_track is None:
        curve_track = {
            "id": "curves",
            "type": "curve",
            "title": "Geophysical Curves",
            "visible": True,
            "width": 520,
            "curves": [],
        }
        tracks.append(curve_track)

    curve_track["title"] = "SPNG PDF Curves"
    curve_track["visible"] = True
    curve_track["width"] = max(int(curve_track.get("width", 0)), 520)
    curve_track["curves"] = [
        {
            "curveKey": curve["key"],
            "label": curve["label"],
            "unit": curve["unit"],
            "color": curve["color"],
            "visible": True,
            "scale": {
                "mode": "manual",
                "min": curve["value_min"],
                "max": curve["value_max"],
            },
            "normalization": {"enabled": True, "method": "linear-track-scale"},
            "provenance": {
                "source": PDF_PATH.name,
                "note": "Digitized from SPNG-05 Pinnacle PDF for combined demo display.",
            },
        }
        for curve in sorted(
            result["digitized_curves"],
            key=lambda item: CURVE_ORDER.index(item["key"]) if item["key"] in CURVE_ORDER else 999,
        )
    ]
    layout.settings = {**layout.settings, "widgets": widgets}


def main() -> None:
    if not PDF_PATH.exists():
        raise FileNotFoundError(f"Missing PDF: {PDF_PATH}")

    db = SessionLocal()
    try:
        borehole = db.scalar(
            select(Borehole)
            .where(Borehole.code == TARGET_BOREHOLE_CODE)
            .options(selectinload(Borehole.display_layouts))
        )
        if borehole is None:
            raise RuntimeError(f"Could not find borehole {TARGET_BOREHOLE_CODE}.")

        result = import_digitized_pdf_curves(db, borehole, PDF_PATH)
        db.refresh(borehole, attribute_names=["display_layouts"])
        update_curve_track(borehole, result)
        flag_modified(borehole.display_layouts[0], "settings")
        db.add(borehole.display_layouts[0])
        db.commit()
        print(
            f"Attached {len(result['digitized_curves'])} SPNG PDF curve(s) "
            f"to {TARGET_BOREHOLE_CODE} display."
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
