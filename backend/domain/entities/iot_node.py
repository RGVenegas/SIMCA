from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from domain.enums.node_status import NodeStatus

class IoTNode(SQLModel, table=True):
    id: str = Field(primary_key=True)
    sector_id: str
    ph: Optional[float] = None
    turbidity: Optional[float] = None
    battery_percent: int = 0
    status: NodeStatus = NodeStatus.Offline
    last_ping: datetime = Field(default_factory=datetime.now)
