# Windows VM Deployment With IIS

This profile is suitable when the customer prefers Windows Server operations.

## Components

- IIS serves the frontend static build.
- IIS reverse proxies `/api/*` to FastAPI on `127.0.0.1:8081`.
- IIS serves or proxies `/assets/*` depending on file storage strategy.
- FastAPI runs as a Windows Service.
- Background worker runs as a Windows Service.
- PostgreSQL is installed directly on the VM or, preferably, on a separate database VM.
- Redis or a queue service is installed directly if background jobs require it.

## Request Flow

```text
Browser
  -> IIS HTTPS site
    -> / static frontend files
    -> /api reverse proxy to FastAPI
    -> /assets static/proxy route for images and files
```

## IIS Setup

Recommended IIS modules:

- URL Rewrite.
- Application Request Routing.

Suggested bindings:

- HTTPS only in production.
- HTTP redirected to HTTPS.

Suggested routes:

- `/` -> frontend `dist/`.
- `/api/*` -> `http://127.0.0.1:8081/api/*`.
- `/health` -> `http://127.0.0.1:8081/health` or separate monitoring route.
- `/assets/*` -> static file directory or API/static backend.

## FastAPI Windows Service

Use a service wrapper such as NSSM for the first deployment.

Example service command:

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8081
```

Working directory:

```text
D:\GeoWorkbench\backend
```

Environment:

```text
GEOWORKBENCH_DATABASE_URL=postgresql+psycopg://user:password@db-server:5432/geoworkbench
GEOWORKBENCH_UPLOAD_ROOT=D:\GeoWorkbench\data\uploads
```

## Deployment Steps

1. Install Python runtime.
2. Install PostgreSQL or configure external PostgreSQL connection.
3. Install backend package.
4. Run database migrations:

```powershell
cd D:\GeoWorkbench\backend
alembic upgrade head
```

5. Build frontend:

```powershell
cd D:\GeoWorkbench\frontend
npm install
npm run build
```

6. Copy `frontend/dist` to IIS site root.
7. Configure IIS reverse proxy for `/api`.
8. Create Windows Service for FastAPI.
9. Create Windows Service for workers when worker implementation is added.
10. Configure backup jobs for PostgreSQL and uploaded files.

## Notes

- Do not expose Uvicorn directly to users; keep it behind IIS.
- Keep API bound to `127.0.0.1` unless using an internal load balancer.
- Use a dedicated service account.
- Store secrets outside source control.

