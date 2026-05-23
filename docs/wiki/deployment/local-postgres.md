# Local PostgreSQL Setup

PostgreSQL 17 is installed on the development machine.

Create a local database using the local `postgres/postgres` account:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" "postgresql://postgres:postgres@localhost:5432/postgres" -c "CREATE DATABASE geoworkbench OWNER postgres;"
```

Copy the profile:

```powershell
Copy-Item .env.postgres.example .env
```

Edit `.env` and set the password:

```text
GEOWORKBENCH_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/geoworkbench
```

Run migrations and seed/demo import scripts:

```powershell
cd backend
alembic upgrade head
python scripts\seed_demo.py
python scripts\profile_and_import_excel_workbooks.py
python scripts\import_ctsj_ai_test.py
```

For Android testing, run the API on the LAN:

```powershell
python -m uvicorn app.main:app --host 0.0.0.0 --port 8081
```

Local demo auth:

- Web: `geologist` / `geologist123`
- Mobile: request OTP for `field`
- Push is disabled by default, so the local OTP endpoint returns `dev_otp` for testing.

Push notification settings are intentionally placeholders until FCM/APNS credentials are available:

```text
GEOWORKBENCH_PUSH_PROVIDER=disabled
GEOWORKBENCH_PUSH_FCM_SERVER_KEY=
GEOWORKBENCH_PUSH_APNS_KEY_ID=
GEOWORKBENCH_PUSH_APNS_TEAM_ID=
GEOWORKBENCH_PUSH_APNS_BUNDLE_ID=
```
