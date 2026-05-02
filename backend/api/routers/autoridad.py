from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session
from api.schemas.response_schemas import AlertResponse, DashboardResponse, NodeResponse
from application.services.alert_service import AlertService
from domain.enums.alert_level import AlertLevel
from domain.enums.node_status import NodeStatus
from infrastructure.database import get_session
from infrastructure.repositories.sqlite_repository import SQLiteRepository

router = APIRouter()

@router.get("/autoridad/dashboard", response_model=DashboardResponse)
def get_dashboard(session: Session = Depends(get_session)):
    repo = SQLiteRepository(session)
    nodes = repo.get_all_nodes()
    active_alerts = repo.get_active_alerts()
    all_alerts = repo.get_all(limit=100)

    online = [n for n in nodes if n.status != NodeStatus.Offline]
    ph_vals = [n.ph for n in nodes if n.ph is not None]
    today = datetime.now().date()
    month = datetime.now().month

    return DashboardResponse(
        ph_promedio=round(sum(ph_vals) / len(ph_vals), 2) if ph_vals else 0,
        turbidez_maxima=max((n.turbidity for n in nodes if n.turbidity), default=0),
        nodos_activos=len(online),
        total_nodos=len(nodes),
        nodos_offline=len(nodes) - len(online),
        alertas_hoy=sum(1 for a in all_alerts if a.created_at.date() == today),
        alertas_criticas=sum(1 for a in active_alerts if a.level == AlertLevel.Critical),
        alertas_warning=sum(1 for a in active_alerts if a.level == AlertLevel.Warning),
        alertas_este_mes=sum(1 for a in all_alerts if a.created_at.month == month),
        nodes=[NodeResponse(**n.model_dump()) for n in nodes],
        active_alerts=[AlertResponse(**a.model_dump()) for a in active_alerts],
        all_alerts=[AlertResponse(**a.model_dump()) for a in all_alerts],
    )

@router.get("/autoridad/sensores", response_model=List[NodeResponse])
def get_sensores(session: Session = Depends(get_session)):
    repo = SQLiteRepository(session)
    return [NodeResponse(**n.model_dump()) for n in repo.get_all_nodes()]

@router.get("/autoridad/alertas", response_model=List[AlertResponse])
def get_alertas(session: Session = Depends(get_session)):
    repo = SQLiteRepository(session)
    return [AlertResponse(**a.model_dump()) for a in repo.get_all()]

@router.post("/autoridad/alertas/{alert_id}/resolver")
def resolver_alerta(alert_id: str, session: Session = Depends(get_session)):
    repo = SQLiteRepository(session)
    AlertService(alert_repo=repo).resolve_alert(alert_id)
    return {"ok": True}

@router.get("/autoridad/reportes", response_model=List[AlertResponse])
def get_reportes(session: Session = Depends(get_session)):
    repo = SQLiteRepository(session)
    return [AlertResponse(**a.model_dump()) for a in repo.get_all(limit=200)]
