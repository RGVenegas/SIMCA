import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from domain.enums.alert_level import AlertLevel

class Alert(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    node_id: str
    sector_id: str
    level: AlertLevel
    type: str
    message: str
    trigger_value: float
    sms_sent: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None
