# GeoWorkbench Mobile Demo

Flutter field-capture demo for Android/iOS.

Current demo capabilities:

- Configure backend API URL.
- Create a mobile-submitted borehole by copying an existing central borehole.
- Append a simple field lithology interval.
- Sync the submission to the FastAPI backend.
- See the new borehole appear in the central web workbench.

## Backend URL

For a physical Android phone on the same Wi-Fi as this development machine, use:

```text
http://192.168.1.3:8081
```

The backend must listen on the network interface, not only localhost:

```powershell
cd backend
$env:GEOWORKBENCH_AI_PROVIDER='local_openai'
$env:GEOWORKBENCH_AI_BASE_URL='http://192.168.1.2:1234/v1'
$env:GEOWORKBENCH_AI_MODEL='google/gemma-4-e4b'
python -m uvicorn app.main:app --host 0.0.0.0 --port 8081
```

If testing with Android Emulator, use:

```text
http://10.0.2.2:8081
```

## Run

Flutter CLI is required.

```powershell
cd mobile\geoworkbench_mobile
flutter pub get
flutter run
```

If platform folders are missing because this scaffold was created without the Flutter CLI, run:

```powershell
flutter create --platforms=android,ios .
```

Then run the app again.
