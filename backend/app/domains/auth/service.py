import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import AuthSession, MobileOtp, User


def hash_secret(secret: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", secret.encode("utf-8"), salt.encode("utf-8"), 120_000)
    return f"pbkdf2_sha256${salt}${digest.hex()}"


def verify_secret(secret: str, stored: str | None) -> bool:
    if not stored:
        return False
    try:
        _, salt, _ = stored.split("$", 2)
    except ValueError:
        return False
    return hmac.compare_digest(hash_secret(secret, salt), stored)


def ensure_demo_users(db: Session) -> None:
    if db.scalar(select(User).where(User.username == "geologist")):
        return
    db.add_all(
        [
            User(
                username="geologist",
                display_name="Central Geologist",
                role="central_geologist",
                password_hash=hash_secret("geologist123"),
                mobile_number="+910000000001",
            ),
            User(
                username="field",
                display_name="Site Geologist",
                role="site_geologist",
                password_hash=hash_secret("field123"),
                mobile_number="+910000000002",
            ),
        ]
    )
    db.commit()


def create_session(db: Session, user: User, client_type: str) -> AuthSession:
    settings = get_settings()
    session = AuthSession(
        user_id=user.id,
        token=secrets.token_urlsafe(32),
        client_type=client_type,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.auth_token_hours),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def login(db: Session, username: str, password: str) -> tuple[User, AuthSession]:
    ensure_demo_users(db)
    user = db.scalar(select(User).where(User.username == username).where(User.is_active == 1))
    if user is None or not verify_secret(password, user.password_hash):
        raise ValueError("Invalid username or password")
    return user, create_session(db, user, "web")


def request_mobile_otp(db: Session, username: str, push_token: str | None) -> tuple[str, bool]:
    ensure_demo_users(db)
    settings = get_settings()
    user = db.scalar(select(User).where(User.username == username).where(User.is_active == 1))
    if user is None:
        raise ValueError("User not found")
    if push_token:
        user.push_token = push_token
    otp = f"{secrets.randbelow(1_000_000):06d}"
    db.add(
        MobileOtp(
            username=username,
            otp_hash=hash_secret(otp),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.mobile_otp_minutes),
        )
    )
    db.add(user)
    db.commit()
    push_ready = settings.push_provider != "disabled" and bool(user.push_token)
    return otp, push_ready


def verify_mobile_otp(
    db: Session, username: str, otp: str, push_token: str | None
) -> tuple[User, AuthSession]:
    ensure_demo_users(db)
    user = db.scalar(select(User).where(User.username == username).where(User.is_active == 1))
    if user is None:
        raise ValueError("User not found")
    if push_token:
        user.push_token = push_token
    now = datetime.now(timezone.utc)
    otp_row = db.scalar(
        select(MobileOtp)
        .where(MobileOtp.username == username)
        .where(MobileOtp.status == "pending")
        .order_by(MobileOtp.created_at.desc())
    )
    if otp_row is None:
        raise ValueError("Invalid or expired OTP")
    expires_at = otp_row.expires_at
    if expires_at is not None and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now or not verify_secret(otp, otp_row.otp_hash):
        raise ValueError("Invalid or expired OTP")
    otp_row.status = "used"
    db.add(otp_row)
    db.add(user)
    return user, create_session(db, user, "mobile")
