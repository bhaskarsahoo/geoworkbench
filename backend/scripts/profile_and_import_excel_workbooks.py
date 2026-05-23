import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app.services.excel_import import import_excel_workbook, profile_excel_workbook


ROOT = Path(__file__).resolve().parents[2]
WORKBOOKS = [
    (ROOT / "DOC-20260510-WA0000..xlsx", "-XLSX"),
    (ROOT / "DESCRIPTIVE LITHOLOGY CTSJ-30 (P-02) Running.xlsx", ""),
]


def main() -> None:
    db = SessionLocal()
    try:
        for workbook_path, suffix in WORKBOOKS:
            if not workbook_path.exists():
                print(f"Missing workbook: {workbook_path.name}")
                continue
            profile = profile_excel_workbook(workbook_path)
            print("\n" + workbook_path.name)
            print(json.dumps(profile["summary"], indent=2))
            borehole = import_excel_workbook(db, workbook_path, code_suffix=suffix)
            print(f"Imported/available borehole {borehole.code} with id {borehole.id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
