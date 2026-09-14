import os, sqlite3, asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = os.getenv("DB_PATH", "hazard.db")
DEVICE_API_KEY = os.getenv("DEVICE_API_KEY", "change-me")
FRONTEND_ORIGINS = os.getenv(
    "FRONTEND_ORIGINS",
    "https://homi-hue.github.io,http://localhost:5173"
).split(",")

app = FastAPI(title="Homi-Hue Flood Hazard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in FRONTEND_ORIGINS if x.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Reading(BaseModel):
    device_id: str = Field(default="ESP32-S3-01", max_length=64)
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    water_level_cm: Optional[float] = None
    rainfall_mm: Optional[float] = None
    rainfall_intensity_mm_h: Optional[float] = None
    soil_moisture: Optional[float] = None
    vibration: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: Optional[datetime] = None

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with db() as c:
        c.execute("""
        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id TEXT NOT NULL,
            temperature REAL,
            humidity REAL,
            water_level_cm REAL,
            rainfall_mm REAL,
            rainfall_intensity_mm_h REAL,
            soil_moisture REAL,
            vibration REAL,
            latitude REAL,
            longitude REAL,
            timestamp TEXT NOT NULL
        )
        """)
        c.execute("CREATE INDEX IF NOT EXISTS idx_readings_time ON readings(timestamp)")
        c.commit()

@app.on_event("startup")
def startup():
    init_db()

def flood_risk(r: dict):
    # Simple explainable MVP score. Replace with your TinyML/ML model later.
    score = 0.0

    wl = r.get("water_level_cm")
    rain = r.get("rainfall_intensity_mm_h")
    soil = r.get("soil_moisture")
    vib = r.get("vibration")

    if wl is not None:
        score += min(max(wl / 100.0, 0), 1) * 45
    if rain is not None:
        score += min(max(rain / 100.0, 0), 1) * 30
    if soil is not None:
        # Accept either 0-1 or 0-100 input.
        s = soil * 100 if soil <= 1 else soil
        score += min(max(s / 100.0, 0), 1) * 20
    if vib is not None:
        score += min(max(vib / 5.0, 0), 1) * 5

    score = round(min(score, 100), 1)
    level = "LOW" if score < 25 else "MEDIUM" if score < 50 else "HIGH" if score < 75 else "CRITICAL"
    return {"score": score, "level": level}

def normalize(row):
    d = dict(row)
    d["risk"] = flood_risk(d)
    return d

@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "flood-hazard-api"}

@app.post("/api/v1/readings")
async def ingest(reading: Reading, x_api_key: str = Header(default="")):
    if x_api_key != DEVICE_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid device API key")

    ts = reading.timestamp or datetime.now(timezone.utc)
    ts = ts.astimezone(timezone.utc).isoformat()

    data = reading.model_dump()
    data["timestamp"] = ts

    with db() as c:
        cur = c.execute("""
            INSERT INTO readings
            (device_id, temperature, humidity, water_level_cm, rainfall_mm,
             rainfall_intensity_mm_h, soil_moisture, vibration, latitude, longitude, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data["device_id"], data["temperature"], data["humidity"],
            data["water_level_cm"], data["rainfall_mm"],
            data["rainfall_intensity_mm_h"], data["soil_moisture"],
            data["vibration"], data["latitude"], data["longitude"], data["timestamp"]
        ))
        row = c.execute("SELECT * FROM readings WHERE id=?", (cur.lastrowid,)).fetchone()

    payload = normalize(row)

    # Push to connected dashboards.
    dead = []
    for ws in clients:
        try:
            await ws.send_json(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        clients.discard(ws)

    return payload

@app.get("/api/v1/latest")
def latest(device_id: Optional[str] = None):
    with db() as c:
        if device_id:
            row = c.execute(
                "SELECT * FROM readings WHERE device_id=? ORDER BY id DESC LIMIT 1",
                (device_id,)
            ).fetchone()
        else:
            row = c.execute("SELECT * FROM readings ORDER BY id DESC LIMIT 1").fetchone()

    if not row:
        return {"message": "No sensor readings yet", "data": None}
    return normalize(row)

@app.get("/api/v1/history")
def history(
    hours: int = Query(default=24, ge=1, le=168),
    device_id: Optional[str] = None
):
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()

    with db() as c:
        if device_id:
            rows = c.execute(
                "SELECT * FROM readings WHERE device_id=? AND timestamp>=? ORDER BY timestamp ASC",
                (device_id, cutoff)
            ).fetchall()
        else:
            rows = c.execute(
                "SELECT * FROM readings WHERE timestamp>=? ORDER BY timestamp ASC",
                (cutoff,)
            ).fetchall()

    return [normalize(r) for r in rows]

clients: set[WebSocket] = set()

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    clients.add(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        clients.discard(ws)
    except Exception:
        clients.discard(ws)
