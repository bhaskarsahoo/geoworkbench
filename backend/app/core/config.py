from functools import lru_cache
from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "GeoWorkbench API"
    api_prefix: str = "/api"
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    repo_root: Path = Path(__file__).resolve().parents[3]
    database_url: str | None = None
    upload_root: Path | None = None
    export_root: Path | None = None
    ai_provider: str = "rule_based"
    ai_base_url: str | None = "http://192.168.1.2:1234/v1"
    ai_model: str = "google/gemma-4-e4b"
    ai_timeout_seconds: float = 45
    auth_token_hours: int = 12
    mobile_otp_minutes: int = 10
    push_provider: str = "disabled"
    push_fcm_server_key: str | None = None
    push_apns_key_id: str | None = None
    push_apns_team_id: str | None = None
    push_apns_bundle_id: str | None = None

    model_config = SettingsConfigDict(env_prefix="GEOWORKBENCH_", env_file=".env")

    @model_validator(mode="after")
    def set_default_database_url(self) -> "Settings":
        if self.database_url is None:
            self.database_url = f"sqlite:///{(self.repo_root / 'geoworkbench_dev.db').as_posix()}"
        if self.upload_root is None:
            self.upload_root = self.repo_root / "runtime-data" / "uploads"
        if self.export_root is None:
            self.export_root = self.repo_root / "runtime-data" / "exports"
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
