from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.domains.auth import service
from app.domains.auth.schemas import (
    LoginRequest,
    MobileOtpOut,
    MobileOtpRequest,
    MobileOtpVerifyRequest,
    TokenOut,
)

router = APIRouter()


@router.post("/login", response_model=TokenOut)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenOut:
    try:
        user, session = service.login(db, payload.username, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    return TokenOut(token=session.token, user=user, expires_at=session.expires_at.isoformat())


@router.post("/mobile/request-otp", response_model=MobileOtpOut)
def request_mobile_otp(payload: MobileOtpRequest, db: Session = Depends(get_db)) -> MobileOtpOut:
    try:
        otp, push_ready = service.request_mobile_otp(db, payload.username, payload.push_token)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    settings = get_settings()
    return MobileOtpOut(
        status="sent" if push_ready else "dev_otp_generated",
        message="OTP sent through push provider." if push_ready else "Push provider disabled; use dev OTP.",
        dev_otp=otp if settings.push_provider == "disabled" else None,
    )


@router.post("/mobile/verify-otp", response_model=TokenOut)
def verify_mobile_otp(payload: MobileOtpVerifyRequest, db: Session = Depends(get_db)) -> TokenOut:
    try:
        user, session = service.verify_mobile_otp(db, payload.username, payload.otp, payload.push_token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    return TokenOut(token=session.token, user=user, expires_at=session.expires_at.isoformat())
