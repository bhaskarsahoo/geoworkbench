import csv
import re
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import SourceImport, ImportProfile, SourceFile
from app.domains.imports.schemas import SourceFileCreate
from app.services.excel_import import import_excel_workbook, profile_excel_workbook


def ensure_default_profiles(db: Session) -> None:
    profiles = [
        ImportProfile(
            name="PBH Excel Workbook",
            profile_type="excel",
            description="Profile detected from PBH descriptive lithology workbook.",
            mapping={
                "template_key": "pbh_descriptive_v1",
                "sheet_detection": ["Lithology depth", "Description As Per Core Recovery"],
                "header_rows": [9, 10, 11],
                "data_start_row": 12,
                "lithology": {
                    "from_depth": "E",
                    "thickness": "F",
                    "recovery": "G",
                    "lithology_code": "H",
                    "logged_color": "I",
                    "structural_features": "J",
                    "core_dip": "K",
                    "seam_name": "L",
                    "rqd_fraction": "M",
                    "remark": "N",
                },
                "status": "active_profile",
            },
        ),
        ImportProfile(
            name="CTSJ Excel Workbook",
            profile_type="excel",
            description="Profile detected from CTSJ descriptive lithology workbook.",
            mapping={
                "template_key": "ctsj_descriptive_v1",
                "sheet_detection": ["DRILLING RUN", "DEPTH & THICKNESS AFTER ADJUSTMENT"],
                "header_rows": [7, 8],
                "data_start_row": 9,
                "lithology": {
                    "from_depth": "F",
                    "thickness": "G",
                    "recovery": "H",
                    "lithology_code": "I",
                    "grain_size": "J",
                    "logged_color": "K",
                    "rqd_piece_lengths": "L",
                    "rqd_percent": "M",
                    "structural_features": "N",
                    "core_dip": "O",
                    "seam_name": "P",
                    "remark": "Q",
                },
                "status": "active_profile",
            },
        ),
        ImportProfile(
            name="LAS Geophysical Curves",
            profile_type="las",
            description="Generic LAS curve import profile for depth-indexed geophysical logs.",
            mapping={
                "depth": "DEPT",
                "curves": ["GR", "RHOB", "RES", "CALI", "DT"],
                "status": "draft_profile",
            },
        ),
        ImportProfile(
            name="Corebox Image Folder",
            profile_type="images",
            description="Core image folder/profile with manual or inferred box-depth mapping.",
            mapping={"box_number": "filename_number", "depth_mapping": "manual_or_inferred"},
        ),
    ]
    changed = False
    for profile in profiles:
        existing = db.scalar(select(ImportProfile).where(ImportProfile.name == profile.name))
        if existing is None:
            db.add(profile)
            changed = True
        elif profile.profile_type == "excel" and existing.mapping.get("template_key") != profile.mapping.get("template_key"):
            existing.description = profile.description
            existing.mapping = profile.mapping
            db.add(existing)
            changed = True
    if changed:
        db.commit()


def list_import_profiles(db: Session) -> list[ImportProfile]:
    ensure_default_profiles(db)
    return list(db.scalars(select(ImportProfile).order_by(ImportProfile.profile_type, ImportProfile.name)))


def create_source_file(db: Session, payload: SourceFileCreate) -> SourceFile:
    source_file = SourceFile(
        borehole_id=payload.borehole_id,
        file_type=payload.file_type,
        original_name=payload.original_name,
        storage_path=payload.storage_path,
        status="uploaded",
        file_metadata=payload.file_metadata,
    )
    db.add(source_file)
    db.commit()
    db.refresh(source_file)
    return source_file


def safe_filename(filename: str) -> str:
    clean = re.sub(r"[^A-Za-z0-9._-]+", "_", Path(filename).name).strip("._")
    return clean or "upload.bin"


def upload_source_file(
    db: Session,
    file: UploadFile,
    file_type: str,
    borehole_id: int | None,
) -> SourceFile:
    settings = get_settings()
    if settings.upload_root is None:
        raise RuntimeError("Upload root is not configured")

    clean_name = safe_filename(file.filename or "upload.bin")
    relative_dir = Path("unassigned" if borehole_id is None else f"borehole-{borehole_id}")
    target_dir = settings.upload_root / relative_dir
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / f"{uuid4().hex}-{clean_name}"

    with target_path.open("wb") as output:
        shutil.copyfileobj(file.file, output)

    source_file = SourceFile(
        borehole_id=borehole_id,
        file_type=file_type,
        original_name=clean_name,
        storage_path=str(target_path.relative_to(settings.repo_root)),
        status="uploaded",
        file_metadata={
            "content_type": file.content_type,
            "storage_mode": "local",
            "size_bytes": target_path.stat().st_size,
        },
    )
    db.add(source_file)
    db.commit()
    db.refresh(source_file)
    return source_file


