from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from api.schemas.response_schemas import AlertResponse, EstadoResponse
from application.services.water_quality_service import WaterQualityService
from domain.enums.node_status import NodeStatus
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

    sector_nodes = [n for n in repo.get_all_nodes() if n.sector_id == sector]
    active_node_ids = {n.id for n in sector_nodes if n.status != NodeStatus.Offline}

    # si no hay nodos activos no podemos saber si hay contaminación
    if not active_node_ids:
        return EstadoResponse(
            sector_id=sector,
            sector_name=sector_obj.name,
            ph=None,
            turbidity=None,
            water_status=WaterStatus.Unknown.value,
            has_active_alert=False,
            active_alert=None,
        )

    # tomamos la última lectura de un nodo activo para mostrar valores coherentes
    readings = repo.get_by_sector(sector, hours=24)
    active_readings = [r for r in readings if r.node_id in active_node_ids]
    latest_reading = active_readings[-1] if active_readings else None

    if latest_reading:
        ph = latest_reading.ph
        turbidity = latest_reading.turbidity
    else:
        nodes_with_data = sorted(
            [n for n in sector_nodes if n.id in active_node_ids and n.ph is not None],
            key=lambda n: n.last_ping, reverse=True
        )
        node = nodes_with_data[0] if nodes_with_data else None
        ph = node.ph if node else None
        turbidity = node.turbidity if node else None

    status = WaterQualityService.determine_status(ph, turbidity or 0) if ph is not None else WaterStatus.Unknown

    # solo nos importan alertas de nodos que están vivos
    all_active_alerts = repo.get_active_alerts_by_sector(sector)
    valid_alerts = [a for a in all_active_alerts if a.node_id in active_node_ids]
    active = valid_alerts[0] if valid_alerts else None

    # si hay alerta activa esa manda: mostramos su valor en vez del último leído
    if active:
        level = active.level.upper() if isinstance(active.level, str) else active.level.value.upper()
        if level == "CRITICAL":
            status = WaterStatus.Contaminated
            if active.type == "pH":
                ph = active.trigger_value
            elif active.type == "Turbidez":
                turbidity = active.trigger_value
        elif level == "WARNING":
            status = WaterStatus.Warning
            if active.type == "Turbidez":
                turbidity = active.trigger_value

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
