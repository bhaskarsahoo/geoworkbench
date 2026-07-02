from app.db import models  # noqa: F401
from app.db.session import Base, engine
from sqlalchemy import inspect, text


USER_COLUMN_DEFAULTS = {
    "email": "VARCHAR(160)",
    "auth_provider": "VARCHAR(40) DEFAULT 'local'",
    "failed_login_count": "INTEGER DEFAULT 0",
    "locked_until": "TIMESTAMP NULL",
    "last_login_at": "TIMESTAMP NULL",
}


def _ensure_user_columns() -> None:
    inspector = inspect(engine)
    existing = {column["name"] for column in inspector.get_columns("users")}
    missing = [(name, ddl) for name, ddl in USER_COLUMN_DEFAULTS.items() if name not in existing]
    if not missing:
        return
    with engine.begin() as connection:
        for name, ddl in missing:
            connection.execute(text(f"ALTER TABLE users ADD COLUMN {name} {ddl}"))


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    _ensure_user_columns()
