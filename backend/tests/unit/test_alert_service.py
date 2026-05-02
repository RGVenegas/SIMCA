# backend/tests/unit/test_alert_service.py
from unittest.mock import MagicMock
from application.services.alert_service import AlertService
from domain.entities.alert import Alert
from domain.enums.alert_level import AlertLevel

def _make_alert(alert_id="abc-123", is_active=True):
    a = Alert(
        node_id="VN-01", sector_id="VN-CENTRO",
        level=AlertLevel.Critical, type="pH",
        message="test", trigger_value=9.0,
        sms_sent=1, is_active=is_active,
    )
    a.id = alert_id
    return a

def test_resolve_alert_calls_repository():
    repo = MagicMock()
    service = AlertService(alert_repo=repo)
    service.resolve_alert("abc-123")
    repo.resolve.assert_called_once_with("abc-123")

def test_get_active_alerts_returns_list():
    repo = MagicMock()
    repo.get_active_alerts.return_value = [_make_alert()]
    service = AlertService(alert_repo=repo)
    result = service.get_active_alerts()
    assert len(result) == 1
    assert result[0].level == AlertLevel.Critical
