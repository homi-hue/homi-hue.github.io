# Homi-Hue Flood Hazard Backend

ESP32-S3 sensor node -> HTTPS POST -> FastAPI -> SQLite -> React dashboard.

## Run locally

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
set DEVICE_API_KEY=my-secret-key
uvicorn main:app --reload --port 8000
```

Test:
`GET http://localhost:8000/api/v1/health`

Send a reading:
```bash
curl -X POST http://localhost:8000/api/v1/readings ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: my-secret-key" ^
  -d "{"device_id":"ESP32-S3-01","temperature":29.4,"humidity":78,"water_level_cm":42,"rainfall_mm":18,"rainfall_intensity_mm_h":32,"soil_moisture":76,"vibration":0.12}"
```

## Production

Deploy the `backend` directory to Render (or another HTTPS Python host). Put the generated public URL into the Vite frontend environment as `VITE_API_BASE_URL`.

For a real deployment, use PostgreSQL/TimescaleDB instead of SQLite if you need durable long-term sensor history.
