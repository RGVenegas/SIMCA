from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from api.schemas.lectura_schema import LecturaRequest
from application.services.water_quality_service import WaterQualityService
from domain.entities.sensor_reading import SensorReading
from domain.enums.node_status import NodeStatus
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

    # Auto-resolve alerts from offline nodes in the same sector
    sector_nodes = [n for n in repo.get_all_nodes() if n.sector_id == lectura.sector_id]
    offline_node_ids = {n.id for n in sector_nodes if n.id != lectura.node_id and n.status == NodeStatus.Offline}
    if offline_node_ids:
        stale_alerts = [
            a for a in repo.get_alerts_by_sector(lectura.sector_id)
            if a.is_active and a.node_id in offline_node_ids
        ]
        for alert in stale_alerts:
            repo.resolve(alert.id)

    # Limpiar alertas con más de 12 horas de antigüedad
    repo.delete_old_alerts(hours=12)

    return {"status": reading.status.value, "node_id": lectura.node_id}
