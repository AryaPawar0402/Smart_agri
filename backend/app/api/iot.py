"""
API Endpoints for IoT Sensor Telemetry & ESP32 Integration
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.schemas.iot import SensorDataInput, SensorDataResponse, IoTStatusSummary
from backend.app.services.iot_service import IoTService

router = APIRouter(prefix="/api/iot", tags=["IoT Telemetry"])


@router.get("/latest", response_model=IoTStatusSummary)
def get_latest_sensor_data(db: Session = Depends(get_db)):
    """Fetch current live or simulated telemetry summary"""
    return IoTService.get_latest_telemetry(db)


@router.get("/history", response_model=List[SensorDataResponse])
def get_sensor_history(
    hours: int = Query(24, ge=1, le=168),
    limit: int = Query(50, ge=5, le=200),
    db: Session = Depends(get_db)
):
    """Fetch historical sensor telemetry for charts"""
    return IoTService.get_telemetry_history(db, hours=hours, limit=limit)


@router.post("/sensor-data", response_model=SensorDataResponse)
def ingest_sensor_data(data: SensorDataInput, db: Session = Depends(get_db)):
    """
    Hardware Ingestion Endpoint for ESP32 / Gateway nodes:
    POST JSON with device_id, soil_moisture, ph, N, P, K, temp, humidity, rain_detected.
    """
    try:
        record = IoTService.record_sensor_data(data, db)
        return record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record sensor data: {str(e)}")


@router.post("/toggle-demo")
def toggle_demo_mode(enabled: bool = Query(...)):
    """Toggle between Simulated Demo Mode and Real Live ESP32 Mode"""
    state = IoTService.set_demo_mode(enabled)
    return {
        "demo_mode": state,
        "mode_label": "Demo / Simulated Telemetry" if state else "Real Live ESP32 Mode"
    }
