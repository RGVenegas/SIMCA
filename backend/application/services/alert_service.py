from typing import List
from domain.entities.alert import Alert
from domain.ports.i_alert_repository import IAlertRepository

class AlertService:
    def __init__(self, alert_repo: IAlertRepository):
        self._alert_repo = alert_repo

    def resolve_alert(self, alert_id: str) -> None:
        self._alert_repo.resolve(alert_id)

    def get_active_alerts(self) -> List[Alert]:
        return self._alert_repo.get_active_alerts()