def list_source_files(db: Session, borehole_id: int | None = None) -> list[SourceFile]:
    stmt = select(SourceFile).order_by(SourceFile.uploaded_at.desc(), SourceFile.id.desc())
    if borehole_id is not None:
        stmt = stmt.where(SourceFile.borehole_id == borehole_id)
    return list(db.scalars(stmt))


def update_source_file_status(db: Session, source_file_id: int, status: str) -> SourceFile:
    source_file = db.get(SourceFile, source_file_id)
    if source_file is None:
        raise ValueError("Source file not found")
    source_file.status = status
    db.add(source_file)
    db.commit()
    db.refresh(source_file)
    return source_file


def preview_delimited_file(path: Path) -> dict:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        sample = handle.read(4096)
        handle.seek(0)
        dialect = csv.Sniffer().sniff(sample) if sample.strip() else csv.excel
        reader = csv.DictReader(handle, dialect=dialect)
        rows = []
        for index, row in enumerate(reader):
            if index < 5:
                rows.append(row)
            else:
                break
        row_count = index + 1 if "index" in locals() else 0
        for _ in reader:
            row_count += 1
        return {
            "columns": reader.fieldnames or [],
            "preview_rows": rows,
            "row_count": row_count,
            "parser": "csv_preview",
        }


def process_source_file(db: Session, source_file_id: int) -> tuple[SourceFile, SourceImport, dict]:
    source_file = db.get(SourceFile, source_file_id)
    if source_file is None:
        raise ValueError("Source file not found")

    settings = get_settings()
    storage_path = Path(source_file.storage_path)
    absolute_path = storage_path if storage_path.is_absolute() else settings.repo_root / storage_path
    source_file.status = "parsing"

    summary: dict
    try:
        suffix = absolute_path.suffix.lower()
        if suffix in {".csv", ".txt"}:
            summary = preview_delimited_file(absolute_path)
        elif suffix in {".xlsx", ".xlsm"}:
            summary = profile_excel_workbook(absolute_path)
        else:
            summary = {
                "parser": "metadata_only",
                "message": "Parser not implemented yet for this file type.",
                "extension": suffix,
            }
        status = "parsed" if summary.get("parser") != "metadata_only" else "registered"
    except Exception as exc:
        summary = {"parser": "failed", "error": str(exc)}
        status = "failed"

    source_file.status = status
    source_file.file_metadata = {**(source_file.file_metadata or {}), "parse_summary": summary}
    source_import = SourceImport(
        borehole_id=source_file.borehole_id,
        import_type=source_file.file_type,
        source_name=source_file.original_name,
        status=status,
        summary=summary,
    )
    db.add(source_file)
    db.add(source_import)
    db.flush()
    source_file.source_import_id = source_import.id
    db.commit()
    db.refresh(source_file)
    db.refresh(source_import)
    return source_file, source_import, summary


def import_source_file_as_borehole(db: Session, source_file_id: int) -> tuple[SourceFile, int, str, dict]:
    source_file = db.get(SourceFile, source_file_id)
    if source_file is None:
        raise ValueError("Source file not found")

    settings = get_settings()
    storage_path = Path(source_file.storage_path)
    absolute_path = storage_path if storage_path.is_absolute() else settings.repo_root / storage_path
    if absolute_path.suffix.lower() not in {".xlsx", ".xlsm"}:
        raise ValueError("Only supported Excel workbooks can be imported as boreholes.")

    borehole = import_excel_workbook(db, absolute_path)
    source_file.borehole_id = borehole.id
    source_file.status = "imported"
    source_file.file_metadata = {
        **(source_file.file_metadata or {}),
        "imported_borehole_code": borehole.code,
    }
    db.add(source_file)
    db.commit()
    db.refresh(source_file)
    return source_file, borehole.id, borehole.code, profile_excel_workbook(absolute_path)
