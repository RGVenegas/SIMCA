from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class SectorResponse(BaseModel):
    id: str
    name: str
    comuna: str
    population: int

class NodeResponse(BaseModel):
    id: str
    sector_id: str
    ph: Optional[float]
    turbidity: Optional[float]
    battery_percent: int
    status: str
    last_ping: datetime

class AlertResponse(BaseModel):
    id: str
    node_id: str
    sector_id: str
    level: str
    type: str
    message: str
    trigger_value: float
    sms_sent: int
    is_active: bool
    created_at: datetime
    resolved_at: Optional[datetime]

class EstadoResponse(BaseModel):
    sector_id: str
    sector_name: str
    ph: Optional[float]
    turbidity: Optional[float]
    water_status: str
    has_active_alert: bool
    active_alert: Optional[AlertResponse]

class DashboardResponse(BaseModel):
    ph_promedio: float
    turbidez_maxima: float
    nodos_activos: int
    total_nodos: int
    nodos_offline: int
    alertas_hoy: int
    alertas_criticas: int
    alertas_warning: int
    alertas_este_mes: int
    nodes: List[NodeResponse]
    active_alerts: List[AlertResponse]
    all_alerts: List[AlertResponse]

class GraficosResponse(BaseModel):
    sector_id: str
    labels: List[str]
    ph: List[float]
    turbidity: List[float]
