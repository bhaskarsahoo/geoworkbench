from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.boreholes import service
from app.domains.boreholes.schemas import (
    BoreholeListItem,
    BoreholeWorkbenchOut,
    LithologyIntervalOut,
    LithologyIntervalPatch,
)

router = APIRouter()


@router.get("", response_model=list[BoreholeListItem])
def list_boreholes(db: Session = Depends(get_db)) -> list[BoreholeListItem]:
    return service.list_boreholes(db)


@router.get("/{borehole_id}/workbench", response_model=BoreholeWorkbenchOut)
def get_workbench(borehole_id: int, db: Session = Depends(get_db)) -> BoreholeWorkbenchOut:
    try:
        return service.get_workbench(db, borehole_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/intervals/{interval_id}", response_model=LithologyIntervalOut)
def patch_interval(
    interval_id: str, patch: LithologyIntervalPatch, db: Session = Depends(get_db)
) -> LithologyIntervalOut:
    try:
        return service.update_lithology_interval(db, interval_id, patch)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

