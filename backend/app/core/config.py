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

    model_config = SettingsConfigDict(env_prefix="GEOWORKBENCH_", env_file=".env")

    @model_validator(mode="after")
    def set_default_database_url(self) -> "Settings":
        if self.database_url is None:
            self.database_url = f"sqlite:///{(self.repo_root / 'geoworkbench_dev.db').as_posix()}"
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
