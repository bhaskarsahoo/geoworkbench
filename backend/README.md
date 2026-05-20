# GeoWorkbench Backend

FastAPI backend for the Phase 1 borehole correction system.

## Local Run

```powershell
cd backend
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -e .
alembic upgrade head
python scripts\\seed_demo.py
uvicorn app.main:app --reload --port 8081
```

Useful endpoints:

- `GET http://127.0.0.1:8081/health`
- `GET http://127.0.0.1:8081/api/boreholes`
- `GET http://127.0.0.1:8081/api/boreholes/1/workbench`
