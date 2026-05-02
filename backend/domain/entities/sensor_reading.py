from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from domain.enums.water_status import WaterStatus

class SensorReading(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    node_id: str
    sector_id: str
    ph: float
    turbidity: float
    status: WaterStatus = WaterStatus.Unknown
    recorded_at: datetime = Field(default_factory=datetime.now)
