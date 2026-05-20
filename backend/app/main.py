from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.domains.boreholes.router import router as borehole_router


settings = get_settings()
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/assets/corebox", StaticFiles(directory=settings.repo_root / "MTSE-65(PBH 62)"), name="corebox")
app.include_router(borehole_router, prefix=f"{settings.api_prefix}/boreholes", tags=["boreholes"])

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
