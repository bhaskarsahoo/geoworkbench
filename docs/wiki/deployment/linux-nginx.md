# Linux VM Deployment With Nginx

This profile is suitable when the customer allows Linux operations.

## Components

- Nginx serves the frontend static build.
- Nginx reverse proxies `/api/*` to FastAPI on `127.0.0.1:8081`.
- FastAPI runs as a `systemd` service.
- Background worker runs as a separate `systemd` service.
- PostgreSQL is installed directly or hosted on a separate database VM.
- Redis or a queue service is installed directly if background jobs require it.

## Request Flow

```text
Browser
  -> Nginx HTTPS site
    -> / static frontend files
    -> /api reverse proxy to FastAPI
    -> /assets static/proxy route for images and files
```

## Example Nginx Shape

```nginx
server {
    listen 80;
    server_name geoworkbench.example.com;

    root /opt/geoworkbench/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8081/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8081/health;
    }
}
```

## Example API Service

```ini
[Unit]
Description=GeoWorkbench API
After=network.target

[Service]
WorkingDirectory=/opt/geoworkbench/backend
EnvironmentFile=/etc/geoworkbench/api.env
ExecStart=/opt/geoworkbench/venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8081
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Deployment Steps

1. Install Python runtime, Node.js build tooling, Nginx, PostgreSQL client tools.
2. Install backend package into a virtual environment.
3. Configure `/etc/geoworkbench/api.env`.
4. Run database migrations:

```bash
cd /opt/geoworkbench/backend
alembic upgrade head
```

5. Build frontend:

```bash
cd /opt/geoworkbench/frontend
npm install
npm run build
```

6. Configure Nginx.
7. Enable and start `geoworkbench-api.service`.
8. Add worker service when worker implementation is added.
9. Configure PostgreSQL and uploaded-file backups.

## Notes

- Use HTTPS in production.
- Keep API bound to `127.0.0.1` behind Nginx.
- Store uploads on a durable path, mounted volume, network share, or object storage.
- Keep secrets outside source control.

