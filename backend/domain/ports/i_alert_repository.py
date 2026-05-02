from abc import ABC, abstractmethod
from typing import List
from domain.entities.alert import Alert

class IAlertRepository(ABC):
    @abstractmethod
    def save_alert(self, alert: Alert) -> None: ...

    @abstractmethod
    def get_active_alerts(self) -> List[Alert]: ...

    @abstractmethod
    def get_all(self, limit: int = 50) -> List[Alert]: ...

    @abstractmethod
    def get_alerts_by_sector(self, sector_id: str) -> List[Alert]: ...

    @abstractmethod
    def resolve(self, alert_id: str) -> None: ...
