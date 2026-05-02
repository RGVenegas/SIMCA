from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from api.schemas.lectura_schema import LecturaRequest
from application.services.water_quality_service import WaterQualityService
from domain.entities.sensor_reading import SensorReading
from infrastructure.database import get_session
from infrastructure.notifications.mock_sms_service import MockSmsService
from infrastructure.repositories.sqlite_repository import SQLiteRepository

router = APIRouter()

@router.post("/sensores/lectura")
def recibir_lectura(lectura: LecturaRequest, session: Session = Depends(get_session)):
    repo = SQLiteRepository(session)
    service = WaterQualityService(
        notifier=MockSmsService(),
        sensor_repo=repo,
        alert_repo=repo,
    )
    reading = SensorReading(
        node_id=lectura.node_id,
        sector_id=lectura.sector_id,
        ph=lectura.ph,
        turbidity=lectura.turbidity,
    )
    service.evaluate_reading(reading)
    return {"status": reading.status.value, "node_id": lectura.node_id}
