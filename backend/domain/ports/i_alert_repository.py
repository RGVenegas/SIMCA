from abc import ABC, abstractmethod
from typing import List
from domain.entities.alert import Alert

class IAlertRepository(ABC):
    @abstractmethod
    def save_alert(self, alert: Alert) -> None: ...

    @abstractmethod
    def get_active_alerts(self) -> List[Alert]: ...

    @abstractmethod
    def get_all(self, hours: int = 12) -> List[Alert]: ...

    @abstractmethod
    def get_alerts_by_sector(self, sector_id: str) -> List[Alert]: ...

    @abstractmethod
    def resolve(self, alert_id: str) -> None: ...

    @abstractmethod
    def resolve_all_for_node(self, node_id: str) -> None: ...

    @abstractmethod
    def delete_old_alerts(self, hours: int = 12) -> None: ...
