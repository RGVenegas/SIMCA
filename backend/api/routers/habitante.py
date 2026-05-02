from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from api.schemas.response_schemas import AlertResponse, EstadoResponse
from application.services.water_quality_service import WaterQualityService
from domain.enums.water_status import WaterStatus
from infrastructure.database import get_session
from infrastructure.repositories.sqlite_repository import SQLiteRepository

router = APIRouter()

@router.get("/habitante/estado", response_model=EstadoResponse)
def get_estado(sector: str = "VN-CENTRO", session: Session = Depends(get_session)):
    repo = SQLiteRepository(session)
    sector_obj = repo.get_sector(sector)
    if not sector_obj:
        raise HTTPException(status_code=404, detail="Sector no encontrado")

    nodes = [n for n in repo.get_all_nodes() if n.sector_id == sector]
    latest = next(iter(nodes), None)

    ph = latest.ph if latest else None
    turbidity = latest.turbidity if latest else None
    status = WaterQualityService.determine_status(ph, turbidity or 0) if ph is not None else WaterStatus.Unknown

    alerts = [a for a in repo.get_alerts_by_sector(sector) if a.is_active]
    active = alerts[0] if alerts else None

    return EstadoResponse(
        sector_id=sector,
        sector_name=sector_obj.name,
        ph=ph,
        turbidity=turbidity,
        water_status=status.value,
        has_active_alert=bool(active),
        active_alert=AlertResponse(**active.model_dump()) if active else None,
    )

@router.get("/habitante/historial", response_model=List[AlertResponse])
def get_historial(sector: str = "VN-CENTRO", session: Session = Depends(get_session)):
    repo = SQLiteRepository(session)
    return [AlertResponse(**a.model_dump()) for a in repo.get_alerts_by_sector(sector)]
