from datetime import datetime, timedelta
from typing import List, Optional
from sqlmodel import Session, select
from domain.entities.alert import Alert
from domain.entities.iot_node import IoTNode
from domain.entities.sector import Sector
from domain.entities.sensor_reading import SensorReading
from domain.ports.i_alert_repository import IAlertRepository
from domain.ports.i_sensor_repository import ISensorRepository

class SQLiteRepository(ISensorRepository, IAlertRepository):
    def __init__(self, session: Session):
        self._session = session

    # ISensorRepository
    def save(self, reading: SensorReading) -> None:
        self._session.add(reading)
        self._session.commit()
        self._session.refresh(reading)

    def get_by_sector(self, sector_id: str, hours: int = 24) -> List[SensorReading]:
        cutoff = datetime.now() - timedelta(hours=hours)
        return self._session.exec(
            select(SensorReading)
            .where(SensorReading.sector_id == sector_id)
            .where(SensorReading.recorded_at >= cutoff)
            .order_by(SensorReading.recorded_at)
        ).all()

    def get_all_nodes(self) -> List[IoTNode]:
        return self._session.exec(select(IoTNode)).all()

    def get_node(self, node_id: str) -> Optional[IoTNode]:
        return self._session.get(IoTNode, node_id)

    def update_node(self, node: IoTNode) -> None:
        self._session.add(node)
        self._session.commit()

    def get_all_sectors(self) -> List[Sector]:
        return self._session.exec(select(Sector)).all()

    def get_sector(self, sector_id: str) -> Optional[Sector]:
        return self._session.get(Sector, sector_id)

    # IAlertRepository
    def save_alert(self, alert: Alert) -> None:
        self._session.add(alert)
        self._session.commit()

    def get_active_alerts(self) -> List[Alert]:
        return self._session.exec(
            select(Alert)
            .where(Alert.is_active == True)
            .order_by(Alert.created_at.desc())
        ).all()

    def get_all(self, limit: int = 50) -> List[Alert]:
        return self._session.exec(
            select(Alert).order_by(Alert.created_at.desc()).limit(limit)
        ).all()

    def get_alerts_by_sector(self, sector_id: str) -> List[Alert]:
        return self._session.exec(
            select(Alert)
            .where(Alert.sector_id == sector_id)
            .order_by(Alert.created_at.desc())
        ).all()

    def resolve(self, alert_id: str) -> None:
        alert = self._session.get(Alert, alert_id)
        if alert:
            alert.is_active = False
            alert.resolved_at = datetime.now()
            self._session.add(alert)
            self._session.commit()
