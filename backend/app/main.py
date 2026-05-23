from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.domains.boreholes.router import router as borehole_router
from app.domains.ai.router import router as ai_router
from app.domains.auth.router import router as auth_router
from app.domains.exports.router import router as exports_router
from app.domains.imports.router import router as imports_router
from app.domains.mobile.router import router as mobile_router
from app.domains.validation.router import router as validation_router


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
app.include_router(ai_router, prefix=f"{settings.api_prefix}/ai", tags=["ai"])
app.include_router(auth_router, prefix=f"{settings.api_prefix}/auth", tags=["auth"])
app.include_router(exports_router, prefix=f"{settings.api_prefix}/exports", tags=["exports"])
app.include_router(imports_router, prefix=f"{settings.api_prefix}/imports", tags=["imports"])
app.include_router(mobile_router, prefix=f"{settings.api_prefix}/mobile", tags=["mobile"])
app.include_router(validation_router, prefix=f"{settings.api_prefix}/validation", tags=["validation"])

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
