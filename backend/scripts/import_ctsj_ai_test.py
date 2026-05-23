import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app.services.excel_import import import_normalized_dataset


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "sample-data" / "ctsj-30" / "ctsj-30-ai-test.json"


def normalize_fixture(raw: dict) -> dict:
    dataset = {
        "profile": {
            "parser": "experiment_fixture",
            "template": {"key": "ctsj_ai_test_fixture"},
            "experiment": raw.get("experiment"),
        },
        "borehole": {
            "id": "CTSJ-30-P-02-AI-TEST",
            "title": "CTSJ-30(P-02) AI Test Fixture",
            "block": "SARADHAPUR-JALATAP",
            "state": None,
            "totalDepth": raw["borehole"]["totalDepth"],
            "closureNote": "Controlled AI-test fixture with planted data issues.",
            "workflowStatus": "imported_with_warnings",
            "sourceWorkbook": raw["borehole"]["sourceWorkbook"],
            "sourceSheet": raw["borehole"]["sourceSheet"],
        },
        "lithologyIntervals": [],
        "seamIntervals": raw.get("seamIntervals", []),
    }
    for item in raw["lithologyIntervals"]:
        next_item = dict(item)
        if "rqd" not in next_item:
            rqd_percent = next_item.get("rqdPercent")
            next_item["rqd"] = round(rqd_percent / 100, 4) if rqd_percent is not None else None
        if next_item.get("lithologyLabel") is None:
            next_item["lithologyLabel"] = "Unknown"
        dataset["lithologyIntervals"].append(next_item)
    return dataset


def main() -> None:
    raw = json.loads(SOURCE.read_text(encoding="utf-8"))
    dataset = normalize_fixture(raw)
    db = SessionLocal()
    try:
        borehole = import_normalized_dataset(db, dataset)
        print(f"Imported/available {borehole.code} with id {borehole.id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
